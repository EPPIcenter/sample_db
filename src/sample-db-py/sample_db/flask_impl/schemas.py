from marshmallow import fields
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema

from sample_db.db_impl.models import (
    Study,
    StudySubject,
    SpecimenType,
    Specimen,
    Location,
    StorageContainer,
    MatrixPlate,
    MatrixTube,
)

from . import db


class BaseSchema(SQLAlchemyAutoSchema):
    class Meta:
        sqla_session = db._session

    id = fields.String()


class SpecimenTypeSchema(BaseSchema):
    class Meta(BaseSchema.Meta):
        model = SpecimenType


class SpecimenSchema(BaseSchema):
    class Meta(BaseSchema.Meta):
        model = Specimen

    # specimen_type = fields.Nested(SpecimenTypeSchema)


class StudySubjectSchema(BaseSchema):
    class Meta(BaseSchema.Meta):
        model = StudySubject

    # specimens = fields.Nested(SpecimenSchema, many=True)
    study = fields.String(attribute="study_id")


class StudySchema(BaseSchema):
    class Meta(BaseSchema.Meta):
        model = Study
        # exclude = ('subjects',)


class DetailedStudySchema(BaseSchema):
    class Meta(BaseSchema.Meta):
        model = Study


class LocationSchema(BaseSchema):
    class Meta(BaseSchema.Meta):
        model = Location
        exclude = ("specimen_containers",)


class StorageContainerSchema(BaseSchema):
    class Meta(BaseSchema.Meta):
        model = StorageContainer


class MatrixTubeSchema(BaseSchema):
    class Meta(BaseSchema.Meta):
        model = MatrixTube

    plate = fields.String(attribute="plate_id")
    specimen = fields.String(attribute="specimen_id")


class MatrixPlateSchema(BaseSchema):
    class Meta(BaseSchema.Meta):
        model = MatrixPlate

    location = fields.String(attribute="location_id")
