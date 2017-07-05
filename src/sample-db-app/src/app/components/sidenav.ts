import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'sdb-sidenav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <md-sidenav [opened]="open" [disableClose]="disableClose" >
      <md-nav-list>
        <ng-content></ng-content>
      </md-nav-list>
    </md-sidenav>
  `,
  styles: [`
    md-sidenav {
      width: 350px;
    }
  `]
})
export class SidenavComponent {
  @Input() open = false;
  @Input() disableClose = true;
}
