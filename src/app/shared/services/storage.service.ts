import { Injectable } from '@angular/core';
import { Storage, getDownloadURL, ref, uploadBytesResumable, deleteObject } from "@angular/fire/storage";
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { DialogDataUploadSuccessfulComponent } from 'src/app/components/dialog-data-upload-successful/dialog-data-upload-successful.component';
import { DialogUploadedDataErrorComponent } from 'src/app/components/dialog-uploaded-data-error/dialog-uploaded-data-error.component';


@Injectable({
  providedIn: 'root'
})


export class StorageService {
  file: any = {};
  uploadedImages: any = [];
  uploadedDatas: any = [];


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


  uploadAvatarService($event: any): Promise<string> {
    this.file = this.getFileFromEvent($event);
    if (!this.dataSizeIsRightService() || !this.dataFormatIsRightService()) {
      this.dialog.open(DialogUploadedDataErrorComponent);
      return Promise.reject(new Error('File validation failed'));
    }
    return this.performFileUpload(this.file);
  }


  getFileFromEvent($event: any): File {
    return $event.target.files[0];
  }


  performFileUpload(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const storageRef = ref(this.storage, `avatars/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on('state_changed', null,
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
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
      if (this.file.type == 'image/jpeg' || this.file.type == 'image/png') {
        this.uploadedImages.push(downloadURL);
      } else {
        this.uploadedDatas.push(this.sanitizer.bypassSecurityTrustResourceUrl(downloadURL));  // Allow to upload Data like pdf and displays in HTML (Comes from Angular security). 
      }
      this.dialog.open(DialogDataUploadSuccessfulComponent);
    });
  }


  // In Work
  deleteUploadedDataService(uploadedDataUrl: string, index: number) {
    // console.log(uploadedDataUrl);
    // let t = JSON.stringify(uploadedDataUrl).substring(41);
    // let a = t.replace('}', '');
    const storageRef = ref(this.storage, uploadedDataUrl);
    deleteObject(storageRef)
      .then(() => {
        if (this.file.type == 'image/jpeg' || this.file.type == 'image/png') {
          this.uploadedImages.splice(index, 1);
        } else {
          this.uploadedDatas.splice(index, 1);
        }
      });
  }
}

