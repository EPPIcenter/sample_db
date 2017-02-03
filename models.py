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

from sqlalchemy import Column, DateTime, Date, String, Integer, ForeignKey, Boolean, Table
from sqlalchemy.schema import UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base


class Base(object):
    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    created = Column(DateTime, default=datetime.utcnow, nullable=False)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

Base = declarative_base(cls=Base)


# Thinking about how to support keeping track of samples across studies, e.g. samples from individuals go into 2
# separate studies.  This happened before with GG and PATH studies that used a subset of PRISM samples and created
# some confusion with integrating results because samples had different UIDs... However, trying to track across multiple
# studies adds some complexity, requiring a reference to the study to provide context when querying against specimens
# etc. Might not be worth the investment to maintain that.
#
# study_individual_association_table = Table('study_individual_association', Base.metadata,
#                                            Column('study_id', Integer, ForeignKey('study.id')),
#                                            Column('individual_id', Integer, ForeignKey('individual.id')),
#                                            UniqueConstraint('individual_id', 'study_id', name='individual_study_uc'))


class Study(Base):
    __tablename__ = 'study'
    title = Column(String, unique=True, index=True, nullable=False)
    description = Column(String)
    short_code = Column(String, unique=True, index=True, nullable=False)  # Should we constrain length?
    longitudinal = Column(Boolean, nullable=False)
    lead_person = Column(String, nullable=False)


class Individual(Base):
    __tablename__ = 'individual'
    __table_args__ = (UniqueConstraint('id', 'study_id', name='individual_study_uc'),)
    uid = Column(String, index=True, nullable=False)
    study_id = Column(Integer, ForeignKey('study.id'))
    study = relationship('Study', backref='individuals')


class SpecimenType(Base):
    __tablename__ = 'specimen_type'
    label = Column(String, unique=True, index=True, nullable=False)


class Specimen(Base):
    __tablename__ = 'specimen'
    # Require that only one record of a specimen of a specific type for a specific individual on a specific day may
    # exist. Multiple storage containers may exist however, i.e. multiple aliquots of a specimen.
    __table_args__ = (UniqueConstraint('individual_id', 'specimen_type_id', 'collection_date',
                                       name='specimen_collection_date_uc'),)
    individual_id = Column(Integer, ForeignKey('individual.id'), index=True, nullable=False)
    individual = relationship('Individual', backref='specimens')
    specimen_type_id = Column(Integer, ForeignKey('specimen_type.id'))
    type = relationship('SpecimenType')
    # TODO: Validate against longitudinal studies
    collection_date = Column(Date, default=None)


class Location(Base):
    __tablename__ = 'location'
    description = Column(String, unique=True, nullable=False)


class StorageContainer(Base):
    discriminator = Column('type', String(255))
    __mapper_args__ = {'polymorphic_on': discriminator,
                       'polymorphic_identity': 'base_storage_container'}
    specimen_id = Column(Integer, ForeignKey('specimen.id'), index=True, nullable=False)
    specimen = relationship('Specimen')
    location_id = Column(Integer, ForeignKey('location.id'), index=True, nullable=False)
    location = relationship('Location', backref='specimen_containers')
    exhausted = Column(Boolean, nullable=False, default=False)


class MatrixPlate(Base):
    __tablename__ = 'matrix_plate'
    label = Column(String, unique=True, index=True, nullable=False)


class MatrixTube(StorageContainer, Base):
    __tablename__ = 'matrix_tube'

    # Require that only one tube can occupy a given well in a plate.
    __table_args__ = (UniqueConstraint('well_position', 'plate_id', name='well_position_plate_uc'),)
    __mapper_args__ = {'polymorphic_identity': 'matrix_tube'}
    plate_id = Column(Integer, ForeignKey('matrix_plate.id'), index=True, nullable=False)
    plate = relationship('MatrixPlate', backref='tubes')
    barcode = Column(String, unique=True, index=True, nullable=False)
    well_position = Column(String, nullable=False)





