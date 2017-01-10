from sqlalchemy import Column, DateTime, String, Integer, ForeignKey
from sqlalchemy.orm import relationship, backref
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class Model(Base):
    id = Column(Integer, primary_key=True, autoincrement=True)


class Sample(Model):
    __tablename__ = 'sample'


class MatrixPlate(Model):
    __tablename__ = 'matrix_plate'
    label = Column(String, unique=True, index=True)


class MatrixTube(Model):
    __tablename__ = 'matrix_tube'
    plate_id = Column(Integer, ForeignKey('matrix_plate.id'))
    plate = relationship('MatrixPlate', backref="tubes")
