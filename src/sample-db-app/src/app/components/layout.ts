import { Component, ChangeDetectionStrategy } from '@angular/core';


@Component({
  selector: 'sdb-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <md-sidenav-container>

      <ng-content></ng-content>

    </md-sidenav-container>
  `,
  styles: [`
    md-sidenav-container {
      background: rgba(0, 0, 0, 0.03);
      width: 100%;
      height: 98vh;
    }
    *, /deep/ * {
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
  `]
})
export class LayoutComponent { }
