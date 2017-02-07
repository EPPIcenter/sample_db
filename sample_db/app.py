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
        self.engine = create_engine(conn_string, **kwargs)
        Base.metadata.create_all(self.engine)
        self.session = Session(bind=self.engine)

    @contextmanager
    def session_scope(self):
        """
        Context manager that creates a scope that rolls back database on errors and commits on completion.
        usage:

        >>  with self.session_scope() as session:
        >>      ...

        """
        try:
            yield self.session
            self.session.commit()
        except:
            self.session.rollback()
            raise

    def create_study(self, title, short_code, is_longitudinal, lead_person, description=None):
        # type: (str, str, bool, str, str) -> Study
        """
        :param title: Unique title of study
        :param short_code: Unique short code to refer to the study
        :param is_longitudinal: Boolean indicating if study is longitudinal
        :param lead_person: Person responsible for project
        :param description: Optional longer description of project
        :return: Newly created study.
        """
        with self.session_scope() as session:
            study = Study(title=title, short_code=short_code, is_longitudinal=is_longitudinal, lead_person=lead_person,
                          description=description)  # type: Study
            session.add(study)
        return study

    def get_study(self, short_code):
        # type: (str) -> Study
        """
        Get a study
        :param short_code: unique short code identifying a project.
        :return: Study with short code.
        """
        with self.session_scope() as session:
            study = session.query(Study).filter(Study.short_code == short_code).one()  # type: Study
        return study

    def get_study_subjects(self, short_code):
        # type: (str) -> list[StudySubject]
        """
        Get study_subjects registered in a study.
        :param short_code: unique short code identifying a project.
        :return: Individual[]
        """
        with self.session_scope() as session:
            study_subjects = session.query(StudySubject).join(Study).filter(Study.short_code == short_code).all()
        return study_subjects

    def add_study_subject(self, uid, short_code):
        # type: (str, str) -> StudySubject
        """
        Add a new study_subject to a study.
        :param uid: unique identifier for study_subject in study.
        :param short_code: unique short code that identifies the study.
        :return: Individual
        """
        with self.session_scope() as session:
            study = session.query(Study).filter(Study.short_code == short_code).one()
            study_subject = StudySubject(uid=uid, study_id=study.id)
            session.add(study_subject)
        return study_subject

    def add_study_subjects(self, uids, short_code):
        # type: (list[str], str) -> list[StudySubject]
        """
        Add a collection of study_subjects to a study.
        :param uids: list of unique individual identifiers in a study.
        :param short_code: unique short code that identifies the study.
        :return: Individual[]
        """
        with self.session_scope() as session:
            study = self.get_study(short_code)
            study_subjects = [StudySubject(uid=_, study_id=study.id) for _ in uids]
            map(session.add, study_subjects)
        return study_subjects

    def register_new_location(self, description):
        # type: (str) -> Location
        """
        Register a new storage location.
        :param description: A short, unique description of the location.
        :return: Location
        """
        with self.session_scope() as session:
            location = Location(description=description)
            session.add(location)
        return location

    def get_locations(self):
        # type: () -> list[Location]
        """
        Get the list of all registered storage locations.
        :return: Location[]
        """
        with self.session_scope() as session:
            locations = session.query(Location).all()
        return locations

    def register_new_specimen_type(self, label):
        # type: (str) -> SpecimenType
        """
        Register a new specimen type
        :param label: A short, unique description of the specimen type.
        :return: SpecimenType
        """
        with self.session_scope() as session:
            specimen_type = SpecimenType(label=label)
            session.add(specimen_type)
        return specimen_type

    def get_specimen_types(self):
        # type: () -> list[SpecimenType]
        """
        Get the list of all registered specimen types.
        :return: SpecimenType[]
        """
        with self.session_scope() as session:
            specimen_types = session.query(SpecimenType).all()
        return specimen_types

    @staticmethod
    def _get_specimen(session, uid, short_code, specimen_type, collection_date):
        # type: (Session, str, str, str, str, datetime.date) -> Specimen
        """
        Unmanaged function to get a specimen given the provided arguments.
        :param session: The session to use for querying the database.
        :param uid: Unique ID identifying the study subject
        :param short_code: Short code identifying the study the subject is a part of.
        :param specimen_type: The label describing the specimen type.
        :param collection_date: The date of collection. Required for longitudinal studies.
        :return: Specimen
        """
        specimen_query = session.query(Specimen).join(StudySubject).filter(StudySubject.uid == uid).join(Study).\
            filter(Study.short_code == short_code).join(SpecimenType).filter(SpecimenType.label == specimen_type)\
            .filter(Specimen.collection_date == collection_date)

        return specimen_query.one()

    @staticmethod
    def _add_specimen(session, uid, short_code, specimen_type, collection_date=None):
        # type: (Session, str, str, str, datetime.date, Optional[str]) -> Specimen
        """
        Unmanaged function to add a new specimen to a study subject
        :param session: The session to use for querying the database.
        :param uid: Unique ID identifying the study subject.
        :param short_code: Short code identifying the study the study subject is a part of.
        :param specimen_type: The label describing the specimen type.
        :param collection_date: The date of collection. Required for longitudinal studies.
        :param comments: Optional comment field about the specimen.
        :return: Specimen
        """
        study_subject = session.query(StudySubject).join(Study).filter(Study.short_code == short_code)\
            .filter(StudySubject.uid == uid).one()
        specimen_type = session.query(SpecimenType).filter(SpecimenType.label == specimen_type).one()
        specimen = Specimen()
        specimen.study_subject = study_subject
        specimen.specimen_type = specimen_type
        specimen.collection_date = collection_date
        return specimen

    def get_specimens(self, uid, short_code, collection_date=None):
        # type: (str, str, datetime.date) -> list(Specimen)
        """
        Get all specimens associated with a study subject
        :param uid: Unique ID identifying the study subject.
        :param short_code: Short code identifying the study the study subject is a part of.
        :param collection_date: Optional date on which the specimen was collected.
        :return:
        """
        with self.session_scope() as session:
            specimen_query = session.query(Specimen).join(StudySubject).filter(StudySubject.uid == uid)\
                .join(Study).filter(Study.short_code == short_code)

            if collection_date:
                specimen_query = specimen_query.filter(Specimen.collection_date == collection_date)
            specimens = specimen_query.all()
        return specimens

    def add_matrix_plate_with_specimens(self, plate_uid, location_id, specimen_entries):
        # type: (str, list(dict)) -> list(MatrixTube)
        """
        Add a new matrix plate with new specimens
        :param plate_uid: Unique Plate ID
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
        :return: List of added MatrixTubes.
        """
        matrix_tubes = []
        with self.session_scope() as session:
            try:
                matrix_plate = session.query(MatrixPlate).filter(MatrixPlate.uid == plate_uid).one()
            except NoResultFound:
                matrix_plate = MatrixPlate(uid=plate_uid, location_id=location_id)
                session.add(matrix_plate)

            for specimen_entry in specimen_entries:
                uid = specimen_entry['uid']
                short_code = specimen_entry['short_code']
                specimen_type = specimen_entry['specimen_type']
                collection_date = specimen_entry.get('collection_date')
                try:
                    specimen = self._get_specimen(session, uid, short_code, specimen_type, collection_date)
                except NoResultFound:
                    specimen = self._add_specimen(session, uid, short_code, specimen_type, collection_date)
                    session.add(specimen)
                    session.flush()

                barcode = specimen_entry['barcode']
                well_position = specimen_entry['well_position']
                comments = specimen_entry.get('comments')
                matrix_tube = MatrixTube(barcode=barcode, comments=comments, well_position=well_position)
                matrix_tube.plate = matrix_plate
                matrix_tube.specimen = specimen
                session.add(matrix_tube)
                matrix_tubes.append(matrix_tube)
        return matrix_tubes

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
        with self.session_scope() as session:
            temp_matrix_tube_map = {}
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

                matrix_tube = session.query(MatrixTube).filter(MatrixTube.barcode == barcode).one()  # type: MatrixTube
                destination_plate = session.query(MatrixPlate).filter(MatrixPlate.uid == plate_uid).one()  # type: MatrixPlate

                matrix_tube.plate = destination_plate
                matrix_tube.well_position = well_position
                if comments:
                    matrix_tube.comments = comments
                matrix_tubes.append(matrix_tube)

            # Do the proper remapping
            for tube in matrix_tubes:
                tube.well_position = temp_matrix_tube_map[tube.barcode]
        return matrix_tubes

    @staticmethod
    def _get_matrix_tube(session, matrix_tube_barcode):
        # type: (Session, str) -> MatrixTube
        """
        Unmanaged function to get a matrix tube from a barcode.
        :param session: The session to use for querying the database.
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
        with self.session_scope() as session:
            matrix_tube = self._get_matrix_tube(session, matrix_tube_barcode)
        return matrix_tube

    def get_matrix_tubes(self, matrix_tube_barcodes):
        # type: (list(str)) -> list(MatrixTube)
        """
        Get matrix tubes from list of barcodes
        :param matrix_tube_barcodes: List of unqiue barcodes identifying matrix tubes.
        :return: List of MatrixTubes
        """
        with self.session_scope() as session:
            matrix_tubes = [self._get_matrix_tube(session, _) for _ in matrix_tube_barcodes]
        return matrix_tubes

    def set_matrix_tube_exhausted(self, matrix_tube_barcode):
        """
        Set a matrix tube as exhausted.
        :param matrix_tube_barcode: Unique barcode identifying a matrix tube.
        :return: The corresponding MatrixTube that has been set to exhausted.
        """
        with self.session_scope() as session:
            matrix_tube = self._get_matrix_tube(session, matrix_tube_barcode)
            matrix_tube.exhausted = True
        return matrix_tube

    def unset_matrix_tube_exhausted(self, matrix_tube_barcode):
        """
        Unset a matrix tube as exhausted.
        :param matrix_tube_barcode: Unique barcode identifying a matrix tube.
        :return: The corresponding MatrixTube that has been unset as exhausted.
        """
        with self.session_scope() as session:
            matrix_tube = self._get_matrix_tube(session, matrix_tube_barcode)
            matrix_tube.exhausted = False
        return matrix_tube
