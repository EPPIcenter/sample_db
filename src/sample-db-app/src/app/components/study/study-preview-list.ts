import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Study } from '../../models/study';

@Component({
  selector: 'sdb-study-preview-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <sdb-study-preview *ngFor="let study of studies" [study]="study"></sdb-study-preview>
  `,
  styles: [`
    :host {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
        }
  `]
})
export class StudyPreviewListComponent {
  @Input() studies: Study[];
}
