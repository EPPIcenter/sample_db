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

from datetime import datetime

from sqlalchemy import Column, DateTime, String, Integer, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class Model(Base):
    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    created = Column(DateTime, default=datetime.utcnow, nullable=False)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class Study(Model):
    __tablename__ = 'study'
    title = Column(String, unique=True, index=True, nullable=False)
    description = Column(String)
    short_code = Column(String, unique=True, index=True, nullable=False)  # Should we constrain length?
    longitudinal = Column(Boolean, nullable=False)


class Sample(Model):
    __tablename__ = 'sample'
    study_id = Column(Integer, ForeignKey('study.id'), index=True, nullable=False)
    study = relationship('Study', backref="samples")
    collection_date = Column(DateTime)  # Need validation against longitudinal study bool


class MatrixPlate(Model):
    __tablename__ = 'matrix_plate'
    label = Column(String, unique=True, index=True, nullable=False)


class MatrixTube(Model):
    __tablename__ = 'matrix_tube'
    plate_id = Column(Integer, ForeignKey('matrix_plate.id'), index=True, nullable=False)
    plate = relationship('MatrixPlate', backref="tubes")
    barcode = Column(String, unique=True, index=True, nullable=False)

