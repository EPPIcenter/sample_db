import { Component, Input, Output, ChangeDetectionStrategy, EventEmitter } from '@angular/core';
import { SpecimenType } from '../../models/specimen-type';

@Component({
  selector: 'sdb-specimen-type-preview-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <md-card>
    <md-list>
      <sdb-specimen-type-preview *ngFor="let specimenType of specimenTypes" [specimenType]="specimenType" (toggleEdit)="toggleEdit($event)">
      </sdb-specimen-type-preview>
    </md-list>
  </md-card>
  `,
  styles: [`

  `]
})
export class SpecimenTypePreviewListComponent {
  @Input() specimenTypes: SpecimenType[];
  @Output() toggleEditButton = new EventEmitter();

  toggleEdit(id: string) {
    this.toggleEditButton.emit(id);
  }
}
