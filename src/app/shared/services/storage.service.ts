import { Injectable } from '@angular/core';
import { Storage, getDownloadURL, ref, uploadBytesResumable } from "@angular/fire/storage";


@Injectable({
  providedIn: 'root'
})


export class StorageService {
  file: any = {};


  constructor(public storage: Storage) {

  }


  chooseFileSevice($event: any) {
    this.file = $event.target.files[0];
    console.log(this.file);
    this.uploadDataService();
  }


  uploadDataService() {
    const storageRef = ref(this.storage, `images/${this.file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, this.file);
    if (this.dataSizeIsRightService() && this.dataExtensionIsRightService()) {
      this.dataUploadIsInProgressService(uploadTask);
    } else {
      uploadTask.cancel();
      console.error('File is too big or Wrong');
    }
  }


  dataSizeIsRightService() {
    return this.file.size <= 500000;
  }


  dataExtensionIsRightService() {
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
        });
      }
    );
  }
}

