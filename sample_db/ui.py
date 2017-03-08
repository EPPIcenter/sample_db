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

import urwid
from models import *
from urwid.split_repr import python3_repr
from sqlalchemy.exc import IntegrityError

SAMPLE_DB_TITLE = u"""
===========================================================================================
|      _______.     ___      .___  ___. .______    __       _______  _______  .______     |
|     /       |    /   \     |   \/   | |   _  \  |  |     |   ____||       \ |   _  \    |
|    |   (----`   /  ^  \    |  \  /  | |  |_)  | |  |     |  |__   |  .--.  ||  |_)  |   |
|     \   \      /  /_\  \   |  |\/|  | |   ___/  |  |     |   __|  |  |  |  ||   _  <    |
| .----)   |    /  _____  \  |  |  |  | |  |      |  `----.|  |____ |  '--'  ||  |_)  |   |
| |_______/    /__/     \__\ |__|  |__| | _|      |_______||_______||_______/ |______/    |
===========================================================================================
    * By the Greenhouse Lab  *
    *       <Maxwell Murphy> *
    *       <Jordan Wilheim> *
    **************************
"""


class Row(urwid.WidgetWrap):
    signals = ["click"]

    def __init__(self, entry):
        cols = []
        for col in entry:
            cols.append(urwid.SelectableIcon(str(col), 0))

        cols = urwid.Columns(cols, dividechars=3)

        super(Row, self).__init__(cols)

    def keypress(self, size, key):
        if self._command_map[key] != urwid.ACTIVATE:
            return key

        self._emit('click')

    def mouse_event(self, size, event, button, x, y, focus):
        if button != 1 or not urwid.wimp.is_mouse_press(event):
            return False

        self._emit('click')
        return True


class Header(urwid.WidgetWrap):
    def __init__(self, entry):
        cols = []
        for col in entry:
            cols.append(urwid.Text(col))
        cols = urwid.Columns(cols, dividechars=3)
        super(Header, self).__init__(cols)


class MainView(object):
    def __init__(self, body, header=None, footer=None, overlay=True):
        self._main_frame = urwid.Frame(urwid.AttrWrap(body, 'body'))
        if header:
            self._main_frame.header = header

        if footer:
            self._main_frame.footer = footer

        if overlay:
            self.main_frame = urwid.Overlay(self._main_frame, urwid.SolidFill(u'\N{MEDIUM SHADE}'),
                                            align='center', width=('relative', 85),
                                            valign='middle', height=('relative', 85),
                                            min_width=91, min_height=25)
        else:
            self.main_frame = self._main_frame

    def rebuild(self, body=None, header=None, footer=None, overlay=True):
        if body:
            self._main_frame = urwid.Frame(urwid.AttrWrap(body, 'body'))

        if header:
            self._main_frame.header = header
        else:
            self._main_frame.header = None

        if footer:
            self._main_frame.footer = footer
        else:
            self._main_frame.footer = None

        if overlay:
            self.main_frame = urwid.Overlay(self._main_frame, urwid.SolidFill(u'\N{MEDIUM SHADE}'),
                                            align='center', width=('relative', 85),
                                            valign='middle', height=('relative', 85),
                                            min_width=91, min_height=25)
        else:
            self.main_frame = self._main_frame
        loop.widget = self.main_frame

    def set_header(self, header):
        self._main_frame.header = header

    def set_footer(self, footer):
        self._main_frame.footer = footer

    def set_body(self, body):
        self._main_frame.body = urwid.AttrWrap(body, 'body')


class IntroView(MainView):
    def __init__(self, continue_func):
        self.main_text = urwid.Text(SAMPLE_DB_TITLE, align=urwid.CENTER)
        self.continue_button = urwid.Button('Start Program')
        urwid.connect_signal(self.continue_button, 'click', continue_func)
        self.continue_button = urwid.AttrWrap(self.continue_button, 'buttn', 'buttnf')

        widget = urwid.ListBox(urwid.SimpleListWalker([
            self.main_text,
            self.continue_button
        ]))

        super(IntroView, self).__init__(widget)


class MenuView(MainView):
    # global loop

    def __init__(self, prompt_text, menu_items):
        self.prompt_text = urwid.Text(prompt_text)
        self.menu_items = []

        for item in menu_items:
            m = urwid.Button(item[0])
            urwid.connect_signal(m, 'click', item[1])
            self.menu_items.append(urwid.AttrWrap(m, 'buttn', 'buttnf'))

        widget = urwid.ListBox(
            urwid.SimpleFocusListWalker([self.prompt_text, urwid.Pile(self.menu_items)])
        )

        super(MenuView, self).__init__(widget)


class AddStudyView(MainView):
    def __init__(self, db, cancel_callback, success_callback):
        self.db = db
        self.success_callback = success_callback
        self.cancel_callback = cancel_callback
        self.study_title = ""
        self.study_short_code = ""
        self.study_is_longitudinal = False
        self.study_lead_person = ""
        self.study_description = ""
        widget = self._compile_form()
        super(AddStudyView, self).__init__(widget)

    def _compile_form(self):
        submit_button = urwid.Button('Submit')
        urwid.connect_signal(submit_button, 'click', self._save_study)
        cancel_button = urwid.Button('Cancel')
        urwid.connect_signal(cancel_button, 'click', self._cancel_save)

        study_title_field = urwid.Edit('Study Title: ', self.study_title)
        urwid.connect_signal(study_title_field, 'change', lambda _, text: self._update_field('study_title', text))

        study_short_code_field = urwid.Edit('Study Short Code: ', self.study_short_code)
        urwid.connect_signal(study_short_code_field, 'change',
                             lambda _, text: self._update_field('study_short_code', text))

        study_lead_person_field = urwid.Edit('Study Lead Person: ', self.study_lead_person)
        urwid.connect_signal(study_lead_person_field, 'change',
                             lambda _, text: self._update_field('study_lead_person', text))

        study_description_field = urwid.Edit('Study Description: ', self.study_description)
        urwid.connect_signal(study_description_field, 'change',
                             lambda _, text: self._update_field('study_description', text))

        study_is_longitudinal_field = urwid.CheckBox('Is Longitudinal?')
        urwid.connect_signal(study_is_longitudinal_field, 'change',
                             lambda _, state: self._update_field('study_is_longitudinal', state))

        entry_form = urwid.Padding(urwid.Pile(
            [study_title_field, study_short_code_field, study_lead_person_field, study_description_field,
             study_is_longitudinal_field]), left=2)

        widget = urwid.ListBox(
            urwid.SimpleFocusListWalker([
                urwid.Text('Create a new study'),
                entry_form,
                urwid.Divider('='),
                urwid.Divider('='),
                urwid.Pile([
                    urwid.AttrWrap(submit_button, 'buttn', 'buttnf'),
                    urwid.Divider(" "),
                    urwid.AttrWrap(cancel_button, 'buttn', 'buttnf')
                ])
            ])
        )

        return widget

    def _clear_form(self):
        self.study_title = ""
        self.study_short_code = ""
        self.study_is_longitudinal = False
        self.study_lead_person = ""
        self.study_description = ""
        self.rebuild(self._compile_form())

    def _save_study(self, _):
        try:
            self.db.create_study(self.study_title, self.study_short_code, self.study_is_longitudinal,
                                 self.study_lead_person, self.study_description)
            self._clear_form()
            self.success_callback()
        except (ValueError, IntegrityError) as e:
            error = "Failed to Add study: {}".format(e.message)
            self.set_footer(urwid.AttrWrap(urwid.Text(error), 'failure'))

    def _cancel_save(self, _):
        self._clear_form()
        self.cancel_callback()

    def _update_field(self, field, val):
        setattr(self, field, val)


class EditStudyView(MainView):
    def __init__(self, db, done_callback):
        self.db = db
        self.done_callback = done_callback
        widget = self._compile_select_menu()
        super(EditStudyView, self).__init__(widget)

    def _compile_select_menu(self):
        studies = self.db.get_studies()
        study_entries = []
        for study in studies:
            study_entry = Row([study.title, study.short_code, study.lead_person, study.is_longitudinal,
                               study.description])
            urwid.connect_signal(study_entry, 'click', lambda short_code, _: self._load_edit_menu(short_code),
                                 user_args=[study.short_code])
            study_entry = urwid.AttrWrap(study_entry, 'buttn', 'buttnf')
            study_entries.append(study_entry)
        done_button = urwid.Button("Done")
        urwid.connect_signal(done_button, 'click', lambda _: self.done_callback(None))
        done_button = urwid.AttrWrap(done_button, 'buttn', 'buttnf')

        widget = urwid.ListBox(
            urwid.SimpleFocusListWalker([
                urwid.AttrWrap(Header(['Title', 'Short Code', 'Lead Person', 'Longitudinal', 'Description']), 'header'),
                urwid.Pile(study_entries),
                urwid.Divider("="),
                done_button
            ])
        )
        return widget

    def _compile_edit_menu(self):
        save_button = urwid.Button('Save')
        urwid.connect_signal(save_button, 'click', lambda _: self._save_study())

        cancel_button = urwid.Button('Cancel')
        urwid.connect_signal(cancel_button, 'click', lambda _: self._cancel_save())

        delete_button = urwid.Button('Delete')
        urwid.connect_signal(delete_button, 'click', lambda _: self._delete_study())

        study_title_field = urwid.Edit('Study Title: ', "")
        if self.study.title:
            study_title_field.set_edit_text(self.study.title)
        urwid.connect_signal(study_title_field, 'change', lambda _, text: self._update_field('title', text))

        study_short_code_field = urwid.Edit('Study Short Code: ', "")
        if self.study.short_code:
            study_short_code_field.set_edit_text(self.study.short_code)
        urwid.connect_signal(study_short_code_field, 'change',
                             lambda _, text: self._update_field('short_code', text))

        study_lead_person_field = urwid.Edit('Study Lead Person: ', "")
        if self.study.lead_person:
            study_lead_person_field.set_edit_text(self.study.lead_person)
        urwid.connect_signal(study_lead_person_field, 'change',
                             lambda _, text: self._update_field('lead_person', text))

        study_description_field = urwid.Edit('Study Description: ', "")
        if self.study.description:
            study_description_field.set_edit_text(self.study.description)
        urwid.connect_signal(study_description_field, 'change',
                             lambda _, text: self._update_field('description', text))

        study_is_longitudinal_field = urwid.CheckBox('Is Longitudinal?')
        study_is_longitudinal_field.set_state(self.study.is_longitudinal)
        urwid.connect_signal(study_is_longitudinal_field, 'change',
                             lambda _, state: self._update_field('is_longitudinal', state))

        entry_form = urwid.Padding(urwid.Pile(
            [study_title_field, study_short_code_field, study_lead_person_field, study_description_field,
             study_is_longitudinal_field]), left=2)

        widget = urwid.ListBox(
            urwid.SimpleFocusListWalker([
                urwid.Text('Editing Study'),
                entry_form,
                urwid.Divider('='),
                urwid.Divider('='),
                urwid.Pile([
                    urwid.AttrWrap(save_button, 'buttn', 'buttnf'),
                    urwid.Divider(" "),
                    urwid.AttrWrap(cancel_button, 'buttn', 'buttnf'),
                    urwid.Divider(" "),
                    urwid.AttrWrap(delete_button, 'buttn', 'buttnf')
                ])
            ])
        )

        return widget

    def _update_field(self, k, v):
        try:
            setattr(self.study, k, v)
        except ValueError as e:
            error = urwid.AttrWrap(urwid.Text("Cannot change value: {}".format(e.message)), 'failure')
            self.set_footer(error)

    def _load_edit_menu(self, short_code):
        self.study = self.db.get_study(short_code)
        self.rebuild(self._compile_edit_menu())

    def _save_study(self):
        try:
            self.db.edit_study(self.study)
            self.set_body(self._compile_select_menu())
            self.set_footer(urwid.AttrWrap(urwid.Text("Successfully Edited Study"), 'success'))
        except (ValueError, IntegrityError) as e:
            error = "Failed to edit study: {}".format(e.message)
            self.set_footer(urwid.AttrWrap(urwid.Text(error), 'failure'))

    def _cancel_save(self):
        self.set_body(self._compile_select_menu())
        self.set_footer(urwid.AttrWrap(urwid.Text("Canceled Editing Study"), 'canceled'))

    def _delete_study(self):
        try:
            self.db.delete_study(self.study)
            self.set_body(self._compile_select_menu())
            self.set_footer(urwid.AttrWrap(urwid.Text("Successfully Deleted Study"), 'success'))
        except (ValueError, IntegrityError) as e:
            error = "Failed to delete study: {}".format(e.message)
            self.set_footer(urwid.AttrWrap(urwid.Text(error), 'failure'))

    def rebuild(self, body=None, header=None, footer=None, overlay=True):
        if not body:
            body = self._compile_select_menu()
        super(EditStudyView, self).rebuild(body=body)


class AddStorageLocationView(MainView):
    def __init__(self, db, done_callback):
        self.db = db
        self.done_callback = done_callback
        self.storage_location = ""
        widget = self._compile_add_menu()
        super(AddStorageLocationView, self).__init__(widget)

    def _compile_add_menu(self):
        save_button = urwid.Button('Save')
        urwid.connect_signal(save_button, 'click', lambda _: self._save_storage_location())

        cancel_button = urwid.Button('Cancel')
        urwid.connect_signal(cancel_button, 'click', lambda _: self._cancel_save())

        storage_location_field = urwid.Edit("Storage Location: ", self.storage_location)
        urwid.connect_signal(storage_location_field, 'change', lambda _, text: self._update_field('storage_location', text))

        entry_form = urwid.Padding(urwid.Pile(
            [storage_location_field]
        ), left=2)

        widget = urwid.ListBox(
            urwid.SimpleFocusListWalker([
                urwid.Text('Register a new storage location'),
                entry_form,
                urwid.Divider('='),
                urwid.Divider('='),
                urwid.Pile([
                    urwid.AttrWrap(save_button, 'buttn', 'buttnf'),
                    urwid.Divider(' '),
                    urwid.AttrWrap(cancel_button, 'buttn', 'buttnf')
                ])
            ])
        )

        return widget

    def _update_field(self, k, v):
        setattr(self, k, v)

    def _save_storage_location(self):
        try:
            self.db.register_new_location(self.storage_location)
            footer = urwid.AttrWrap(urwid.Text("Successfully registered new storage location: {}".format(self.storage_location)), 'success')
            self.done_callback(footer=footer)
        except (ValueError, IntegrityError) as e:
            error = "Failed to register new storage location: {}".format(e.message)
            footer = urwid.AttrWrap(urwid.Text(error), 'failure')
            self.rebuild(footer=footer)

    def _cancel_save(self):
        self.done_callback(urwid.AttrWrap(urwid.Text("Canceled Adding Storage Location"), 'canceled'))

    def rebuild(self, body=None, **kwargs):
        self.storage_location = ""
        if not body:
            body = self._compile_add_menu()
        super(AddStorageLocationView, self).rebuild(body, **kwargs)


class AddSpecimenTypeView(MainView):
    def __init__(self, db, done_callback):
        self.db = db
        self.done_callback = done_callback
        self.specimen_type = ""
        widget = self._compile_add_menu()
        super(AddSpecimenTypeView, self).__init__(widget)

    def _compile_add_menu(self):
        save_button = urwid.Button('Save')
        urwid.connect_signal(save_button, 'click', lambda _: self._save_specimen_type())

        cancel_button = urwid.Button('Cancel')
        urwid.connect_signal(cancel_button, 'click', lambda _: self._cancel_save())

        storage_location_field = urwid.Edit("Specimen Type: ", self.specimen_type)
        urwid.connect_signal(storage_location_field, 'change', lambda _, text: self._update_field('specimen_type', text))

        entry_form = urwid.Padding(urwid.Pile(
            [storage_location_field]
        ), left=2)

        widget = urwid.ListBox(
            urwid.SimpleFocusListWalker([
                urwid.Text('Register a new Specimen Type'),
                entry_form,
                urwid.Divider('='),
                urwid.Divider('='),
                urwid.Pile([
                    urwid.AttrWrap(save_button, 'buttn', 'buttnf'),
                    urwid.Divider(' '),
                    urwid.AttrWrap(cancel_button, 'buttn', 'buttnf')
                ])
            ])
        )

        return widget

    def _save_specimen_type(self):
        try:
            self.db.register_new_specimen_type(self.specimen_type)
            footer = urwid.AttrWrap(
                urwid.Text("Successfully registered new specimen type: {}".format(self.specimen_type)), 'success')
            self.rebuild(footer=footer)
        except (ValueError, IntegrityError) as e:
            error = "Failed to register new specimen type: {}".format(e.message)
            footer = urwid.AttrWrap(urwid.Text(error), 'failure')
            self.rebuild(footer=footer)

    def _update_field(self, k, v):
        setattr(self, k, v)

    def _cancel_save(self):
        self.done_callback(urwid.AttrWrap(urwid.Text("Canceled Registering New Specimen Type"), 'canceled'))

    def rebuild(self, body=None, **kwargs):
        self.specimen_type = ""
        if not body:
            body = self._compile_add_menu()
        super(AddSpecimenTypeView, self).rebuild(body, **kwargs)


class AddSamplesFromFileView(MainView):
    def __init__(self, db, file_manager, done_callback):
        self.db = db
        self.done_callback = done_callback
        self.file_manager = file_manager
        self.file_location = ""
        self.study_short_code = ""
        widget = self._compile_add_menu()
        super(AddSamplesFromFileView, self).__init__(widget)

    def _compile_add_menu(self):
        save_button = urwid.Button('Add Samples')
        urwid.connect_signal(save_button, 'click', lambda _: self._add_samples())

        cancel_button = urwid.Button('Cancel')
        urwid.connect_signal(cancel_button, 'click', lambda _: self._cancel_add_samples())

        if self.study_short_code:
            study_field = urwid.Text("Selected Study: {}".format(self.study_short_code))
        else:
            study_field = urwid.Button("Select a Study")
            urwid.connect_signal(study_field, 'click', lambda _: self._load_select_study_menu())
            study_field = urwid.AttrWrap(study_field, 'buttn', 'buttnf')

        file_location_field = urwid.Edit("File Location: ", self.file_location)
        urwid.connect_signal(file_location_field, 'change', lambda _, text: self._update_field('file_location', text))

        entry_form = urwid.Padding(urwid.Pile(
            [study_field, file_location_field]
        ), left=2)

        widget = urwid.ListBox(
            urwid.SimpleFocusListWalker([
                urwid.Text('Add Samples to Study'),
                entry_form,
                urwid.Divider('='),
                urwid.Divider('='),
                urwid.Pile([
                    urwid.AttrWrap(save_button, 'buttn', 'buttnf'),
                    urwid.Divider(' '),
                    urwid.AttrWrap(cancel_button, 'buttn', 'buttnf')
                ])
            ])
        )

        return widget

    def _compile_select_study_menu(self):
        studies = self.db.get_studies()
        if not studies:
            raise ValueError('No Studies Currently Exist.')

        study_entries = []
        for study in studies:
            study_entry = Row([study.title, study.short_code, study.lead_person, study.is_longitudinal,
                               study.description])
            urwid.connect_signal(study_entry, 'click', lambda short_code, _: self._select_study(short_code),
                                 user_args=[study.short_code])
            study_entry = urwid.AttrWrap(study_entry, 'buttn', 'buttnf')
            study_entries.append(study_entry)
        done_button = urwid.Button("Done")
        urwid.connect_signal(done_button, 'click', lambda _: self.done_callback(None))
        done_button = urwid.AttrWrap(done_button, 'buttn', 'buttnf')

        widget = urwid.ListBox(
            urwid.SimpleFocusListWalker([
                urwid.AttrWrap(Header(['Title', 'Short Code', 'Lead Person', 'Longitudinal', 'Description']), 'header'),
                urwid.Divider("="),
                urwid.Pile(study_entries),
                urwid.Divider("="),
                done_button
            ])
        )
        return widget

    def _load_select_study_menu(self):
        try:
            self.set_body(self._compile_select_study_menu())
        except ValueError as e:
            error = urwid.AttrWrap(urwid.Text(e.message), 'failure')
            self.set_footer(error)

    def _select_study(self, short_code):
        self.study_short_code = short_code
        self.set_body(self._compile_add_menu())

    def _add_samples(self):
        if not self.study_short_code:
            error = urwid.AttrWrap(urwid.Text("No Study Selected."), 'failure')
            self.set_footer(error)
        elif not self.file_location:
            error = urwid.AttrWrap(urwid.Text("No File Selected."), 'failure')
            self.set_footer(error)
        else:
            try:
                study_subject_uids = self.file_manager.parse_study_subject_file(self.file_location)
                self.db.add_study_subjects(study_subject_uids, self.study_short_code)
                self.done_callback(urwid.AttrWrap(urwid.Text("Successfully Added Subjects to Study {}".format(self.study_short_code)), 'success'))
            except (ValueError, IntegrityError) as e:
                error = urwid.AttrWrap(urwid.Text("Could not add Study Subjects: {}".format(e.message)), 'failure')
                self.set_footer(error)

    def _cancel_add_samples(self):
        self.done_callback(urwid.AttrWrap(urwid.Text("Canceled Adding New Subjects to Study"), 'canceled'))

    def _update_field(self, k, v):
        setattr(self, k, v)

    def rebuild(self, body=None, **kwargs):
        self.file_location = ""
        self.study_short_code = ""
        if not body:
            body = self._compile_add_menu()
        super(AddSamplesFromFileView, self).rebuild(body=body, **kwargs)


class BrowseSubjectView(MainView):
    def __init__(self, db, done_callback):
        self.db = db
        self.done_callback = done_callback
        self.study = None
        self.subject = None
        widget = self._compile_select_study_menu()
        super(BrowseSubjectView, self).__init__(widget)

    def _compile_select_study_menu(self):
        studies = self.db.get_studies()
        if not studies:
            raise ValueError('No Studies Currently Exist.')

        study_entries = []
        for study in studies:
            study_entry = Row([study.title, study.short_code, study.lead_person, study.is_longitudinal,
                               study.description])
            urwid.connect_signal(study_entry, 'click', lambda study, _: self._select_study(study),
                                 user_args=[study])
            study_entry = urwid.AttrWrap(study_entry, 'buttn', 'buttnf')
            study_entries.append(study_entry)
        done_button = urwid.Button("Done")
        urwid.connect_signal(done_button, 'click', lambda _: self.done_callback(None))
        done_button = urwid.AttrWrap(done_button, 'buttn', 'buttnf')

        widget = urwid.ListBox(
            urwid.SimpleFocusListWalker([
                urwid.AttrWrap(Header(['Title', 'Short Code', 'Lead Person', 'Longitudinal', 'Description']), 'header'),
                urwid.Pile(study_entries),
                urwid.Divider("="),
                done_button
            ])
        )
        return widget

    def _select_study(self, study):
        self.study = study
        self.set_body(self._compile_select_study_subject_menu())

    def _compile_select_study_subject_menu(self):
        study_subjects = self.study.subjects
        study_subjects.sort(key=lambda _: _.uid)
        study_subject_entries = []
        for subject in study_subjects:
            study_subject_entry = Row([subject.uid])
            urwid.connect_signal(study_subject_entry, 'click', lambda s, _: self._select_subject(s), user_args=[subject])
            study_subject_entry = urwid.AttrWrap(study_subject_entry, 'buttn', 'buttnf')
            study_subject_entries.append(study_subject_entry)
        back_button = urwid.Button("Back")
        urwid.connect_signal(back_button, 'click', lambda _: self._load_study_menu())

        widget = urwid.ListBox(
            urwid.SimpleFocusListWalker([
                urwid.AttrWrap(Header(['Subject UID']), 'header'),
                urwid.Pile(study_subject_entries),
                urwid.Divider("="),
                back_button
            ])
        )

        return widget

    def _load_study_menu(self):
        self.rebuild()

    def _select_subject(self, subject):
        self.subject = subject
        self.set_body(self._compile_subject_detail())

    def _compile_subject_detail(self):
        specimens = self.subject.specimens
        specimens.sort(key=lambda _: (_.specimen_type.label, _.collection_date))
        specimen_entries = []
        for specimen in specimens:
            for container in specimen.storage_containers:
                if container.exhausted:
                    exhausted = "X"
                else:
                    exhausted = ""

                e = Row([specimen.specimen_type.label, str(specimen.collection_date), container.plate.uid, container.well_position, exhausted, container.comments])
                specimen_entries.append(e)

        back_button = urwid.Button("Back")
        urwid.connect_signal(back_button, 'click', lambda _: self._select_study(self.study))

        widget = urwid.ListBox(
            urwid.SimpleFocusListWalker([
                urwid.AttrWrap(urwid.Text('{} - {} ... Specimens'.format(self.study.short_code, self.subject.uid)), 'header'),
                urwid.AttrWrap(Header(['Specimen Type', 'Collection Date', 'Plate UID', 'Well', 'Exhausted', 'Comments']), 'header'),
                urwid.Pile(specimen_entries),
                urwid.Divider("="),
                back_button
            ])
        )

        return widget

    def rebuild(self, body=None, **kwargs):
        self.study = None
        self.subject = None
        if not body:
            body = self._compile_select_study_menu()
        super(BrowseSubjectView, self).rebuild(body, **kwargs)


class SearchSubjectSpecimenView(MainView):
    def __init__(self, db, file_manager, done_callback):
        self.db = db
        self.file_manager = file_manager
        self.done_callback = done_callback
        self.file_location = ""
        self.specimen_type = None
        widget = self._compile_search_menu()
        super(SearchSubjectSpecimenView, self).__init__(widget)

    def _compile_search_menu(self):
        search_button = urwid.Button('Search for Specimens')
        urwid.connect_signal(search_button, 'click', lambda _: self._search_specimens())

        cancel_button = urwid.Button('Cancel')
        urwid.connect_signal(cancel_button, 'click', lambda _: self._cancel())

        if self.specimen_type:
            specimen_field = urwid.Text("Selected Specimen Type: {}".format(self.specimen_type.label))
        else:
            specimen_field = urwid.Button("Select Specimen Type")
            urwid.connect_signal(specimen_field, 'click', lambda _: self._load_select_specimen_menu())
            specimen_field = urwid.AttrWrap(specimen_field, 'buttn', 'buttnf')

        file_location_field = urwid.Edit("File Location: ", self.file_location)
        urwid.connect_signal(file_location_field, 'change', lambda _, text: self._update_field('file_location', text))

        entry_form = urwid.Padding(urwid.Pile(
            [specimen_field, file_location_field]
        ), left=2)

        widget = urwid.ListBox(
            urwid.SimpleFocusListWalker([
                urwid.AttrWrap(urwid.Text('Search For Study Subject Specimens'), 'header'),
                entry_form,
                urwid.Divider('='),
                urwid.Divider('='),
                urwid.Pile([
                    urwid.AttrWrap(search_button, 'buttn', 'buttnf'),
                    urwid.Divider(' '),
                    urwid.AttrWrap(cancel_button, 'buttn', 'buttnf')
                ])
            ])
        )

        return widget

    def _search_specimens(self):
        try:
            subject_queries = self.file_manager.parse_subject_search_file(self.file_location)

            specimen_results = []
            for sq in subject_queries:
                specimens = self.db.get_specimens(**sq)
                specimen_results += [_ for _ in specimens if _.specimen_type == self.specimen_type]

            containers = []
            for specimen in specimen_results:
                for container in specimen.storage_containers:
                    containers.append(container)
            containers.sort(key=lambda _: (_.plate.uid, _.well_position))

            header = ['Subject', 'Study Short Code', 'Specimen Type', 'Collection Date', 'Plate UID', 'Well', 'Exhausted', 'Comments']
            rows = [{
                'Subject': container.specimen.study_subject.uid,
                'Study Short Code': container.specimen.study_subject.study.title,
                'Specimen Type': container.specimen.specimen_type.label,
                'Collection Date': container.specimen.collection_date,
                'Plate UID': container.plate.uid,
                'Well': container.well_position,
                'Exhausted': container.exhausted,
                'Comments': container.comments
            } for container in containers]
            dest_file = self.file_manager.write_query(self.file_location, header, rows)
            self.done_callback(urwid.AttrWrap(urwid.Text("Search results in: {}".format(dest_file)), 'success'))
        except (ValueError, IntegrityError, IOError) as e:
            if isinstance(e, IOError):
                e.message = "{} is not a valid file".format(e.filename)
            error = "Could not Search Specimens: {}".format(e.message)
            self.set_footer(urwid.AttrWrap(urwid.Text(error), 'failure'))

    def _cancel(self):
        self.done_callback(urwid.AttrWrap(urwid.Text("Canceled Specimen Search"), 'canceled'))

    def _load_select_specimen_menu(self):
        specimen_types = self.db.get_specimen_types()
        specimen_types.sort(key=lambda _: _.label)
        specimen_entries = []
        for specimen_type in specimen_types:
            specimen_type_row = Row([specimen_type.label])
            urwid.connect_signal(specimen_type_row, 'click', lambda st, _: self._select_specimen_type(st), user_args=[specimen_type])
            specimen_type_row = urwid.AttrWrap(specimen_type_row, 'buttn', 'buttnf')
            specimen_entries.append(specimen_type_row)

        widget = urwid.ListBox(
            urwid.SimpleFocusListWalker([
                urwid.AttrWrap(urwid.Text("Available Specimen Types"), 'header'),
                Header(['Type']),
                urwid.Divider("="),
                urwid.Pile(specimen_entries),
            ])
        )
        self.set_body(widget)

    def _select_specimen_type(self, specimen_type):
        self.specimen_type = specimen_type
        self.set_body(self._compile_search_menu())

    def _update_field(self, k, v):
        setattr(self, k, v)

    def rebuild(self, body=None, **kwargs):
        self.specimen_type = None
        self.file_location = ""
        if not body:
            body = self._compile_search_menu()
        super(SearchSubjectSpecimenView, self).rebuild(body, **kwargs)


class LoadSpecimenPlateView(MainView):
    def __init__(self, db, file_manager, done_callback):
        self.db = db
        self.file_manager = file_manager
        self.done_callback = done_callback

        self.file_location = ""
        self.plate_uid = ""
        self.location = None
        self.create_missing_specimens = False

        widget = self._compile_load_plate_menu()
        super(LoadSpecimenPlateView, self).__init__(widget)

    def _compile_load_plate_menu(self):
        load_button = urwid.Button('Load Plate')
        urwid.connect_signal(load_button, 'click', lambda _: self._load_plate_file())

        cancel_button = urwid.Button('Cancel')
        urwid.connect_signal(cancel_button, 'click', lambda _: self._cancel())

        if self.location:
            location_field = urwid.Text("Selected Location: {}".format(self.location.description))
        else:
            location_field = urwid.Button("Select Location")
            urwid.connect_signal(location_field, 'click', lambda _: self._load_location_menu())
            location_field = urwid.AttrWrap(location_field, 'buttn', 'buttnf')

        plate_uid_field = urwid.Edit("Plate UID: ", self.plate_uid)
        urwid.connect_signal(plate_uid_field, 'change', lambda _, text: self._update_field('plate_uid', text))

        file_location_field = urwid.Edit("File Location: ", self.file_location)
        urwid.connect_signal(file_location_field, 'change', lambda _, text: self._update_field('file_location', text))

        create_missing_specimens_field = urwid.CheckBox('Create Missing Specimens?')
        urwid.connect_signal(create_missing_specimens_field, 'change',
                             lambda _, state: self._update_field('create_missing_specimens', state))

        entry_form = urwid.Padding(urwid.Pile(
            [location_field, plate_uid_field, create_missing_specimens_field, file_location_field]
        ), left=2)

        widget = urwid.ListBox(
            urwid.SimpleFocusListWalker([
                urwid.AttrWrap(urwid.Text('Load Specimen Plate'), 'header'),
                entry_form,
                urwid.Divider('='),
                urwid.Divider('='),
                urwid.Pile([
                    urwid.AttrWrap(load_button, 'buttn', 'buttnf'),
                    urwid.Divider(' '),
                    urwid.AttrWrap(cancel_button, 'buttn', 'buttnf')
                ])
            ])
        )

        return widget

    def _cancel(self):
        self.done_callback(urwid.AttrWrap(urwid.Text('Canceled Loading Plate'), 'canceled'))

    def _load_plate_file(self):
        try:
            parsed_specimens = self.file_manager.parse_specimen_plate_file(self.file_location)
            self.db.add_matrix_plate_with_specimens(self.plate_uid, self.location.id, parsed_specimens, self.create_missing_specimens)
            self.done_callback(urwid.AttrWrap(urwid.Text("Successfully Loaded {} Specimens".format(str(len(parsed_specimens)))), 'success'))
        except (ValueError, IntegrityError, IOError) as e:
            if isinstance(e, IOError):
                e.message = "{} is not a valid file".format(e.filename)
            error = urwid.AttrWrap(urwid.Text("Failed to load file: {}".format(e.message)), 'failure')
            self.set_footer(error)

    def _load_location_menu(self):
        locations = self.db.get_locations()
        locations.sort(key=lambda _: _.description)

        location_entries = []

        for location in locations:
            location_row = Row([location.description])
            urwid.connect_signal(location_row, 'click', lambda loc, _: self._select_location(loc), user_args=[location])
            location_row = urwid.AttrWrap(location_row, 'buttn', 'buttnf')
            location_entries.append(location_row)

        widget = urwid.ListBox(
            urwid.SimpleFocusListWalker([
                urwid.AttrWrap(urwid.Text("Available Locations"), 'header'),
                Header(['Location Description']),
                urwid.Divider("="),
                urwid.Pile(location_entries),
            ])
        )
        self.set_body(widget)

    def _select_location(self, location):
        self.location = location
        self.set_body(self._compile_load_plate_menu())

    def _update_field(self, k, v):
        setattr(self, k, v)

    def rebuild(self, body=None, **kwargs):
        self.file_location = ""
        self.plate_uid = ""
        self.location = None
        if not body:
            body = self._compile_load_plate_menu()
        super(LoadSpecimenPlateView, self).rebuild(body, **kwargs)


palette = [
    ('body', 'black', 'light gray', 'standout'),
    # ('reverse', 'light gray', 'black'),
    ('header', 'white', 'dark red', 'bold'),
    ('failure', 'white', 'dark red', 'bold'),
    ('success', 'white', 'dark green', 'bold'),
    ('canceled', 'black', 'yellow', 'bold'),
    # ('important', 'dark blue', 'light gray', ('standout', 'underline')),
    # ('editfc', 'white', 'dark blue', 'bold'),
    # ('editbx', 'light gray', 'dark blue'),
    # ('editcp', 'black', 'light gray', 'standout'),
    # ('bright', 'dark gray', 'light gray', ('bold', 'standout')),
    ('buttn', 'black', 'dark cyan'),
    ('buttnf', 'white', 'dark blue', 'bold'),
]
loop = urwid.MainLoop(urwid.Filler(urwid.Text("")), palette)


class MainApp(object):
    def __init__(self, db, fp):
        self.views = {
            'intro': IntroView(lambda _: self.change_view('main_menu')),
            'main_menu': MenuView('What would you like to do?',
                                  [
                                      (u'\N{BULLET} Add a New Study', lambda _: self.change_view('add_study')),

                                      (u'\N{BULLET} Edit a Study', lambda _: self.change_view('edit_study')),

                                      (u'\N{BULLET} Register a New Storage Location',
                                       lambda _: self.change_view('add_storage_location')),

                                      (u'\N{BULLET} Register a New Specimen Type',
                                       lambda _: self.change_view('add_specimen_type')),

                                      (u'\N{BULLET} Add New Subjects From File to Study',
                                       lambda _: self.change_view('add_samples_from_file')),

                                      (u'\N{BULLET} Browse Study Subjects',
                                       lambda _: self.change_view('browse_subjects')),

                                      (u'\N{BULLET} Search for Study Subject Specimens From File',
                                       lambda _: self.change_view('search_specimens_from_file')),

                                      (u'\N{BULLET} Load Specimen Plate',
                                       lambda _: self.change_view('load_specimen_plate')),

                                      (u'\N{BULLET} Update Scanned Plate',
                                       lambda _: self.change_view('search_sample')),

                                      (u'\N{BULLET} Convert Tube Barcodes',
                                       lambda _: self.change_view('search_sample')),

                                      (u'\N{BULLET} Flag Exhausted Specimens',
                                       lambda _: self.change_view('flag_exhausted_specimens')),

                                      (u'\N{BULLET} Exit the Program', self.exit_app)
                                  ]),
            'add_study': AddStudyView(db,
                                      cancel_callback=lambda: self.change_view('main_menu',
                                                                               footer=urwid.AttrWrap(
                                                                                   urwid.Text('Canceled adding study.'),
                                                                                   'canceled')),
                                      success_callback=lambda: self.change_view('main_menu',
                                                                                footer=urwid.AttrWrap(
                                                                                    urwid.Text(
                                                                                        'Successfully Created Study'),
                                                                                    'success'))
                                      ),
            'edit_study': EditStudyView(db, done_callback=lambda footer: self.change_view('main_menu', footer=footer)),
            'add_storage_location': AddStorageLocationView(db, done_callback=lambda footer: self.change_view('main_menu', footer=footer)),
            'add_specimen_type': AddSpecimenTypeView(db, done_callback=lambda footer: self.change_view('main_menu', footer=footer)),
            'add_samples_from_file': AddSamplesFromFileView(db, fp, done_callback=lambda footer: self.change_view('main_menu', footer=footer)),
            'browse_subjects': BrowseSubjectView(db, done_callback=lambda footer: self.change_view('main_menu', footer=footer)),
            'search_specimens_from_file': SearchSubjectSpecimenView(db, fp, done_callback=lambda footer: self.change_view('main_menu', footer=footer)),
            'load_specimen_plate': LoadSpecimenPlateView(db, fp, done_callback=lambda footer: self.change_view('main_menu', footer=footer))
        }

        self.change_view('intro')
        loop.run()

    def change_view(self, view, **kwargs):
        self.views[view].rebuild(**kwargs)

    @staticmethod
    def exit_app(self):
        raise urwid.ExitMainLoop()
