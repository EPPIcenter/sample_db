import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Study } from '../../models/study';

@Component({
  selector: 'sdb-study-preview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a [routerLink]="['/study', id]">
      <md-card>
        <md-card-title-group>
          <md-card-title>{{ title }}</md-card-title>
          <md-card-subtitle *ngIf="shortCode">{{ shortCode }}</md-card-subtitle>
        </md-card-title-group>
        <md-card-content>
          <p><span><small>Created: {{created | date:'mediumDate'}}</small></span></p>
          <p><span>Lead: {{leadPerson}}</span></p>
          <p *ngIf="description"><span>Description: {{description | sdbEllipsis:40}}</span></p>
        </md-card-content>
      </md-card>
    </a>
  `,
  styles: [`
    md-card {
      width: 300px;
      height: 150px;
      margin: 10px;
    }
    @media only screen and (max-width: 768px) {
      md-card {
        margin: 10px 0 !important;
      }
    }
    md-card:hover {
      box-shadow: 3px 3px 16px -2px rgba(0, 0, 0, .5);
    }
    md-card-title {
      margin-right: 10px;
    }
    md-card-title-group {
      margin: 0;
    }
    a {
      color: inherit;
      text-decoration: none;
    }
    img {
      width: 60px;
      min-width: 60px;
      margin-left: 5px;
    }
    md-card-content {
      margin-top: 10px;
      margin: 10px 0 0;
    }
    span {
      display: inline-block;
      font-size: 13px;
    }
    md-card-footer {
      padding: 0 25px 25px;
    }
  `]
})
export class StudyPreviewComponent {
  @Input() study: Study;

  get id() {
    return this.study.id;
  }

  get description() {
    return this.study.description;
  }

  get shortCode() {
    return this.study.short_code;
  }

  get leadPerson() {
    return this.study.lead_person;
  }

  get title() {
    return this.study.title;
  }

  get created() {
    return this.study.created;
  }
}
