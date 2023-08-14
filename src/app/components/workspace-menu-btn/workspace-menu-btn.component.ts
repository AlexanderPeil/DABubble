import { Component } from '@angular/core';
import { ToggleWorkspaceMenuService } from 'src/app/shared/services/toggle-workspace-menu.service';


@Component({
  selector: 'app-workspace-menu-btn',
  templateUrl: './workspace-menu-btn.component.html',
  styleUrls: ['./workspace-menu-btn.component.scss']
})


export class WorkspaceMenuBtnComponent {


  constructor(public toggleWorspaceMenuService: ToggleWorkspaceMenuService) {

  }


  toggleWorkspaceMenu() {
    this.toggleWorspaceMenuService.toggleWorkspaceMenuService();
  }
}
