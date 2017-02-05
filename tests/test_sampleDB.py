from __future__ import absolute_import

import unittest
from app import SampleDB
from models import *
from sqlalchemy.exc import IntegrityError


class TestSampleDB(unittest.TestCase):
    def setUp(self):
        self.db = SampleDB('sqlite://')

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

    def test_get_study_individuals(self):
        study = self.db.create_study('test', 'TEST', False, 'Max', 'No Description')
        ind1 = self.db.add_individual('1', study.short_code)
        ind2 = self.db.add_individual('2', study.short_code)
        individuals = self.db.get_study_individuals(study.short_code)
        self.assertIn(ind1, individuals)
        self.assertIn(ind2, individuals)

    def test_add_individual(self):
        study = self.db.create_study('test', 'TEST', False, 'Max', 'No Description')
        ind1 = self.db.add_individual('1', study.short_code)
        ind2 = self.db.session.query(Individual).get(ind1.id)
        self.assertIsInstance(ind1, Individual)
        self.assertEqual(ind1, ind2)

    def test_add_individuals(self):
        study = self.db.create_study('test', 'TEST', False, 'Max', 'No Description')
        uids = ['abc', 'def']
        individuals = self.db.add_individuals(uids, study.short_code)
        self.assertEqual(len(individuals), len(uids))
        for ind in individuals:
            self.assertIn(ind.uid, uids)


if __name__ == '__main__':
    unittest.main()
