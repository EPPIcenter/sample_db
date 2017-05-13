import { Component, Input, Output, ChangeDetectionStrategy, EventEmitter } from '@angular/core';
import { Location } from '../../models/location';

@Component({
  selector: 'sdb-location-preview-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <md-card>
    <md-list>
      <sdb-location-preview *ngFor="let location of locations" [location]="location" (toggleEdit)="toggleEdit($event)"></sdb-location-preview>
    </md-list>
  </md-card>
  `,
  styles: [`

  `]
})
export class LocationPreviewListComponent {
  @Input() locations: Location[];
  @Output() toggleEditButton = new EventEmitter();

  toggleEdit(id: string) {
    this.toggleEditButton.emit(id);
  }
}
