import os
from typing import Type, Union

from flask import Flask

from sample_db.db_impl.app import SampleDB
from sample_db.flask_impl.config import DevelopmentConfig, ProductionConfig, config
from sample_db.flask_impl.utils import backup_db

# import logging
# conf = config['Production']
# conf = config['Development']

# Load Configuration
conf: Union[Type[DevelopmentConfig], Type[ProductionConfig]] = config[
    os.environ.get("CONFIG", "Development")
]

app = Flask(__name__)
app.config.from_object(conf)

# handler = logging.FileHandler(app.config['LOGGING_LOCATION'])
# handler.setLevel(app.config['LOGGING_LEVEL'])
# formatter = logging.Formatter(app.config['LOGGING_FORMAT'])
# handler.setFormatter(formatter)
# app.logger.addHandler(handler)

backup_db(conf.DB_PATH, conf.BACKUP_PATH, conf.BACKUP_DATE_FORMAT)

db = SampleDB(conf.SQLALCHEMY_DATABASE_URI)

print("Loading Flask App")
