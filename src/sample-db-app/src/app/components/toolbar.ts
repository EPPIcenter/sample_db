import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy} from '@angular/core';

@Component({
  selector: 'sdb-toolbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <md-toolbar color={{color}}>
        <button *ngIf="showToggleMenu" md-icon-button (click)="toggleMenu.emit()">
          <md-icon>more_vert</md-icon>
        </button>
        <span>{{title}}</span>
        <span class="fill-remaining-space"></span>
        <div class='toolbar-buttons'>
          <button md-mini-fab *ngFor="let button of buttons" mdTooltip={{button.tooltip}} color={{button.color}}
            [mdTooltipPosition]="tooltipPosition" (click)="toggleButton.emit(button.action)">
            <md-icon>{{button.icon}}</md-icon>
          </button>
        </div>
    </md-toolbar>
  `,
  styles: [`
    .fill-remaining-space {
      flex: 1 1 auto;
    }
    span {
      margin-left: 20px;
    }
    button {
      margin: 5px;
    }
    .toolbar-buttons {

    }
  `]
})
export class ToolbarComponent implements OnInit {
  @Input() color = 'primary';
  @Input() title = '';
  @Input() buttons = [];
  @Output() toggleMenu = new EventEmitter();
  @Output() toggleButton = new EventEmitter();
  showToggleMenu = false;
  tooltipPosition = 'below';

  ngOnInit() {
    this.showToggleMenu = this.toggleMenu.observers.length > 0;
  }

}
