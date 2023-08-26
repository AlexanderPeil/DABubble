import { Injectable } from '@angular/core';
import { Storage, getDownloadURL, ref, uploadBytesResumable } from "@angular/fire/storage";
import { MatDialog } from '@angular/material/dialog';
import { DialogUploadedDataErrorComponent } from 'src/app/components/dialog-uploaded-data-error/dialog-uploaded-data-error.component';


@Injectable({
  providedIn: 'root'
})


export class StorageService {
  file: any = {};
  path: string = '';
  // donwnloadUrlToDisplayUploadedData: any = [];
  // downloadUrlExist: boolean = false;


  constructor(public storage: Storage, public dialog: MatDialog) {

  }


  chooseFileSevice($event: any) {
    this.file = $event.target.files[0];
    // this.getDownloadUrlToDisplayDataInTextfieldService();
    this.uploadDataService();
  }


  // getDownloadUrlToDisplayDataInTextfieldService() {
  //   if (this.dataSizeIsRightService() && this.dataFormatIsRightService()) {
  //     const storageRef = ref(this.storage, `images/${this.file.name}`);
  //     getDownloadURL(storageRef)
  //       .then((downloadURL) => {

  //       });
  //   }
  // }


  uploadDataService() {
    const storageRef = ref(this.storage, `images/${this.file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, this.file);
    if (this.dataSizeIsRightService() && this.dataFormatIsRightService()) {
      this.dataUploadIsInProgressService(uploadTask);
    } else {
      uploadTask.cancel();
      this.dialog.open(DialogUploadedDataErrorComponent);
      // console.error('File is too big or Wrong');
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
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          console.log('File available at', downloadURL);
          // this.donwnloadUrlToDisplayUploadedData.push(downloadURL);
          // console.log(this.donwnloadUrlToDisplayUploadedData);
        });
      }
    );
  }
}

