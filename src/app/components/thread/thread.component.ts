import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { StorageService } from 'src/app/shared/services/storage.service';
import { DialogDetailViewUploadedDatasComponent } from '../dialog-detail-view-uploaded-datas/dialog-detail-view-uploaded-datas.component';


@Component({
  selector: 'app-thread',
  templateUrl: './thread.component.html',
  styleUrls: ['./thread.component.scss']
})


export class ThreadComponent {


  constructor(public storageService: StorageService, public dialog: MatDialog) {

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
