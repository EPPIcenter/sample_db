import os
import csv
import datetime
import tempfile


class DateParseError(Exception):
    def __init__(self, message):
        Exception.__init__(self)
        self.message = message


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
        return [field.strip().replace(' ', '_').replace('.', '').lower() for field in
                super(CaseInsensitiveDictReader, self).fieldnames]

    def __next__(self):
        d_insensitive = CaseInsensitiveDict()
        d_original = super(CaseInsensitiveDictReader, self).__next__()

        for k, v in d_original.items():
            d_insensitive[k] = v

        return d_insensitive


class BaseFileManager(object):
    def __init__(self, date_format=None):
        self.date_format = date_format or "%d/%m/%Y"

    def parse_date(self, date_string):
        return datetime.datetime.strptime(date_string, self.date_format)

    @staticmethod
    def parse_file_name(filename):
        filename = filename.strip()
        if os.name == 'posix':
            filename = filename.replace('\ ', ' ')
        return filename

    def parse_study_subject_file(self, f):
        study_subject_uids = []
        r = CaseInsensitiveDictReader(f)
        try:
            for entry in r:
                try:
                    study_subject_uids.append(entry['uid'])
                except KeyError:
                    raise ValueError('File Format Incorrect')
            return study_subject_uids
        except csv.Error:
            raise ValueError('File Format Incorrect, Must be CSV')

    def parse_new_plate_file(self, f):
        specimen_entries = []
        try:
            r = CaseInsensitiveDictReader(f)
            for entry in r:
                specimen_entry = {'uid': entry['uid'],
                                  'short_code': entry['study_short_code'],
                                  'specimen_type': entry['specimen_type'],
                                  'barcode': entry['barcode'],
                                  'well_position': entry['well']
                                  }
                if 'date' in entry:
                    try:
                        specimen_entry['collection_date'] = self.parse_date(entry['date'])
                    except ValueError:
                        raise DateParseError(message="Date must be in format 'DD/MM/YYYY'")
                else:
                    specimen_entry['collection_date'] = None
                specimen_entry['comments'] = entry.get('comments')
                specimen_entries.append(specimen_entry)
            return specimen_entries
        except csv.Error:
            raise ValueError('File Format Incorrect, Must be CSV')

    @staticmethod
    def parse_plate_update_file(f):
        matrix_tube_entries = []
        plate_uid = os.path.splitext(f.filename)[0]
        try:
            r = CaseInsensitiveDictReader(f)
            for entry in r:
                tube_entry = {'plate_uid': plate_uid,
                              'well_position': entry['well'],
                              'comments': entry['comments'],
                              'barcode': entry['barcode']
                              }
                matrix_tube_entries.append(tube_entry)
            return matrix_tube_entries
        except csv.Error:
            raise ValueError('File Format Incorrect, Must be CSV')

    def parse_specimen_search_file(self, f):
        specimen_entries = []
        try:
            r = CaseInsensitiveDictReader(f)
            for entry in r:
                specimen_entry = {
                    'uid': entry['uid'],
                    'short_code': entry['study_short_code'],
                    'specimen_type': entry['specimen_type']
                }
                if 'date' in entry:
                    try:
                        specimen_entry['collection_date'] = self.parse_date(entry['date'])
                    except ValueError:
                        raise DateParseError(message="Date must be in format 'DD/MM/YYYY'")
                else:
                    specimen_entry['collection_date'] = None
                specimen_entries.append(specimen_entry)
            return specimen_entries
        except csv.Error:
            raise ValueError('File Format Incorrect, Must be CSV')

    @staticmethod
    def create_specimen_search_file(entries, header):
        handle, temp_path = tempfile.mkstemp(suffix='csv', prefix='specimens')
        with open(temp_path, 'w') as f:
            w = csv.DictWriter(f, fieldnames=header)
            w.writeheader()
            w.writerows(entries)
        return temp_path

    @staticmethod
    def parse_barcode_search_file(f):
        barcode_entries = []
        try:
            r = csv.DictReader(f)
            fields = r.fieldnames
            normed_fields = [field.strip().replace(' ', '_').replace('.', '').lower() for field in fields]
            barcode_index = normed_fields.index('barcode')
            barcode_field = fields[normed_fields.index('barcode')]
            for entry in r:
                barcode = entry.pop(barcode_field)
                normed_entry = {'barcode': barcode}
                normed_entry.update(entry)
                barcode_entries.append(normed_entry)
            return barcode_entries, fields, barcode_index
        except csv.Error:
            raise ValueError('File Format Incorrect, Must be CSV')

    @staticmethod
    def parse_barcode_file(f):
        try:
            r = CaseInsensitiveDictReader(f)
            barcodes = [_['barcode'] for _ in r]
            return barcodes
        except csv.Error:
            raise ValueError('File Format Incorrect, Must be CSV')

    @staticmethod
    def create_barcode_search_file(entries, header):
        handle, temp_path = tempfile.mkstemp(suffix='csv', prefix='barcodes')
        with open(temp_path, 'w') as f:
            w = csv.DictWriter(f, fieldnames=header)
            w.writeheader()
            w.writerows(entries)
        return temp_path


class CLIFileManager(BaseFileManager):
    def __init__(self, **kwargs):
        super(CLIFileManager, self).__init__(**kwargs)

    def parse_study_subject_file(self, filename):
        filename = self.parse_file_name(filename)
        study_subject_uids = []
        with open(filename, 'r') as f:
            r = CaseInsensitiveDictReader(f)
            for entry in r:
                try:
                    study_subject_uids.append(entry['uid'])
                except (KeyError, csv.Error):
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
                except (KeyError, csv.Error):
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
                except (KeyError, csv.Error):
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
