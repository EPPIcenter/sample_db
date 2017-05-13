import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { go, replace, search, show, back, forward } from '@ngrx/router-store';

import * as fromRoot from '../../reducers';
import * as specimenType from '../../actions/specimen-type';
import { SpecimenType } from '../../models/specimen-type';

@Component({
  selector: 'sdb-specimen-type-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <md-card class="specimenType-form">
    <md-card-content>
      <form>
        <md-input-container class="full-width">
          <input mdInput type="text" id="label" name="label" placeholder="Label"
          required [(ngModel)]="specimenType.label">
        </md-input-container>
        <md-input-container *ngIf="specimenType.created" class="full-width">
          <input mdInput type="text" id="created" name="created" placeholder="Created"
           disabled [(ngModel)]="specimenType.created">
        </md-input-container>
        <md-input-container *ngIf="specimenType.last_updated" class="full-width">
          <input mdInput type="text" id="last_updated" name="last_updated" placeholder="Last Updated"
           disabled [(ngModel)]="specimenType.last_updated">
        </md-input-container>
      </form>
    </md-card-content>
    <md-card-actions>
      <button md-raised-button color="primary" (click)="submitButton.emit()">Submit</button>
      <button md-raised-button color="accent" (click)="cancelButton.emit()">Cancel</button>
      <button *ngIf="showDeleteButton" md-raised-button color="warn" (click)="deleteButton.emit()">Delete</button>
    </md-card-actions>
    <md-card-footer *ngIf="updateError || deleteError">
      <span class="error">{{updateError}}</span>
      <span class="error">{{deleteError}}</span>
    </md-card-footer>
  </md-card>
  `,
  styles: [`
    :host {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
    }
    .specimenType-form {
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
export class SpecimenTypeFormComponent implements OnInit {
  @Input() specimenType: SpecimenType;
  @Input() updateError: string;
  @Input() deleteError: string;
  @Output() submitButton = new EventEmitter();
  @Output() cancelButton = new EventEmitter();
  @Output() deleteButton = new EventEmitter();

  showDeleteButton = false;

  constructor() { }

  ngOnInit() {
    this.showDeleteButton = this.deleteButton.observers.length > 0;
  }
}
