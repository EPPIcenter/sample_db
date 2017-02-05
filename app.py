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

from contextlib import contextmanager
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, Study, StudySubject, Specimen, MatrixPlate, MatrixTube, SpecimenType

Session = sessionmaker()


class SampleDB(object):
    def __init__(self, conn_string, **kwargs):
        """
        SampleDB takes as an arg a connection string that describes the database to connect to, of the type used
        by SQLAlchemy.
        :param conn_string:
        :param kwargs:
        """
        self.engine = create_engine(conn_string)
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
        pass

    def get_locations(self):
        pass

    def register_new_specimen_type(self, label):
        pass

    def get_specimen_types(self):
        pass

    def add_specimen(self, uid, study_code, specimen_type):
        pass



