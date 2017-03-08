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

from __future__ import absolute_import

import unittest
from datetime import date, timedelta

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm.exc import NoResultFound

from sample_db.models import *
from sample_db.app import SampleDB


class TestSampleDB(unittest.TestCase):
    def setUp(self):
        self.db = SampleDB('sqlite:///')

    def test_create_study(self):
        study = self.db.create_study('test', 'TEST', False, 'Max', 'No Description')
        self.assertIsInstance(study, Study)

    def test_create_same_study_failure(self):
        args = ('test', 'TEST', False, 'Max', 'No Description')
        self.db.create_study(*args)
        self.assertRaises(IntegrityError, self.db.create_study, *args)

    def test_get_study(self):
        study = self.db.create_study('test', 'TEST', False, 'Max', 'No Description')
        other_study = self.db.get_study('TEST')
        self.assertEqual(study, other_study)

    def test_add_study_subject(self):
        study = self.db.create_study('test', 'TEST', False, 'Max', 'No Description')
        study_subject1 = self.db.add_study_subject('1', study.short_code)
        study_subjects = self.db.get_study_subjects('TEST')
        self.assertIsInstance(study_subject1, StudySubject)
        self.assertIn(study_subject1, study_subjects)

    def test_add_study_subjects(self):
        study = self.db.create_study('test', 'TEST', False, 'Max', 'No Description')
        uids = ['abc', 'def']
        study_subjects = self.db.add_study_subjects(uids, study.short_code)
        self.assertEqual(len(study_subjects), len(uids))
        for ind in study_subjects:
            self.assertIn(ind.uid, uids)

    def test_get_study_subjects(self):
        study = self.db.create_study('test', 'TEST', False, 'Max', 'No Description')
        study_subject1 = self.db.add_study_subject('1', study.short_code)
        study_subject2 = self.db.add_study_subject('2', study.short_code)
        study_subjects = self.db.get_study_subjects(study.short_code)
        self.assertIn(study_subject1, study_subjects)
        self.assertIn(study_subject2, study_subjects)

    def test_register_new_location(self):
        location = self.db.register_new_location('Bldg 20 Freezer')
        self.assertIsInstance(location, Location)

    def test_get_locations(self):
        location1 = self.db.register_new_location('Bldg 20 Freezer')
        location2 = self.db.register_new_location('Bldg 30 Freezer')
        locations = self.db.get_locations()
        self.assertIn(location1, locations)
        self.assertIn(location2, locations)

    def test_register_new_specimen_type(self):
        specimen = self.db.register_new_specimen_type('DNA')
        self.assertIsInstance(specimen, SpecimenType)

    def test_get_specimen_types(self):
        specimen1 = self.db.register_new_specimen_type('DNA')
        specimen2 = self.db.register_new_specimen_type('Plasma')
        specimens = self.db.get_specimen_types()
        self.assertIn(specimen1, specimens)
        self.assertIn(specimen2, specimens)

    def test_add_specimen_non_longitudinal(self):
        study = self.db.create_study('test', 'TEST', False, 'Max', 'No Description')
        study_subject = self.db.add_study_subject('1', study.short_code)
        specimen_type = self.db.register_new_specimen_type('DNA')
        today = date.today()
        with self.db.session_scope() as session:
            specimen = self.db._add_specimen(session, study_subject.uid, study.short_code, specimen_type.label, today)
        self.assertIsInstance(specimen, Specimen)

    def test_add_specimen_longitudinal(self):
        study = self.db.create_study('test', 'TEST', True, 'Max', 'No Description')
        study_subject = self.db.add_study_subject('1', study.short_code)
        specimen_type = self.db.register_new_specimen_type('DNA')
        today = date.today()
        with self.db.session_scope() as session:
            specimen = self.db._add_specimen(session, study_subject.uid, study.short_code, specimen_type.label, today)
        self.assertIsInstance(specimen, Specimen)

    def test_add_specimen_longitudinal_failure(self):
        study = self.db.create_study('test', 'TEST', True, 'Max', 'No Description')
        study_subject = self.db.add_study_subject('1', study.short_code)
        specimen_type = self.db.register_new_specimen_type('DNA')
        with self.db.session_scope() as session:
            self.assertRaises(ValueError, self.db._add_specimen, session, study_subject.uid, study.short_code,
                              specimen_type.label)

    def test_get_specimens(self):
        study = self.db.create_study('test', 'TEST', True, 'Max', 'No Description')
        study_subject = self.db.add_study_subject('1', study.short_code)
        specimen_type = self.db.register_new_specimen_type('DNA')
        today = date.today()
        tomorrow = today + timedelta(days=1)
        with self.db.session_scope() as session:
            specimen1 = self.db._add_specimen(session, study_subject.uid, study.short_code, specimen_type.label, today)
            specimen2 = self.db._add_specimen(session, study_subject.uid, study.short_code, specimen_type.label,
                                              tomorrow)
        some_specimens = self.db.get_specimens(study_subject.uid, study.short_code, today)
        all_specimens = self.db.get_specimens(study_subject.uid, study.short_code)
        self.assertIn(specimen1, some_specimens)
        self.assertNotIn(specimen2, some_specimens)
        self.assertIn(specimen1, all_specimens)
        self.assertIn(specimen2, all_specimens)
        self.assertEqual(len(all_specimens), 2)

    def test_get_specimen(self):
        study = self.db.create_study('test', 'TEST', True, 'Max', 'No Description')
        study_subject = self.db.add_study_subject('1', study.short_code)
        specimen_type = self.db.register_new_specimen_type('DNA')
        today = date.today()
        with self.db.session_scope() as session:
            specimen1 = self.db._add_specimen(session, study_subject.uid, study.short_code, specimen_type.label, today)

        with self.db.session_scope() as session:
            specimen2 = self.db._get_specimen(session, study_subject.uid, study.short_code, specimen_type.label, today)

        self.assertEqual(specimen1, specimen2, "{} and {} should be equal".format(specimen1, specimen2))

    def test_add_matrix_plate_with_specimens(self):
        specimen_type = self.db.register_new_specimen_type('DNA')
        study = self.db.create_study('test', 'TEST', True, 'Max', 'No Description')
        study_subject = self.db.add_study_subject('1', study.short_code)
        today = date.today()
        location = self.db.register_new_location('-80 Freezer')

        specimen_entries = [
            {'uid': study_subject.uid,
             'short_code': study.short_code,
             'collection_date': today,
             'specimen_type': specimen_type.label,
             'barcode': '1',
             'comments': 'Tube 1',
             'well_position': 'A01'},
            {'uid': study_subject.uid,
             'short_code': study.short_code,
             'collection_date': today,
             'specimen_type': specimen_type.label,
             'barcode': '2',
             'comments': 'Tube 2',
             'well_position': 'A02'},
        ]

        matrix_tubes = self.db.add_matrix_plate_with_specimens('1', location.id, specimen_entries, True)

        self.assertEqual(len(matrix_tubes), 2)
        self.assertIsInstance(matrix_tubes[0], MatrixTube)

    def test_update_matrix_tube_locations(self):
        specimen_type = self.db.register_new_specimen_type('DNA')
        study = self.db.create_study('test', 'TEST', True, 'Max', 'No Description')
        study_subject = self.db.add_study_subject('1', study.short_code)
        today = date.today()
        location = self.db.register_new_location('-80 Freezer')

        specimen_entries1 = [
            {'uid': study_subject.uid,
             'short_code': study.short_code,
             'collection_date': today,
             'specimen_type': specimen_type.label,
             'barcode': '1',
             'comments': 'Tube 1',
             'well_position': 'A01'},
            {'uid': study_subject.uid,
             'short_code': study.short_code,
             'collection_date': today,
             'specimen_type': specimen_type.label,
             'barcode': '2',
             'comments': 'Tube 2',
             'well_position': 'A02'},
        ]

        specimen_entries2 = [
            {'uid': study_subject.uid,
             'short_code': study.short_code,
             'collection_date': today,
             'specimen_type': specimen_type.label,
             'barcode': '3',
             'comments': 'Tube 3',
             'well_position': 'A01'},
            {'uid': study_subject.uid,
             'short_code': study.short_code,
             'collection_date': today,
             'specimen_type': specimen_type.label,
             'barcode': '4',
             'comments': 'Tube 4',
             'well_position': 'A02'},
        ]

        matrix_tubes1 = self.db.add_matrix_plate_with_specimens('1', location.id, specimen_entries1, True)
        matrix_tubes2 = self.db.add_matrix_plate_with_specimens('2', location.id, specimen_entries2, True)

        update_list = [
            {'barcode': '1',
             'plate_uid': '2',
             'well_position': 'B01'},
            {'barcode': '2',
             'plate_uid': '2',
             'well_position': 'B02'},
            {'barcode': '3',
             'plate_uid': '1',
             'well_position': 'B01'},
            {'barcode': '4',
             'plate_uid': '1',
             'well_position': 'B02'}
        ]

        moved_matrix_tubes = self.db.update_matrix_tube_locations(update_list)

        self.assertIsInstance(moved_matrix_tubes[0], MatrixTube)
        self.assertIsInstance(moved_matrix_tubes[0].plate, MatrixPlate)
        for tube in matrix_tubes1:
            self.assertEqual(tube.plate.uid, '2')
        for tube in matrix_tubes2:
            self.assertEqual(tube.plate.uid, '1')

        update_list = [
            {'barcode': '1',
             'plate_uid': '2',
             'well_position': 'B02'},
            {'barcode': '2',
             'plate_uid': '2',
             'well_position': 'B01'},
            {'barcode': '3',
             'plate_uid': '1',
             'well_position': 'A01'},
            {'barcode': '4',
             'plate_uid': '1',
             'well_position': 'A02'}
        ]

        moved_matrix_tubes2 = self.db.update_matrix_tube_locations(update_list)
        for tube in moved_matrix_tubes2:
            if tube.barcode == '1':
                self.assertEqual(tube.well_position, 'B02')

        update_list = [
            {'barcode': '1',
             'plate_uid': '1',
             'well_position': 'A02'},
            {'barcode': '2',
             'plate_uid': '1',
             'well_position': 'A01'},
        ]

        self.assertRaises(IntegrityError, self.db.update_matrix_tube_locations, update_list)

    def test_get_matrix_tube(self):
        specimen_type = self.db.register_new_specimen_type('DNA')
        study = self.db.create_study('test', 'TEST', True, 'Max', 'No Description')
        study_subject = self.db.add_study_subject('1', study.short_code)
        today = date.today()
        location = self.db.register_new_location('-80 Freezer')

        specimen_entries = [
            {'uid': study_subject.uid,
             'short_code': study.short_code,
             'collection_date': today,
             'specimen_type': specimen_type.label,
             'barcode': '1',
             'comments': 'Tube 1',
             'well_position': 'A01'},
            {'uid': study_subject.uid,
             'short_code': study.short_code,
             'collection_date': today,
             'specimen_type': specimen_type.label,
             'barcode': '2',
             'comments': 'Tube 2',
             'well_position': 'A02'},
        ]

        matrix_tubes = self.db.add_matrix_plate_with_specimens('1', location.id, specimen_entries, True)

        matrix_tube = self.db.get_matrix_tube('1')
        self.assertIsInstance(matrix_tube, MatrixTube)
        self.assertEqual(matrix_tube.well_position, 'A01')

        self.assertRaises(NoResultFound, self.db.get_matrix_tube, '3')

    def test_get_matrix_tubes(self):
        specimen_type = self.db.register_new_specimen_type('DNA')
        study = self.db.create_study('test', 'TEST', True, 'Max', 'No Description')
        study_subject = self.db.add_study_subject('1', study.short_code)
        today = date.today()
        location = self.db.register_new_location('-80 Freezer')

        specimen_entries = [
            {'uid': study_subject.uid,
             'short_code': study.short_code,
             'collection_date': today,
             'specimen_type': specimen_type.label,
             'barcode': '1',
             'comments': 'Tube 1',
             'well_position': 'A01'},
            {'uid': study_subject.uid,
             'short_code': study.short_code,
             'collection_date': today,
             'specimen_type': specimen_type.label,
             'barcode': '2',
             'comments': 'Tube 2',
             'well_position': 'A02'},
        ]
        matrix_tubes = self.db.add_matrix_plate_with_specimens('1', location.id, specimen_entries, True)

        matrix_tube_query = self.db.get_matrix_tubes(['1', '2'])
        for tube in matrix_tube_query:
            self.assertIn(tube, matrix_tubes)
            self.assertIsInstance(tube, MatrixTube)

    def test_set_matrix_tube_exhausted(self):
        specimen_type = self.db.register_new_specimen_type('DNA')
        study = self.db.create_study('test', 'TEST', True, 'Max', 'No Description')
        study_subject = self.db.add_study_subject('1', study.short_code)
        today = date.today()
        location = self.db.register_new_location('-80 Freezer')

        specimen_entries = [
            {'uid': study_subject.uid,
             'short_code': study.short_code,
             'collection_date': today,
             'specimen_type': specimen_type.label,
             'barcode': '1',
             'comments': 'Tube 1',
             'well_position': 'A01'},
            {'uid': study_subject.uid,
             'short_code': study.short_code,
             'collection_date': today,
             'specimen_type': specimen_type.label,
             'barcode': '2',
             'comments': 'Tube 2',
             'well_position': 'A02'},
        ]

        matrix_tubes = self.db.add_matrix_plate_with_specimens('1', location.id, specimen_entries, True)
        self.db.set_matrix_tube_exhausted('1')
        self.db.set_matrix_tube_exhausted('2')

        for matrix_tube in matrix_tubes:
            self.assertTrue(matrix_tube.exhausted)

    def test_unset_matrix_tube_exhausted(self):
        specimen_type = self.db.register_new_specimen_type('DNA')
        study = self.db.create_study('test', 'TEST', True, 'Max', 'No Description')
        study_subject = self.db.add_study_subject('1', study.short_code)
        today = date.today()
        location = self.db.register_new_location('-80 Freezer')

        specimen_entries = [
            {'uid': study_subject.uid,
             'short_code': study.short_code,
             'collection_date': today,
             'specimen_type': specimen_type.label,
             'barcode': '1',
             'comments': 'Tube 1',
             'well_position': 'A01'},
            {'uid': study_subject.uid,
             'short_code': study.short_code,
             'collection_date': today,
             'specimen_type': specimen_type.label,
             'barcode': '2',
             'comments': 'Tube 2',
             'well_position': 'A02'},
        ]

        matrix_tubes = self.db.add_matrix_plate_with_specimens('1', location.id, specimen_entries, True)

        for matrix_tube in matrix_tubes:
            self.db.set_matrix_tube_exhausted(matrix_tube.barcode)
            self.assertTrue(matrix_tube.exhausted)
            self.db.unset_matrix_tube_exhausted(matrix_tube.barcode)
            self.assertFalse(matrix_tube.exhausted)


if __name__ == '__main__':
    unittest.main()
