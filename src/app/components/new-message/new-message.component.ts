import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { StorageService } from 'src/app/shared/services/storage.service';
import { ToggleWorkspaceMenuService } from 'src/app/shared/services/toggle-workspace-menu.service';
import { DialogDetailViewUploadedDatasComponent } from '../dialog-detail-view-uploaded-datas/dialog-detail-view-uploaded-datas.component';


@Component({
  selector: 'app-new-message',
  templateUrl: './new-message.component.html',
  styleUrls: ['./new-message.component.scss']
})


export class NewMessageComponent {


  constructor(public dialog: MatDialog, public toggleWorspaceMenuService: ToggleWorkspaceMenuService, public storageService: StorageService) {

  }


  setFocus($event: any) {
    $event.focus();
  }


  openDetailViewFromUploadedImage(uploadedImageUrl: string) {
    this.dialog.open(DialogDetailViewUploadedDatasComponent, {
      data: {
        uploadedImageUrl: uploadedImageUrl,
      }
    });
  }
}
