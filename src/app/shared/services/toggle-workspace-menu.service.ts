import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})


export class ToggleWorkspaceMenuService {
  workspaceMenuAreClosed: boolean = false;


  constructor() {

  }


  toggleWorkspaceMenuService() {
    this.workspaceMenuAreClosed = !this.workspaceMenuAreClosed;
  }
}
