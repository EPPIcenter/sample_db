import { Component, Input, Output, ChangeDetectionStrategy, EventEmitter } from '@angular/core';
import { SpecimenType } from '../../models/specimen-type';

@Component({
  selector: 'sdb-specimen-type-preview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <md-list-item>
      <md-icon md-list-icon>adb</md-icon>
        <h4 md-line>{{label}}</h4>
        <p md-line>Created: {{created | date}}</p>
        <button md-mini-fab (click)="toggleEdit.emit(id)">
          <md-icon>edit</md-icon>
        </button>
    </md-list-item>
    <md-divider></md-divider>
  `
})
export class SpecimenTypePreviewComponent {
  @Input() specimenType: SpecimenType;
  @Output() toggleEdit = new EventEmitter();

  get label() {
    return this.specimenType.label;
  }

  get created() {
    return this.specimenType.created;
  }

  get id() {
    return this.specimenType.id;
  }

}
