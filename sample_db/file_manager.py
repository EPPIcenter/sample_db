import os
import csv
import datetime


class CaseInsensitiveDict(dict):
    """
    Dict that removes whitespace, replaces inner spaces with underscores, removes periods, and is
    case insensitive.
    """

    def __getitem__(self, item):
        return dict.__getitem__(self, item.strip().replace(' ', '_').replace('.', '').lower())


class CaseInsensitiveDictReader(csv.DictReader, object):
    """
    DictReader that uses case insensitive dict, removes periods, and converts fieldnames to snake_case
    """

    @property
    def fieldnames(self):
        return [field.strip().replace(' ', '_').replace('.', '').lower() for field in super(CaseInsensitiveDictReader, self).fieldnames]

    def __next__(self):
        d_insensitive = CaseInsensitiveDict()
        d_original = super(CaseInsensitiveDictReader, self).__next__()

        for k, v in d_original.items():
            d_insensitive[k] = v

        return d_insensitive


class FileManager(object):
    def __init__(self):
        self.date_format = "%d-%b-%Y"

    @staticmethod
    def parse_file_name(filename):
        filename = filename.strip()
        if os.name == 'posix':
            filename = filename.replace('\ ', ' ')
        return filename

    def parse_date(self, date_string):
        return datetime.datetime.strptime(date_string, self.date_format)

    def parse_study_subject_file(self, filename):
        filename = self.parse_file_name(filename)

        study_subject_uids = []
        with open(filename, 'r') as f:
            r = CaseInsensitiveDictReader(f)
            for entry in r:
                try:
                    study_subject_uids.append(entry['uid'])
                except KeyError:
                    raise ValueError('File Format Incorrect')

        return study_subject_uids

    def parse_subject_search_file(self, filename):
        filename = self.parse_file_name(filename)

        subject_queries = []
        with open(filename, 'r') as f:
            r = CaseInsensitiveDictReader(f)
            for entry in r:
                try:
                    e = dict()
                    e['uid'] = entry["uid"]
                    e['short_code'] = entry['study_short_code']
                    if 'collection_date' in entry:
                        e['collection_date'] = self.parse_date(entry['collection_date'])
                    else:
                        e['collection_date'] = None
                    subject_queries.append(e)
                except KeyError:
                    raise ValueError("File Format Incorrect")

        return subject_queries

    def parse_specimen_plate_file(self, filename):
        filename = self.parse_file_name(filename)

        specimen_entries = []
        with open(filename, 'r') as f:
            r = CaseInsensitiveDictReader(f)
            for entry in r:
                try:
                    e = dict()
                    e['uid'] = entry["uid"]
                    e['short_code'] = entry['study_short_code']
                    e['specimen_type'] = entry['specimen_type']
                    e['barcode'] = entry['barcode']
                    e['well_position'] = entry['well']
                    if 'date' in entry:
                        e['collection_date'] = self.parse_date(entry['date'])
                    else:
                        e['collection_date'] = None
                    e['comments'] = entry.get('comments')
                    specimen_entries.append(e)
                except KeyError:
                    raise ValueError("File Format Incorrect")

        return specimen_entries

    def write_query(self, original_file_name, header, rows):
        filename = self.parse_file_name(original_file_name)
        dirname = os.path.dirname(filename)
        basename = os.path.basename(filename)
        basename = 'Query Results - {} - {}'.format(datetime.datetime.now(), basename)
        dest_file = os.path.join(dirname, basename)
        with open(dest_file, 'w') as f:
            w = csv.DictWriter(f, fieldnames=header)
            w.writeheader()
            w.writerows(rows)
        return dest_file



    # def parse_

