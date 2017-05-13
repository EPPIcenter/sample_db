import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { go, replace, search, show, back, forward } from '@ngrx/router-store';

import * as fromRoot from '../../reducers';
import * as location from '../../actions/location';
import { Location } from '../../models/location';

@Component({
  selector: 'sdb-location-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <md-card class="location-form">
    <md-card-content>
      <form>
        <md-input-container class="full-width">
          <input mdInput type="text" id="description" name="description" placeholder="Description"
          required [(ngModel)]="location.description">
        </md-input-container>
        <md-input-container *ngIf="location.created" class="full-width">
          <input mdInput type="text" id="created" name="created" placeholder="Created"
           disabled [(ngModel)]="location.created">
        </md-input-container>
        <md-input-container *ngIf="location.last_updated" class="full-width">
          <input mdInput type="text" id="last_updated" name="last_updated" placeholder="Last Updated"
           disabled [(ngModel)]="location.last_updated">
        </md-input-container>
      </form>
    </md-card-content>
    <md-card-actions>
      <button md-raised-button color="primary" (click)="submitButton.emit()">Submit</button>
      <button md-raised-button color="accent" (click)="cancelButton.emit()">Cancel</button>
    </md-card-actions>
    <md-card-footer>
      <span class="error">{{error}}</span>
    </md-card-footer>
  </md-card>
  `,
  styles: [`
    :host {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
    }
    .location-form {
      width: 75%;
    }
    .full-width {
      width: 100%;
    }
    button {
      margin-top: 10px;
    }
    md-card {
      margin-top: 15px;
    }
    .error {
      font-size: 12px;
      color: red;
    }
  `]
})
export class LocationFormComponent {
  @Input() location: Location;
  @Input() error: string;
  @Output() submitButton = new EventEmitter();
  @Output() cancelButton = new EventEmitter();

  constructor() { }
}
