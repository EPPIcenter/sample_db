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

    def test_add_study_subject(self):
        study = self.db.create_study('test', 'TEST', False, 'Max', 'No Description')
        study_subject1 = self.db.add_study_subject('1', study.short_code)
        study_subject2 = self.db.session.query(StudySubject).get(study_subject1.id)
        self.assertIsInstance(study_subject1, StudySubject)
        self.assertEqual(study_subject1, study_subject2)

    def test_add_study_subjects(self):
        study = self.db.create_study('test', 'TEST', False, 'Max', 'No Description')
        uids = ['abc', 'def']
        study_subjects = self.db.add_study_subjects(uids, study.short_code)
        self.assertEqual(len(study_subjects), len(uids))
        for ind in study_subjects:
            self.assertIn(ind.uid, uids)

    def test_get_study_subjectss(self):
        study = self.db.create_study('test', 'TEST', False, 'Max', 'No Description')
        study_subject1 = self.db.add_study_subject('1', study.short_code)
        study_subject2 = self.db.add_study_subject('2', study.short_code)
        study_subjects = self.db.get_study_subjects(study.short_code)
        self.assertIn(study_subject1, study_subjects)
        self.assertIn(study_subject2, study_subjects)


if __name__ == '__main__':
    unittest.main()
