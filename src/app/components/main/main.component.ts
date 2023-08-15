import { Component } from '@angular/core';
import { ToggleWorkspaceMenuService } from 'src/app/shared/services/toggle-workspace-menu.service';


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {


  constructor(public toggleWorspaceMenuService: ToggleWorkspaceMenuService) {

  }

}
