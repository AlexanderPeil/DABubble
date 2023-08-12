import { Component } from '@angular/core';


@Component({
  selector: 'app-workspace-menu-btn',
  templateUrl: './workspace-menu-btn.component.html',
  styleUrls: ['./workspace-menu-btn.component.scss']
})


export class WorkspaceMenuBtnComponent {
  worspaceMenuIsOpen: boolean = false;


  openOrCloseWorkspaceMenu() {
    this.worspaceMenuIsOpen = true;
  }
}
