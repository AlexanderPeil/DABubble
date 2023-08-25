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
    this.uploadDataService();
  }


  uploadDataService() {
    const storageRef = ref(this.storage, `images/${this.file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, this.file);
    if (this.fielIsTooBig()) {
      uploadTask.cancel();
      console.error('File is too big');
    } else {
      this.dataUploadIsInProgress(uploadTask);
    }
  }


  fielIsTooBig() {
    return this.file.size > 500000;
  }


  dataUploadIsInProgress(uploadTask: any) {
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

