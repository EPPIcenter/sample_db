# sample_db -- A Sample Tracking Database
# Copyright (C) 2017  Maxwell Murphy, Jordan Wilheim
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published
# by the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.

import datetime
from contextlib import contextmanager
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm.exc import NoResultFound

from models import Base, Study, StudySubject, Specimen, MatrixPlate, MatrixTube, SpecimenType, Location

Session = sessionmaker()


class SampleDB(object):
    def __init__(self, conn_string, **kwargs):
        """
        SampleDB takes as an arg a connection string that describes the database to connect to, of the type used
        by SQLAlchemy.
        :param conn_string:
        :param kwargs:
        """
        self._conn_string = conn_string
        self.engine = create_engine(conn_string, **kwargs)
        Base.metadata.create_all(self.engine)
        self._session = Session(bind=self.engine)

    @contextmanager
    def _session_scope(self):
        """
        Context manager that creates a scope that rolls back database on errors and commits on completion.
        usage:

        >>  with self.session_scope() as _session:
        >>      ...

        """
        try:
            yield self._session
            self._session.commit()
        except:
            self._session.rollback()
            raise

    def create_study(self, title, short_code, is_longitudinal, lead_person, description=None, **kwargs):
        # type: (str, str, bool, str, str) -> Study
        """
        :param title: Unique title of study
        :param short_code: Unique short code to refer to the study
        :param is_longitudinal: Boolean indicating if study is longitudinal
        :param lead_person: Person responsible for project
        :param description: Optional longer description of project
        :return: Newly created study.
        """
        with self._session_scope() as session:
            study = Study(title=title, short_code=short_code, is_longitudinal=is_longitudinal, lead_person=lead_person,
                          description=description)  # type: Study
            session.add(study)
        return study

    def get_study(self, study_id):
        # type: (int) -> tuple[Study, list[StudySubject], list[Specimen], list[MatrixTube]]
        """
        Get a study
        :param study_id: study ID
        :return: Study with short code.
        """
        with self._session_scope() as session:
            study = session.query(Study).get(study_id)  # type: Study
            study_subjects = session.query(StudySubject).filter(StudySubject.study_id == study_id).all() # type: list[StudySubject]
            specimens = session.query(Specimen).join(StudySubject).filter(StudySubject.study_id == study_id).all() # type: list[Specimen]
            matrix_tubes = session.query(MatrixTube).join(Specimen).join(StudySubject).filter(StudySubject.study_id == study_id).all()
        return study, study_subjects, specimens, matrix_tubes

    @staticmethod
    def _get_study_by_short_code(session, short_code):
        study = session.query(Study).filter(Study.short_code == short_code).one()
        return study

    def edit_study(self, study):
        # type: (Study) -> tuple[Study, list[StudySubject], list[Specimen], list[MatrixTube]]
        with self._session_scope() as session:
            old_study = session.query(Study).get(study.id)
            old_study.title = study.title
            old_study.description = study.description
            old_study.short_code = study.short_code
            old_study.is_longitudinal = study.is_longitudinal
            old_study.lead_person = study.lead_person
            study_subjects = session.query(StudySubject).filter(StudySubject.study_id == old_study.id).all() # type: list[StudySubject]
            specimens = session.query(Specimen).join(StudySubject).filter(StudySubject.study_id == old_study.id).all() # type: list[Specimen]
            matrix_tubes = session.query(MatrixTube).join(Specimen).join(StudySubject).filter(StudySubject.study_id == old_study.id).all()
        return old_study, study_subjects, specimens, matrix_tubes

    def update_study(self, id, d):
        # type: (int, dict) -> tuple[Study, list[StudySubject], list[Specimen], list[MatrixTube]]
        with self._session_scope() as session:
            with session.no_autoflush:
                study = session.query(Study).get(id)
                study.update(d)
            study_subjects = session.query(StudySubject).filter(
                StudySubject.study_id == study.id).all()  # type: list[StudySubject]
            specimens = session.query(Specimen).join(StudySubject).filter(
                StudySubject.study_id == study.id).all()  # type: list[Specimen]
            matrix_tubes = session.query(MatrixTube).join(Specimen).join(StudySubject).filter(
                StudySubject.study_id == study.id).all()
        return study, study_subjects, specimens, matrix_tubes

    def delete_study(self, study):
        # type: (Study) -> boolean
        with self._session_scope() as session:
            s = session.query(Study).get(study.id)
            session.delete(s)
        return True

    def get_studies(self):
        # type () -> list[Study]
        """
        Get list of all studies
        :return: List of Studies
        """
        with self._session_scope() as session:
            studies = session.query(Study).all()
        return studies

    def get_study_subjects(self, study_id):
        # type: (id) -> list[StudySubject]
        """
        Get study_subjects registered in a study.
        :param study_id: Study ID
        :return: StudySubject[]
        """
        with self._session_scope() as session:
            study_subjects = session.query(StudySubject).join(Study).filter(Study.id == study_id).all()
        return study_subjects

    def add_study_subject(self, uid, study_id):
        # type: (str, int) -> StudySubject
        """
        Add a new study_subject to a study.
        :param uid: unique identifier for study_subject in study.
        :param study_id: Study ID
        :return: Individual
        """
        with self._session_scope() as session:
            study_subject = self._add_study_subject(session, study_id, uid)
        return study_subject

    @staticmethod
    def _add_study_subject(session, study_id, uid):
        study = session.query(Study).get(study_id)
        study_subject = StudySubject(uid=uid, study_id=study.id)
        session.add(study_subject)
        return study_subject

    def add_study_subjects(self, uids, study_id):
        # type: (list[str], int) -> list[StudySubject]
        """
        Add a collection of study_subjects to a study.
        :param uids: list of unique individual identifiers in a study.
        :param study_id: Study ID
        :return: Individual[]
        """
        with self._session_scope() as session:
            study = session.query(Study).get(study_id)
            study_subjects = [StudySubject(uid=_, study_id=study.id) for _ in uids]
            map(session.add, study_subjects)
        return study_subjects

    def delete_study_subject(self, study_subject_id):
        with self._session_scope() as session:
            study_subject = session.query(StudySubject).get(study_subject_id) # type: StudySubject
            if not study_subject:
                raise NoResultFound
            if study_subject.specimens:
                raise ValueError("Cannot delete study subject with associated specimens.")
            session.delete(study_subject)
        return True


    def register_new_location(self, description, **kwargs):
        # type: (str) -> Location
        """
        Register a new storage location.
        :param description: A short, unique description of the location.
        :return: Location
        """
        with self._session_scope() as session:
            location = Location(description=description)
            session.add(location)
        return location

    def get_locations(self):
        # type: () -> list[Location]
        """
        Get the list of all registered storage locations.
        :return: Location[]
        """
        with self._session_scope() as session:
            locations = session.query(Location).all()
        return locations

    def get_location(self, id):
        # type: (int) -> Location
        """
        Get a single location with the id.
        :param id: Location ID
        :return: Location
        """
        with self._session_scope() as session:
            location = session.query(Location).get(id)
        return location

    def update_location(self, id, d):
        # type: (int, dict) -> Location
        with self._session_scope() as session:
            location = session.query(Location).get(id)
            location.update(d)
        return location

    def delete_location(self, id):
        # type: (int) -> Boolean
        with self._session_scope() as session:
            location = session.query(Location).get(id)
            session.delete(location)
        return True

    def register_new_specimen_type(self, label, **kwargs):
        # type: (str) -> SpecimenType
        """
        Register a new specimen type
        :param label: A short, unique description of the specimen type.
        :return: SpecimenType
        """
        with self._session_scope() as session:
            specimen_type = SpecimenType(label=label)
            session.add(specimen_type)
        return specimen_type

    def get_specimen_types(self):
        # type: () -> list[SpecimenType]
        """
        Get the list of all registered specimen types.
        :return: SpecimenType[]
        """
        with self._session_scope() as session:
            specimen_types = session.query(SpecimenType).all()
        return specimen_types

    def get_specimen_type(self, id):
        # type: (int) -> SpecimenType
        with self._session_scope() as session:
            specimen_type = session.query(SpecimenType).get(id)
        return specimen_type

    def update_specimen_type(self, id, d):
        # type: (int, dict) -> SpecimenType
        with self._session_scope() as session:
            specimen_type = session.query(SpecimenType).get(id)
            specimen_type.update(d)
        return specimen_type

    def delete_specimen_type(self, id):
        # type: (int) -> Boolean
        with self._session_scope() as session:
            specimen_type = session.query(SpecimenType).get(id)
            session.delete(specimen_type)
        return True

    @staticmethod
    def _get_specimen(session, uid, short_code, specimen_type, collection_date):
        # type: (Session, str, str, str, datetime.date) -> Specimen
        """
        Unmanaged function to get a specimen given the provided arguments.
        :param session: The _session to use for querying the database.
        :param uid: Unique ID identifying the study subject
        :param short_code: Short code identifying the study the subject is a part of.
        :param specimen_type: The label describing the specimen type.
        :param collection_date: The date of collection. Required for longitudinal studies.
        :return: Specimen
        """
        specimen_query = session.query(Specimen).join(StudySubject).filter(StudySubject.uid == uid).join(Study).\
            filter(Study.short_code == short_code).join(SpecimenType).filter(SpecimenType.label == specimen_type)

        if collection_date:
            specimen_query = specimen_query.filter(Specimen.collection_date == collection_date.date())

        return specimen_query.one()

    @staticmethod
    def _add_specimen(session, uid, short_code, specimen_type, collection_date=None):
        # type: (Session, str, str, str, datetime.date, Optional[str]) -> Specimen
        """
        Unmanaged function to add a new specimen to a study subject
        :param session: The _session to use for querying the database.
        :param uid: Unique ID identifying the study subject.
        :param short_code: Short code identifying the study the study subject is a part of.
        :param specimen_type: The label describing the specimen type.
        :param collection_date: The date of collection. Required for longitudinal studies.
        :return: Specimen
        """
        study_subject = session.query(StudySubject).join(Study).filter(Study.short_code == short_code)\
            .filter(StudySubject.uid == uid).one()
        specimen_type = session.query(SpecimenType).filter(SpecimenType.label == specimen_type).one()
        specimen = Specimen()
        specimen.study_subject = study_subject
        specimen.specimen_type = specimen_type
        specimen.collection_date = collection_date
        session.add(specimen)
        return specimen

    def get_specimens(self, uid, short_code, collection_date=None):
        """
        Get all specimens associated with a study subject
        :param uid: Unique ID identifying the study subject.
        :param short_code: Short code identifying the study the study subject is a part of.
        :param collection_date: Optional date on which the specimen was collected.
        :return:
        """
        with self._session_scope() as session:
            specimen_query = session.query(Specimen).join(StudySubject).filter(StudySubject.uid == uid)\
                .join(Study).filter(Study.short_code == short_code)

            if collection_date:
                specimen_query = specimen_query.filter(Specimen.collection_date == collection_date)
            specimens = specimen_query.all()
        return specimens

    def get_matrix_plates(self):
        with self._session_scope() as session:
            matrix_plates = session.query(MatrixPlate).all()
        return matrix_plates

    def get_matrix_plate(self, plate_id):
        with self._session_scope() as session:
            plate = session.query(MatrixPlate).get(plate_id)
            study_subjects = session.query(StudySubject).join(Specimen).join(MatrixTube).join(MatrixPlate).\
                filter(MatrixPlate.id == plate_id).all()
            specimens = session.query(Specimen).join(MatrixTube).join(MatrixPlate).filter(MatrixPlate.id == plate_id).all()
        return plate, study_subjects, specimens, plate.tubes

    def add_matrix_plate_with_specimens(self, plate_uid, location_id, specimen_entries, create_missing_specimens=False,
                                        create_missing_subjects=False):
        # type: (str, int, list(dict)) -> list(MatrixTube)
        """
        Add a new matrix plate with new specimens
        :param plate_uid: Unique Plate ID.
        :param location_id: ID specifying the location.
        :param specimen_entries: list of specimen entries
            specimen_entry -> {
                'uid': Unique study subject ID,
                'short_code': Unique study short code,
                'specimen_type': String descriptor of specimen, must be registered,
                'collection_date': Optional date of collection,
                'barcode': Matrix tube barcode,
                'well_position': Well position in plate,
                'comments': Optional comments about matrix tube
            }
        :param create_missing_specimens: If specimen for subject missing in study, create if true
        :param create_missing_subjects: If subjects missing in study, create if true
        :return: List of added MatrixTubes.
        """
        matrix_tubes = []
        study_subjects = []
        specimens = []
        with self._session_scope() as session:
            try:
                matrix_plate = session.query(MatrixPlate).filter(MatrixPlate.uid == plate_uid).one()
            except NoResultFound:
                matrix_plate = MatrixPlate(uid=plate_uid, location_id=location_id)
                session.add(matrix_plate)
                session.flush()
            for specimen_entry in specimen_entries:
                uid = specimen_entry['uid']
                short_code = specimen_entry['short_code']
                specimen_type = specimen_entry['specimen_type']
                collection_date = specimen_entry.get('collection_date')
                study = self._get_study_by_short_code(session, short_code)
                try:
                    specimen = self._get_specimen(session, uid, short_code, specimen_type, collection_date)
                except NoResultFound:
                    if create_missing_specimens:
                        try:
                            specimen = self._add_specimen(session, uid, short_code, specimen_type, collection_date)
                        except NoResultFound:
                            if create_missing_subjects:
                                self._add_study_subject(session, study.id, uid)
                                session.flush()
                                specimen = self._add_specimen(session, uid, short_code, specimen_type, collection_date)
                            else:
                                raise ValueError("Sample {} in Study {} does not exist.".format(uid, short_code))
                    else:
                        raise ValueError(
                            "{} Specimen for Sample {} does not exist in Study {}".format(specimen_type, uid,
                                                                                          short_code))
                session.flush()

                barcode = specimen_entry['barcode']
                well_position = specimen_entry['well_position']
                comments = specimen_entry.get('comments')
                matrix_tube = MatrixTube(barcode=barcode, comments=comments, well_position=well_position)
                matrix_tube.plate = matrix_plate
                matrix_tube.specimen = specimen
                session.add(matrix_tube)
                matrix_tubes.append(matrix_tube)
            study_subjects = session.query(StudySubject).join(Specimen).join(MatrixTube).\
                filter(MatrixTube.plate_id == matrix_plate.id).all()
            specimens = session.query(Specimen).join(MatrixTube).filter(MatrixTube.plate_id == matrix_plate.id).all()
        return matrix_plate, study_subjects, specimens, matrix_tubes

    def update_matrix_tube_locations(self, matrix_tube_entries):
        # type: (list(dict)) -> list(MatrixTube)
        """
        Update locations of matrix tubes.
        :param matrix_tube_entries: list of matrix_tube_entries:
            matrix_tube_entry -> {
                'barcode': Unique tube barcode,
                'plate_uid': Unique Plate ID matrix tube is going into,
                'well_position': New matrix tube position,
                'comments': Optional comments
            }
        :return:
        """
        matrix_tubes = []
        with self._session_scope() as session:
            with session.no_autoflush:
                temp_matrix_tube_map = {}
                matrix_plates = []
                study_subjects = []
                specimens = []
                for matrix_tube_entry in matrix_tube_entries:
                    barcode = matrix_tube_entry['barcode']
                    plate_uid = matrix_tube_entry['plate_uid']

                    # Yes, this looks weird, but it's necessary to be able to move tubes around. Essentially every tube is
                    # being moved to a temporary "mirror" state, where the well position is prefixed with a '-'. After that
                    # is complete, they're moved to their proper true well position without the prefixed '-'. If we try to
                    # do an in-place move, the unique constraint of the database triggers and throws an error. This is only
                    # a problem in MySQL and SQLITE.

                    well_position = '-' + matrix_tube_entry['well_position']
                    temp_matrix_tube_map[barcode] = matrix_tube_entry['well_position']

                    comments = matrix_tube_entry.get('comments')
                    try:
                        matrix_tube = session.query(MatrixTube).filter(MatrixTube.barcode == barcode).one()  # type: MatrixTube
                    except NoResultFound:
                        raise NoResultFound('Matrix Tube with barcode {} does not exist.'.format(barcode))
                    old_plate = matrix_tube.plate

                    try:
                        destination_plate = session.query(MatrixPlate).filter(MatrixPlate.uid == plate_uid).one()  # type: MatrixPlate
                    except NoResultFound:
                        raise NoResultFound('Matrix plate with UID {} does not exist.'.format(plate_uid))
                    matrix_tube.plate = destination_plate
                    matrix_tube.well_position = well_position
                    if comments:
                        matrix_tube.comments = comments
                    matrix_tubes.append(matrix_tube)
                    matrix_plates += [old_plate, destination_plate]
                    study_subjects.append(matrix_tube.specimen.study_subject)
                    specimens.append(matrix_tube.specimen)
                session.flush()
                # Do the proper remapping
                for tube in matrix_tubes:
                    tube.well_position = temp_matrix_tube_map[tube.barcode]
                matrix_plates = list(set(matrix_plates))
                study_subjects = list(set(study_subjects))
                specimens = list(set(specimens))
            session.flush()
        return matrix_plates, study_subjects, specimens, matrix_tubes

    def delete_plate(self, plate_id):
        with self._session_scope() as session:
            matrix_plate = session.query(MatrixPlate).get(plate_id)
            session.delete(matrix_plate)
        return True

    def hide_plates(self, plate_ids):
        plates = []
        with self._session_scope() as session:
            for plate_id in plate_ids:
                plate = session.query(MatrixPlate).get(plate_id)
                plate.hidden = True
                plates.append(plate)
        return plates

    def unhide_plates(self, plate_ids):
        plates = []
        with self._session_scope() as session:
            for plate_id in plate_ids:
                plate = session.query(MatrixPlate).get(plate_id)
                plate.hidden = False
                plates.append(plate)
        return plates

    def find_specimens(self, specimen_entries, date_format="%d/%m/%Y"):
        results = []
        with self._session_scope() as session:
            for specimen_entry in specimen_entries:
                uid = specimen_entry['uid']
                short_code = specimen_entry['short_code']
                specimen_type = specimen_entry['specimen_type']
                collection_date = specimen_entry.get('collection_date')
                try:
                    specimen = self._get_specimen(session, uid, short_code, specimen_type, collection_date)
                    specimen_matrix_tubes = [_ for _ in specimen.storage_containers if _.discriminator == 'matrix_tube']
                except NoResultFound:
                    specimen_matrix_tubes = []
                for matrix_tube in specimen_matrix_tubes:
                    r = {
                        'UID': uid,
                        'Study Short Code': short_code,
                        'Specimen Type': specimen_type,
                        'Plate UID': matrix_tube.plate.uid,
                        'Well': matrix_tube.well_position,
                        'Comments': matrix_tube.comments
                    }
                    if collection_date:
                        r.update({'Date': datetime.datetime.strftime(collection_date, date_format)})
                    results.append(r)
                if not specimen_matrix_tubes:
                    r = {
                        'UID': uid,
                        'Study Short Code': short_code,
                        'Specimen Type': specimen_type,
                        'Plate UID': 'Specimen not found',
                        'Well': '',
                        'Comments': ''
                    }
                    if collection_date:
                        r.update({'Date': datetime.datetime.strftime(collection_date, date_format)})
                    results.append(r)
        return results

    def get_matrix_tubes_from_specimens(self, specimen_entries):
        results = []
        with self._session_scope() as session:
            for entry in specimen_entries:
                uid = entry['uid']
                short_code = entry['short_code']
                specimen_type = entry['specimen_type']
                collection_date = entry.get('collection_date')
                try:
                    specimen = self._get_specimen(session, uid, short_code, specimen_type, collection_date)
                    specimen_matrix_tubes = [_ for _ in specimen.storage_containers if _.discriminator == 'matrix_tube']
                except NoResultFound:
                    specimen_matrix_tubes = []
                results += specimen_matrix_tubes
        return results

    @staticmethod
    def _get_matrix_tube(session, matrix_tube_barcode):
        # type: (Session, str) -> MatrixTube
        """
        Unmanaged function to get a matrix tube from a barcode.
        :param session: The _session to use for querying the database.
        :param matrix_tube_barcode: Unique barcode identifying matrix tube.
        :return: The corresponding MatrixTube
        """
        matrix_tube = session.query(MatrixTube).filter(MatrixTube.barcode == matrix_tube_barcode).one()
        return matrix_tube

    def get_matrix_tube(self, matrix_tube_barcode):
        # type: (str) -> MatrixTube
        """
        Get a matrix tube with a corresponding barcode.
        :param matrix_tube_barcode: Unique barcode identifying a matrix tube.
        :return: The corresponding MatrixTube
        """
        with self._session_scope() as session:
            matrix_tube = self._get_matrix_tube(session, matrix_tube_barcode)
        return matrix_tube

    def get_matrix_tubes(self, matrix_tube_barcodes):
        # type: (list(str)) -> list(MatrixTube)
        """
        Get matrix tubes from list of barcodes
        :param matrix_tube_barcodes: List of unqiue barcodes identifying matrix tubes.
        :return: List of MatrixTubes
        """
        with self._session_scope() as session:
            matrix_tubes = [self._get_matrix_tube(session, _) for _ in matrix_tube_barcodes]
        return matrix_tubes

    def set_matrix_tubes_exhausted(self, matrix_tube_barcodes):
        """
        Set a matrix tube as exhausted.
        :param matrix_tube_barcodes: Unique barcodes identifying a matrix tube.
        :return: The corresponding MatrixTube that has been set to exhausted.
        """
        with self._session_scope() as session:
            for matrix_tube_barcode in matrix_tube_barcodes:
                matrix_tube = self._get_matrix_tube(session, matrix_tube_barcode)
                matrix_tube.exhausted = True
        return matrix_tube

    def unset_matrix_tubes_exhausted(self, matrix_tube_barcodes):
        """
        Unset a matrix tube as exhausted.
        :param matrix_tube_barcodes: Unique barcodes identifying a matrix tube.
        :return: The corresponding MatrixTube that has been unset as exhausted.
        """
        with self._session_scope() as session:
            for matrix_tube_barcode in matrix_tube_barcodes:
                matrix_tube = self._get_matrix_tube(session, matrix_tube_barcode)
                matrix_tube.exhausted = False
        return matrix_tube

    def convert_barcoded_entries(self, barcoded_entries, date_format="%d/%m/%Y"):
        results = []
        with self._session_scope() as session:
            for entry in barcoded_entries:
                barcode = entry.pop('barcode')
                try:
                    matrix_tube = self._get_matrix_tube(session, barcode)
                    entry['Study Subject UID'] = matrix_tube.specimen.study_subject.uid
                    entry['Specimen Type'] = matrix_tube.specimen.specimen_type.label
                    entry['Study Short Code'] = matrix_tube.specimen.study_subject.study.short_code
                    entry['Comments'] = matrix_tube.comments
                    if matrix_tube.specimen.collection_date:
                        entry['Date'] = datetime.date.strftime(matrix_tube.specimen.collection_date, date_format)
                except NoResultFound:
                    entry['Study Subject UID'] = "Barcode ({}) Not Found".format(barcode)
                    entry['Specimen Type'] = ""
                    entry['Study Short Code'] = ""
                    entry['Comments'] = ""
                results.append(entry)
        return results

    def delete_matrix_tubes_and_specimens(self, matrix_tubes, specimens):
        with self._session_scope() as session:
            matrix_tube_ids = list(set([_.id for _ in matrix_tubes]))
            specimen_ids = list(set([_.id for _ in specimens]))
            with session.no_autoflush:
                for matrix_tube in matrix_tubes:
                    session.delete(matrix_tube)
                for specimen in specimens:
                    session.delete(specimen)
        return matrix_tube_ids, specimen_ids

    def delete_matrix_tubes(self, matrix_tubes):
        with self._session_scope() as session:
            matrix_tube_ids = list(set([_.id for _ in matrix_tubes]))
            specimens = []
            for matrix_tube in matrix_tubes:
                specimen = matrix_tube.specimen
                specimen_matrix_tube_ids = [_.id for _ in specimen.storage_containers if _.discriminator == 'matrix_tube']
                if set(specimen_matrix_tube_ids).issubset(matrix_tube_ids):
                    specimens.append(specimen)
            specimen_ids = list(set([_.id for _ in specimens]))
            with session.no_autoflush:
                for matrix_tube in matrix_tubes:
                    session.delete(matrix_tube)
                for specimen in specimens:
                    session.delete(specimen)
        return matrix_tube_ids, specimen_ids
