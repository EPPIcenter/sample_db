from flask import Flask
from config import config
from utils import backup_db
import os
# conf = config['Production']
# conf = config['Development']

conf = config[os.environ.get('CONFIG', 'Development')]

from app import SampleDB

app = Flask(__name__)
app.config.from_object(conf)

backup_db(conf.DB_PATH, conf.BACKUP_PATH, conf.BACKUP_DATE_FORMAT)

db = SampleDB(conf.SQLALCHEMY_DATABASE_URI)

from sample_db import views

