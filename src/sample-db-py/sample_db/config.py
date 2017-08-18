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

import os
import logging

basedir = os.path.abspath(os.path.dirname(__file__))
prod_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
major_version = 'v1'
version = 'v1.1.5'
app_dir = 'com.greenhouse.sampledb'

if os.sys.platform == 'darwin':
    APPDATA = os.path.join(os.environ.get('HOME'), 'Library', 'Application Support', app_dir, major_version)
elif os.sys.platform == 'win32':
    APPDATA = os.path.join(os.environ.get('LOCALAPPDATA'), app_dir, major_version)

if not os.path.exists(APPDATA):
    os.makedirs(APPDATA)


class Config:
    DEBUG = False
    SQLALCHEMY_COMMIT_ON_TEARDOWN = True
    SQLALCHEMY_RECORD_QUERIES = True
    BACKUP_DATE_FORMAT = "%d-%b-%y"

    # Logging

    LOGGING_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'


class DevelopmentConfig(Config):
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.environ.get('DEV_DATABASE_URL') or 'sqlite:///' + os.path.join(basedir,
                                                                                                'dev_sample_db.sqlite')
    DB_PATH = os.path.join(basedir, 'dev_sample_db.sqlite')
    BACKUP_PATH = os.path.join(basedir, 'db_backups')
    ASSETS_PATH = os.path.join(basedir, 'static')
    SQLALCHEMY_ECHO = True
    LOGGING_LOCATION = os.path.join(basedir, 'app.log')
    LOGGING_LEVEL = logging.DEBUG


class ProductionConfig(Config):
    SQLALCHEMY_DATABASE_URI = os.environ.get('PROD_DATABASE_URL') or 'sqlite:///' + os.path.join(APPDATA,
                                                                                                 'sample_db.sqlite')
    DB_PATH = os.path.join(APPDATA, 'sample_db.sqlite')
    BACKUP_PATH = os.path.join(APPDATA, 'db_backups')

    ASSETS_PATH = os.path.join(prod_dir, 'static')
    LOGGING_LOCATION = os.path.join(prod_dir, 'app.log')
    LOGGING_LEVEL = logging.ERROR


config = {
    'Production': ProductionConfig,
    'Development': DevelopmentConfig
}
