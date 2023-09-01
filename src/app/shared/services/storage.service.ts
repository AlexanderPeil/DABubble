import { Injectable } from '@angular/core';
import { Storage, getDownloadURL, ref, uploadBytesResumable } from "@angular/fire/storage";
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { DialogDataUploadSuccessfulComponent } from 'src/app/components/dialog-data-upload-successful/dialog-data-upload-successful.component';
import { DialogUploadedDataErrorComponent } from 'src/app/components/dialog-uploaded-data-error/dialog-uploaded-data-error.component';


@Injectable({
  providedIn: 'root'
})


export class StorageService {
  file: any = {};
  uploadedImages: any[] = [];
  uploadedDatas: any[] = [];
  safeUrl: string = '';


  constructor(public storage: Storage, public dialog: MatDialog, public sanitizer: DomSanitizer) {

  }


  chooseFileSevice($event: any) {
    this.file = $event.target.files[0];
    this.uploadDataService();
  }


  uploadDataService() {
    const storageRef = ref(this.storage, `images/${this.file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, this.file);
    if (this.dataSizeIsRightService() && this.dataFormatIsRightService()) {
      this.dataUploadIsInProgressService(uploadTask);
    } else {
      uploadTask.cancel();
      this.dialog.open(DialogUploadedDataErrorComponent);
    }
  }


  dataSizeIsRightService() {
    return this.file.size <= 500000;
  }


  dataFormatIsRightService() {
    return this.file.type == 'image/jpeg' || this.file.type == 'image/png' || this.file.type == 'application/pdf';
  }


  dataUploadIsInProgressService(uploadTask: any) {
    uploadTask.on('state_changed', (data: any) => {
      const progress = (data.bytesTransferred / data.totalBytes) * 100;
      console.log('Upload is ' + progress + '% done');
    },
      (error: Error) => {
        console.log(error.message);
      },
      () => {
        this.getTheDownloadUrlService(uploadTask);
      }
    );
  }


  getTheDownloadUrlService(uploadTask: any) {
    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
      console.log('File available at', downloadURL);
      this.safeUrl = downloadURL;     // The safeUrl is is to use for the bypassSecurityTrustResourceUrl() function, to mark as safe Url.
      if (this.file.type == 'image/jpeg' || this.file.type == 'image/png') {
        this.uploadedImages.push(downloadURL);
      } else {
        this.uploadedDatas.push(this.sanitizer.bypassSecurityTrustResourceUrl(this.safeUrl));  // Allow to upload Data like pdf and displays in HTML (Comes from Angular security). 
      }
      this.dialog.open(DialogDataUploadSuccessfulComponent);
    });
  }
}

