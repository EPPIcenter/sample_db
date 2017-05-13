import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { go, replace, search, show, back, forward } from '@ngrx/router-store';

import * as fromRoot from '../../reducers';
import * as study from '../../actions/study';
import { Study } from '../../models/study';

@Component({
  selector: 'sdb-study-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <md-card class="study-form">
    <md-card-content>
      <form>
        <md-input-container class="full-width">
          <input mdInput required type="text" id="title" name="title" placeholder="Title" [(ngModel)]="study.title">
        </md-input-container>
        <md-input-container *ngIf="study.created" class="full-width">
          <input mdInput type="text" id="created" name="created" placeholder="Created" disabled [(ngModel)]="study.created">
        </md-input-container>
        <md-input-container *ngIf="study.last_updated" class="full-width">
          <input mdInput type="text" id="last_updated" name="last_updated" placeholder="Last Updated"
           disabled [(ngModel)]="study.last_updated">
        </md-input-container>
        <md-input-container class="full-width">
          <input mdInput type="text" id="description" name="description" placeholder="Description" [(ngModel)]="study.description">
        </md-input-container>
        <md-input-container class="full-width">
          <input mdInput required type="text" id="short_code" name="short_code" placeholder="Short Code" [(ngModel)]="study.short_code">
        </md-input-container>
        <md-input-container class="full-width">
          <input mdInput required type="text" id="lead_person" name="lead_person" placeholder="Lead Person" [(ngModel)]="study.lead_person">
        </md-input-container>
        <md-checkbox name="is_longitudinal" id="is_longitudinal" [(ngModel)]="study.is_longitudinal">Longitudinal</md-checkbox>
      </form>
    </md-card-content>
    <md-card-actions>
      <button md-raised-button color="primary" (click)="submitButton.emit()">Submit</button>
      <button md-raised-button color="accent" (click)="cancelButton.emit()">Cancel</button>
    </md-card-actions>
    <md-card-footer *ngIf="error">
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
    .study-form {
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
export class StudyFormComponent {
  @Input() study: Study;
  @Input() error: string;
  @Output() submitButton = new EventEmitter();
  @Output() cancelButton = new EventEmitter();

  constructor() {  }



}
