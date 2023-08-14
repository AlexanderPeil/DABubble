import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})


export class ToggleWorkspaceMenuService {
  workspaceMenuIsOpen: boolean = false;


  constructor() {

  }


  toggleWorkspaceMenuService() {
    if (!this.workspaceMenuIsOpen) {
      this.workspaceMenuIsOpen = true;
    } else {
      this.workspaceMenuIsOpen = false;
    }
  }
}
