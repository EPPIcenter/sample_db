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

from sqlalchemy import create_engine
from models import Study, Sample, MatrixPlate, MatrixTube, SpecimenType


class SampleDB(object):
    def __init__(self, conn_string, **kwargs):
        self.engine = create_engine(conn_string)

    def add_sample(self, uid, study, date=None):
        """

        :param uid:
        :param study:
        :param date:
        :return:
        """

    def add_samples(self, samples):
        """
        :param samples: List of samples to be added to database.
        :type samples: list[(string, string, datetime) | (string, string)]
        :return:
        """


    def add_study(self, title, short_code, is_longitudinal, lead_person, description=None):
        """
        :param title: Unique title of study
        :param short_code: Unique short code to refer to the study
        :param is_longitudinal: Boolean indicating if study is longitudinal
        :param lead_person: Person responsible for project
        :param description: Optional longer description of project
        :return:
        """



