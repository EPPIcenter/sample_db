import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { MatrixPlate } from '../../models/plate';
import { Location } from '../../models/location';

@Component({
  selector: 'sdb-plate-preview-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <sdb-plate-preview *ngFor="let plate of plates" [plate]="plate" [location]="locations[plate.location]"></sdb-plate-preview>
  `,
  styles: [`
    :host {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
        }
  `]
})
export class MatrixPlatePreviewListComponent {
  @Input() plates: MatrixPlate[];
  @Input() locations: Location[];
}
