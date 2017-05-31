from sample_db import app, db
from flask import request, jsonify, send_from_directory, abort, send_file
from werkzeug.exceptions import NotFound

from sample_db.file_manager import BaseFileManager, DateParseError
from schemas import StudySchema, StudySubjectSchema, LocationSchema, SpecimenTypeSchema, \
    MatrixPlateSchema, SpecimenSchema, MatrixTubeSchema
from sqlalchemy.orm.exc import NoResultFound, UnmappedInstanceError
from sqlalchemy.exc import IntegrityError

study_schema = StudySchema()
study_subject_schema = StudySubjectSchema()
specimen_schema = SpecimenSchema()
location_schema = LocationSchema()
specimen_type_schema = SpecimenTypeSchema()
matrix_plate_schema = MatrixPlateSchema()
matrix_tube_schema = MatrixTubeSchema()


@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

field_name_mapping = {
    'short_code': 'Short Code',
    'last_updated': 'Last Updated',
    'is_longitudinal': 'Longitudinal',
    'lead_person': 'Lead Person',
    'uid': 'UID',
    'study_subject': 'Study Subject',
    'specimen_type': 'Specimen Type',
    'collection_date': 'Collection Date',
    'well_position': 'Well Position',
    'study_subject_id': 'Study Subject',
    'specimen_type_id': 'Specimen Type'
}


def parse_integrity_error(e):
    if 'NOT NULL' in e.message:
        msg = e.message.split(':')[1].strip()
        field = field_name_mapping.get(msg.split('.')[1], msg.split('.')[1]).title()
        return "{} Field cannot be empty".format(field)
    elif 'UNIQUE' in e.message:
        msg = e.message.split(':')[1].strip()
        fields = msg.split(" ")
        fields = [_.split('.')[1] for _ in fields]
        fields = [_.replace(',', '') for _ in fields]
        fields = [field_name_mapping.get(_, _) for _ in fields]
        fields = [_.title() for _ in fields]
        if len(fields) > 1:
            s = "Fields [" + "{}, " * (len(fields) - 1) + "{}] are not unique"
            return s.format(*fields)
        else:
            return "{} Field is not unique".format(fields[0])
    else:
        return e.message


class InvalidUsage(Exception):
    status_code = 400

    def __init__(self, message, status_code=None, payload=None):
        Exception.__init__(self)
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv['message'] = self.message
        return rv


@app.errorhandler(InvalidUsage)
def handle_invalid_usage(error):
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response


@app.route('/assets/<path:path>')
def catch_all(path):
    try:
        return send_from_directory(app.config['ASSETS_PATH'], path)
    except NotFound:
        return abort(404)


@app.route('/study', methods=['GET'])
def get_studies():
    studies = db.get_studies()
    d, err = study_schema.dump(studies, many=True)
    res = jsonify(data=d, error=err)
    return res


@app.route('/study', methods=['POST'])
def create_or_update_study():
    study = request.json.get('study')
    if study:
        try:
            if not study.get('id'):
                try:
                    study = db.create_study(**study)
                    study_subjects = []
                    specimens = []
                    matrix_tubes = []
                except IntegrityError as e:
                    raise InvalidUsage(parse_integrity_error(e), status_code=403)
            else:
                try:
                    study_id = study.pop('id')
                    study, study_subjects, specimens, matrix_tubes = db.update_study(study_id, study)
                except IntegrityError as e:
                    raise InvalidUsage(parse_integrity_error(e), status_code=403)
            study_entries, study_error = study_schema.dump(study)
            study_subject_entries, study_subject_error = study_subject_schema.dump(study_subjects, many=True)
            specimen_entries, specimen_error = specimen_schema.dump(specimens, many=True)
            matrix_tube_entries, matrix_tube_error = matrix_tube_schema.dump(matrix_tubes, many=True)
            d = {
                'study': study_entries,
                'study_subject': study_subject_entries,
                'specimen': specimen_entries,
                'matrix_tube': matrix_tube_entries
            }
            err = {
                'study': study_error,
                'study_subject': study_subject_error,
                'specimen': specimen_error,
                'matrix_tube': matrix_tube_error
            }
            res = jsonify(data=d, error=err)
            return res
        except IntegrityError as e:
            raise InvalidUsage(parse_integrity_error(e), status_code=403)
        except ValueError as e:
            raise InvalidUsage(e.message, status_code=403)
    raise InvalidUsage("Invalid Data", status_code=403)


@app.route('/study/<int:study_id>', methods=['GET'])
def get_study(study_id):
    try:
        study, study_subjects, specimens, matrix_tubes = db.get_study(study_id)
        study_entries, study_error = study_schema.dump(study)
        study_subject_entries, study_subject_error = study_subject_schema.dump(study_subjects, many=True)
        specimen_entries, specimen_error = specimen_schema.dump(specimens, many=True)
        matrix_tube_entries, matrix_tube_error = matrix_tube_schema.dump(matrix_tubes, many=True)
        d = {
            'study': study_entries,
            'study_subject': study_subject_entries,
            'specimen': specimen_entries,
            'matrix_tube': matrix_tube_entries
        }
        err = {
            'study': study_error,
            'study_subject': study_subject_error,
            'specimen': specimen_error,
            'matrix_tube': matrix_tube_error
        }

        res = jsonify(data=d, error=err)
        return res
    except NoResultFound:
        raise InvalidUsage("Study does not exist", status_code=404)


@app.route('/study/<int:study_id>', methods=['DELETE'])
def delete_study(study_id):
    try:
        study, study_subjects, specimens, matrix_tubes = db.get_study(study_id)
        if study_subjects:
            raise InvalidUsage("Cannot Delete a Study With Subjects", status_code=403)
        db.delete_study(study)
        return jsonify(success=True, error={})
    except NoResultFound:
        raise InvalidUsage("Study does not exist", status_code=404)
    except IntegrityError as e:
        raise InvalidUsage(parse_integrity_error(e), status_code=403)


@app.route('/study/<int:study_id>/study_subject', methods=['GET'])
def get_study_subjects(study_id):
    study_subjects = db.get_study_subjects(study_id)
    d, err = study_subject_schema.dump(study_subjects, many=True)
    res = jsonify(data=d, error=err)
    return res


@app.route('/study/<int:study_id>/study_subject', methods=['POST'])
def add_study_subject_file(study_id):
    bf = BaseFileManager()
    try:
        study_subject_file = request.files['file']
        try:
            study_subject_uids = bf.parse_study_subject_file(study_subject_file)
        except:
            raise KeyError
        db.add_study_subjects(study_subject_uids, study_id)
        study_subjects = db.get_study_subjects(study_id)
        d, err = study_subject_schema.dump(study_subjects, many=True)
        return jsonify(success=True, data=d, error=err)
    except NoResultFound:
        raise InvalidUsage("Study does not exist", status_code=404)
    except IntegrityError as e:
        raise InvalidUsage(parse_integrity_error(e), status_code=403)
    except KeyError:
        raise InvalidUsage("File Malformed, should be .csv and header should contain 'UID'", status_code=403)


@app.route('/location', methods=['GET'])
def get_locations():
    locations = db.get_locations()
    d, err = location_schema.dump(locations, many=True)
    return jsonify(data=d, error=err)


@app.route('/location', methods=['POST'])
def create_or_update_location():
    location = request.get_json().get('location')
    if location:
        try:
            if not location.get('id'):
                location = db.register_new_location(**location)
            else:
                location_id = location.pop('id')
                location = db.update_location(location_id, location)
            d, err = location_schema.dump(location)
            return jsonify(success=True, data=d, error=err)
        except IntegrityError as e:
            raise InvalidUsage(parse_integrity_error(e), status_code=403)
        except ValueError as e:
            raise InvalidUsage(e.message, status_code=403)
    raise InvalidUsage("Invalid API Call", status_code=400)


@app.route('/location/<int:location_id>', methods=['GET'])
def get_location(location_id):
    try:
        location = db.get_location(location_id)
        d, err = location_schema.dump(location)
        res = jsonify(data=d, error=err)
        return res
    except NoResultFound:
        raise InvalidUsage("Location does not exist", status_code=404)


@app.route('/location/<int:location_id>', methods=['DELETE'])
def delete_location(location_id):
    try:
        db.delete_location(location_id)
        return jsonify(success=True, error={})
    except UnmappedInstanceError:
        raise InvalidUsage("Location does not exist", status_code=404)
    except IntegrityError as e:
        raise InvalidUsage(parse_integrity_error(e), status_code=403)


@app.route('/specimen-type', methods=['GET'])
def get_specimen_types():
    specimen_types = db.get_specimen_types()
    d, err = specimen_type_schema.dump(specimen_types, many=True)
    return jsonify(data=d, error=err)


@app.route('/specimen-type', methods=['POST'])
def create_or_update_specimen_type():
    specimen_type = request.get_json().get('specimen_type')
    if specimen_type:
        try:
            if not specimen_type.get('id'):
                specimen_type = db.register_new_specimen_type(**specimen_type)
            else:
                specimen_type_id = specimen_type.pop('id')
                specimen_type = db.update_specimen_type(specimen_type_id, specimen_type)
            d, err = specimen_type_schema.dump(specimen_type)
            return jsonify(success=True, data=d, error=err)
        except IntegrityError as e:
            raise InvalidUsage(parse_integrity_error(e), status_code=403)
        except ValueError as e:
            raise InvalidUsage(e.message, status_code=403)
    raise InvalidUsage("Invalid API Call", status_code=400)


@app.route('/specimen-type/<int:specimen_type_id>', methods=['GET'])
def get_specimen_type(specimen_type_id):
    try:
        location = db.get_specimen_type(specimen_type_id)
        d, err = specimen_type_schema.dump(location)
        res = jsonify(data=d, error=err)
        return res
    except NoResultFound:
        raise InvalidUsage("Specimen Type does not exist", status_code=404)


@app.route('/specimen-type/<int:specimen_type_id>', methods=['DELETE'])
def delete_specimen_type(specimen_type_id):
    try:
        db.delete_specimen_type(specimen_type_id)
        return jsonify(success=True, error={})
    except UnmappedInstanceError:
        raise InvalidUsage("Specimen Type does not exist", status_code=404)
    except IntegrityError as e:
        if "FOREIGN KEY" in e.args[0]:
            raise InvalidUsage("Cannot Delete Specimen Type -- Currently In Use", status_code=403)
        else:
            raise InvalidUsage(parse_integrity_error(e), status_code=403)


@app.route('/study-subject/<int:study_subject_id>', methods=['DELETE'])
def delete_study_subject(study_subject_id):
    try:
        db.delete_study_subject(study_subject_id)
        return jsonify(success=True, error={})
    except ValueError as e:
        raise InvalidUsage(e.args[0], status_code=403)
    except NoResultFound:
        raise InvalidUsage("Study Subject Does Not Exist", status_code=404)


@app.route('/plate', methods=['GET'])
def get_plates():
    plates = db.get_matrix_plates()
    d, err = matrix_plate_schema.dump(plates, many=True)
    return jsonify(data=d, error=err)


@app.route('/plate/<int:plate_id>', methods=['GET'])
def get_plate(plate_id):
    try:
        plate, study_subjects, specimens, matrix_tubes = db.get_matrix_plate(plate_id)
        if not plate:
            raise NoResultFound
        plate_entry, plate_err = matrix_plate_schema.dump(plate)
        study_subject_entry, study_subject_err = study_subject_schema.dump(study_subjects, many=True)
        specimen_entry, specimen_err = specimen_schema.dump(specimens, many=True)
        matrix_tube_entry, matrix_tube_err = matrix_tube_schema.dump(matrix_tubes, many=True)
        d = {
            'matrix_plate': plate_entry,
            'study_subject': study_subject_entry,
            'specimen': specimen_entry,
            'matrix_tube': matrix_tube_entry
        }
        err = {
            'matrix_plate': plate_err,
            'study_subject': study_subject_err,
            'specimen': specimen_err,
            'matrix_tube': matrix_tube_err
        }
        return jsonify(data=d, error=err)
    except NoResultFound:
        raise InvalidUsage("Plate does not exist", status_code=404)


@app.route('/plate/upload', methods=['POST'])
def upload_plate():
    bf = BaseFileManager()
    try:
        plate_file = request.files.get('files')
        plate_uid = request.form['plate_uid']
        location_id = int(request.form['location_id'])
        create_missing_subjects = request.form['create_missing_subjects']
        create_missing_specimens = request.form['create_missing_specimens']
        if plate_file:
            specimen_entries = bf.parse_new_plate_file(plate_file)
        else:
            specimen_entries = []
        matrix_plate, study_subjects, specimens, matrix_tubes = db.add_matrix_plate_with_specimens(plate_uid, location_id,
                                                                                     specimen_entries,
                                                                                     create_missing_specimens,
                                                                                     create_missing_subjects)
        plate_entry, plate_err = matrix_plate_schema.dump(matrix_plate)
        study_subject_entry, study_subject_err = study_subject_schema.dump(study_subjects, many=True)
        specimen_entry, specimen_err = specimen_schema.dump(specimens, many=True)
        matrix_tube_entry, matrix_tube_err = matrix_tube_schema.dump(matrix_tubes, many=True)
        d = {
            'matrix_plate': plate_entry,
            'study_subject': study_subject_entry,
            'specimen': specimen_entry,
            'matrix_tube': matrix_tube_entry
        }
        err = {
            'matrix_plate': plate_err,
            'study_subject': study_subject_err,
            'specimen': specimen_err,
            'matrix_tube': matrix_tube_err
        }
        return jsonify(data=d, error=err)
    except KeyError:
        raise InvalidUsage("File Malformed, should be .csv and header should contain ['Barcode', 'Well', 'UID', "
                           "'Specimen Type', 'Date', 'Study Short Code', 'Comments']", status_code=403)
    except IntegrityError as e:
        raise InvalidUsage(parse_integrity_error(e), status_code=403)
    except NoResultFound:
        raise InvalidUsage("File Malformed. Are all study codes valid and specimen types registered?", status_code=403)
    except DateParseError as e:
        raise InvalidUsage(e.message, status_code=403)
    except ValueError as e:
        raise InvalidUsage(e.args[0], status_code=403)


@app.route('/plate/update', methods=['POST'])
def update_plates():
    bf = BaseFileManager()
    try:
        plate_files = request.files.getlist('files')
        updated_matrix_tubes = []
        for plate_file in plate_files:
            updated_matrix_tubes += bf.parse_plate_update_file(plate_file)
        matrix_plates, study_subjects, specimens, matrix_tubes = db.update_matrix_tube_locations(updated_matrix_tubes)
        plate_entry, plate_err = matrix_plate_schema.dump(matrix_plates, many=True)
        study_subject_entry, study_subject_err = study_subject_schema.dump(study_subjects, many=True)
        specimen_entry, specimen_err = specimen_schema.dump(specimens, many=True)
        matrix_tube_entry, matrix_tube_err = matrix_tube_schema.dump(matrix_tubes, many=True)
        d = {
            'matrix_plate': plate_entry,
            'study_subject': study_subject_entry,
            'specimen': specimen_entry,
            'matrix_tube': matrix_tube_entry
        }
        err = {
            'matrix_plate': plate_err,
            'study_subject': study_subject_err,
            'specimen': specimen_err,
            'matrix_tube': matrix_tube_err
        }
        return jsonify(data=d, error=err)
    except KeyError:
        raise InvalidUsage("File Malformed, should be .csv, file names should be plate UID, and header should contain"
                           " ['Well', 'Barcode', 'Comments']", status_code=403)
    except IntegrityError:
        raise InvalidUsage("Tube Position Conflict. Make sure all plates with moved tubes are being updated.", status_code=403)
    except NoResultFound:
        raise InvalidUsage("One or more plates do not exist", status_code=403)
    except ValueError as e:
        raise InvalidUsage(e.args[0], status_code=403)


@app.route('/plate/<int:plate_id>', methods=['DELETE'])
def delete_plate(plate_id):
    try:
        db.delete_plate(plate_id)
        return jsonify(success=True, error={})
    except NoResultFound:
        raise InvalidUsage("Plate does not exist", status_code=404)
    except IntegrityError as e:
        raise InvalidUsage(parse_integrity_error(e), status_code=403)


@app.route('/search/specimen', methods=['POST'])
def search_for_specimens():
    bf = BaseFileManager()
    try:
        search_file = request.files.get('files')
        parsed_specimen_entries = bf.parse_specimen_search_file(search_file)
        matrix_tubes = db.find_specimens(parsed_specimen_entries)
        header = matrix_tubes[0].keys()
        header.remove('Well')
        header.remove('Plate UID')
        header = ['Plate UID', 'Well'] + header
        temp_path = bf.create_specimen_search_file(matrix_tubes, header)
        return send_file(temp_path, as_attachment=True, attachment_filename="specimen_search.csv")
    except DateParseError as e:
        raise InvalidUsage(e.message, status_code=403)
    except KeyError:
        raise InvalidUsage("File Malformed, should be .csv, header should contain"
                           " ['UID', 'Study Short Code', 'Specimen Type', 'Date']", status_code=403)
    except ValueError as e:
        raise InvalidUsage(e.args[0], status_code=403)


@app.route('/search/barcode', methods=['POST'])
def search_by_barcode():
    bf = BaseFileManager()
    try:
        search_file = request.files.get('files')
        barcoded_entries, fields, barcode_index = bf.parse_barcode_search_file(search_file)
        entries = db.convert_barcoded_entries(barcoded_entries)
        if entries:
            if 'Date' in entries[0].keys():
                new_header = ['Study Subject UID', 'Study Short Code', 'Date', 'Specimen Type', 'Comments']
            else:
                new_header = ['Study Subject UID', 'Study Short Code', 'Specimen Type', 'Comments']
            header = fields[:barcode_index] + new_header + fields[barcode_index + 1:]
            temp_path = bf.create_barcode_search_file(entries, header)
            return send_file(temp_path, as_attachment=True, attachment_filename="barcode_search.csv")
        else:
            raise InvalidUsage("File could not be converted.", status_code=403)
    except KeyError:
        raise InvalidUsage("File Malformed, should be .csv and header should contain ['Barcode']", status_code=403)
    except ValueError as e:
        raise InvalidUsage(e.args[0], status_code=403)


@app.route('/bulk/delete/specimen', methods=['POST'])
def delete_specimens():
    bf = BaseFileManager()
    try:
        specimens_file = request.files.get('files')
        parsed_specimen_entries = bf.parse_specimen_search_file(specimens_file)
        matrix_tubes = db.get_matrix_tubes_from_specimens(parsed_specimen_entries)
        specimens = [_.specimen for _ in matrix_tubes]
        matrix_tube_ids, specimen_ids = db.delete_matrix_tubes_and_specimens(matrix_tubes, specimens)
        return jsonify(data={'matrix_tube_ids': matrix_tube_ids,
                             'specimen_ids': specimen_ids},
                       error={})
    except KeyError:
        raise InvalidUsage("File Malformed, should be .csv, header should contain"
                           " ['UID', 'Study Short Code', 'Specimen Type', 'Date']", status_code=403)
    except ValueError as e:
        raise InvalidUsage(e.args[0], status_code=403)


@app.route('/bulk/delete/barcode', methods=['POST'])
def delete_barcodes():
    bf = BaseFileManager()
    try:
        barcodes_file = request.files.get('files')
        barcodes = bf.parse_barcode_file(barcodes_file)
        matrix_tubes = db.get_matrix_tubes(barcodes)
        specimens = [_.specimen for _ in matrix_tubes]
        matrix_tube_ids, specimen_ids = db.delete_matrix_tubes_and_specimens(matrix_tubes, specimens)
        return jsonify(data={'matrix_tube_ids': matrix_tube_ids,
                             'specimen_ids': specimen_ids},
                       error={})
    except KeyError:
        raise InvalidUsage("File Malformed, should be .csv, header should contain"
                           " ['Barcode']", status_code=403)
    except ValueError as e:
        raise InvalidUsage(e.args[0], status_code=403)

