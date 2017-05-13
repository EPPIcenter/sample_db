import { Component, Input, Output, ChangeDetectionStrategy, EventEmitter } from '@angular/core';
import { Location } from '../../models/location';

@Component({
  selector: 'sdb-location-preview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <md-list-item>
      <md-icon md-list-icon>place</md-icon>
        <h4 md-line>{{description}}</h4>
        <p md-line>Created: {{created | date}}</p>
        <button md-mini-fab (click)="toggleEdit.emit(id)">
          <md-icon>edit</md-icon>
        </button>
    </md-list-item>
    <md-divider></md-divider>
  `
})
export class LocationPreviewComponent {
  @Input() location: Location;
  @Output() toggleEdit = new EventEmitter();

  get description() {
    return this.location.description;
  }

  get created() {
    return this.location.created;
  }

  get id() {
    return this.location.id;
  }

}
