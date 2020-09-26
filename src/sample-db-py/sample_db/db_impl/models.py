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

# from sample_db import conf
import logging
from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    event,
)
from sqlalchemy.ext.declarative import declarative_base, declared_attr
from sqlalchemy.orm import relationship, validates
from sqlalchemy.schema import UniqueConstraint
from sqlalchemy.sql.expression import null


class Base(object):
    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    created = Column(DateTime, default=datetime.utcnow, nullable=False)
    last_updated = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
    read_only_fields = {"id", "created", "last_updated"}

    def __repr__(self):
        return "<{}: [id]: {}, [created]: {}, [updated]: {}>".format(
            self.__class__.__name__, self.id, self.created, self.last_updated
        )

    def __init__(self, **kwargs):
        super(Base, self).__init__(**kwargs)

    def update(self, d):
        for k in d.keys():
            if hasattr(self, k) and k not in self.read_only_fields:
                setattr(self, k, d[k])
                # getattr(self, k).changed()
        return self


SampleDBBase = declarative_base(cls=Base)


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


class Study(SampleDBBase):
    __tablename__ = "study"
    title = Column(String, unique=True, index=True, nullable=False)
    description = Column(String)
    short_code = Column(
        String, unique=True, index=True, nullable=False
    )  # Should we constrain length?
    is_longitudinal = Column(Boolean, nullable=False)
    lead_person = Column(String, nullable=False)
    hidden = Column(Boolean, nullable=False, default=False)
    read_only_fields = Base.read_only_fields | {"subjects"}

    def __str__(self):
        return "<{}: {}>".format(self.__class__.__name__, self.short_code)

    @validates("title")
    def validate_title(self, key, title):
        if title == "":
            raise ValueError("Study title cannot be blank")
        return title

    @validates("short_code")
    def validate_short_code(self, key, short_code):
        if short_code == "":
            raise ValueError("Study short code cannot be blank")
        return short_code

    @validates("lead_person")
    def validate_lead_person(self, key, lead_person):
        if lead_person == "":
            raise ValueError("Study lead person cannot be blank")
        return lead_person

    @validates("is_longitudinal")
    def validate_is_longitudinal(self, key, is_longitudinal):
        if not self.is_longitudinal and is_longitudinal:
            for subject in self.subjects:
                for specimen in subject.specimens:
                    if not specimen.collection_date:
                        raise ValueError(
                            "Cannot make study longitudinal, contains specimens without collection dates."
                        )
        return is_longitudinal


class StudySubject(SampleDBBase):
    __tablename__ = "study_subject"
    __table_args__ = (
        UniqueConstraint("uid", "study_id", name="study_subject_study_uc"),
    )
    uid = Column(String, index=True, nullable=False)
    study_id = Column(Integer, ForeignKey("study.id"))
    study = relationship("Study", backref="subjects")
    read_only_fields = Base.read_only_fields | {"study", "specimens"}

    def __str__(self):
        return "<{}: {}>".format(self.__class__.__name__, self.uid)

    def __init__(self, **kwargs):
        super(StudySubject, self).__init__(**kwargs)


class SpecimenType(SampleDBBase):
    __tablename__ = "specimen_type"
    label = Column(String, unique=True, index=True, nullable=False)

    def __str__(self):
        return "<{}: {}>".format(self.__class__.__name__, self.label)

    @validates("label")
    def validate_label(self, key, label):
        if label == "":
            raise ValueError("Specimen Label cannot be blank")
        return label


class Specimen(SampleDBBase):
    __tablename__ = "specimen"

    # Require that only one record of a specimen of a specific type for a specific individual collected
    # on a specific day may exist. Multiple storage containers may exist however, i.e. multiple aliquots of a specimen.
    __table_args__ = (
        UniqueConstraint(
            "study_subject_id",
            "specimen_type_id",
            "collection_date",
            name="specimen_collection_date_uc",
        ),
    )
    study_subject_id = Column(
        Integer, ForeignKey("study_subject.id"), index=True, nullable=False
    )
    study_subject = relationship("StudySubject", backref="specimens")
    specimen_type_id = Column(Integer, ForeignKey("specimen_type.id"))
    specimen_type = relationship("SpecimenType")
    collection_date = Column(Date, default=None, nullable=True)

    def __str__(self):
        return "<{}: {} from {}>".format(
            self.__class__.__name__, self.specimen_type.label, self.study_subject
        )

    @validates("collection_date")
    def validate_collection_date(self, key, collection_date):
        if not collection_date:
            if self.study_subject.study.is_longitudinal:
                raise ValueError(
                    "Not allowed to add specimens without a collection date to a longitudinal study."
                )
        return collection_date


class Location(SampleDBBase):
    __tablename__ = "location"
    description = Column(String, unique=True, nullable=False)

    def __str__(self):
        return "<{}: {}>".format(self.__class__.__name__, self.description)

    @validates("description")
    def validate_description(self, key, description):
        if description == "":
            raise ValueError("Location cannot be blank")
        return description


class LocationAnnotation(object):
    @declared_attr
    def location_id(self):
        return Column(Integer, ForeignKey("location.id"), index=True, nullable=False)

    @declared_attr
    def location(self):
        return relationship("Location", backref="specimen_containers")


class StorageContainer(SampleDBBase):
    __tablename__ = "storage_container"

    discriminator = Column("type", String(255))
    __mapper_args__ = {
        "polymorphic_on": discriminator,
        "polymorphic_identity": "base_storage_container",
    }

    specimen_id = Column(Integer, ForeignKey("specimen.id"), index=True, nullable=False)
    specimen = relationship("Specimen", backref="storage_containers")
    comments = Column(String)
    exhausted = Column(Boolean, nullable=False, default=False)


class MatrixPlate(LocationAnnotation, SampleDBBase):
    __tablename__ = "matrix_plate"
    uid = Column(String, unique=True, index=True, nullable=False)
    hidden = Column(Boolean, nullable=False, default=False)

    def __str__(self):
        return "<{} {}, Location: {}>".format(
            self.__class__.__name__, self.uid, self.location.description
        )


class MatrixTube(StorageContainer):
    __tablename__ = "matrix_tube"

    well_list = set()
    for column in ("A", "B", "C", "D", "E", "F", "G", "H"):
        for row in (
            "01",
            "02",
            "03",
            "04",
            "05",
            "06",
            "07",
            "08",
            "09",
            "10",
            "11",
            "12",
        ):
            well_list.add(column + row)
            well_list.add("-" + column + row)

    #  The way this should really be implemented, but sqlite does not support deferred constraint checks.
    # __table_args__ = (UniqueConstraint('well_position', 'plate_id', name='well_position_plate_uc', deferrable=True,
    #                                    initially='DEFERRED'),)

    # Require that only one tube can occupy a given well in a plate.
    __table_args__ = (
        UniqueConstraint("well_position", "plate_id", name="well_position_plate_uc"),
    )
    __mapper_args__ = {"polymorphic_identity": "matrix_tube"}

    id = Column(Integer, ForeignKey("storage_container.id"), primary_key=True)
    plate_id = Column(Integer, ForeignKey("matrix_plate.id"), index=True, nullable=True)
    plate = relationship("MatrixPlate", backref="tubes")
    barcode = Column(String, unique=True, index=True, nullable=False)
    well_position = Column(String, nullable=False)

    def __str__(self):
        return "<{}: {} {} {}>".format(
            self.__class__.__name__, self.barcode, self.plate.uid, self.well_position
        )

    @validates("well_position")
    def validate_well_position(self, key, well_position):
        if well_position not in self.well_list:
            raise ValueError("{} is not a valid well position.".format(well_position))
        return well_position
