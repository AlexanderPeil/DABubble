import { Injectable } from '@angular/core';
import { Storage, getDownloadURL, ref, uploadBytesResumable, deleteObject, uploadBytes } from "@angular/fire/storage";
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
  pattern: RegExp = /.pdf/;
  urlContainsPdfEnding: boolean = false;
  filteredUrlToString: string = '';


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


//   async uploadGooglePhotoToFirebaseStorage(photoURL: string, uid: string): Promise<string> {
//     const response = await fetch(photoURL);
//     if (!response.ok) {
//         throw new Error('Fehler beim Herunterladen des Google-Bildes');
//     }
//     const blob: any = await response.blob();
//     blob.type = response.headers.get("Content-Type");  
//     this.file = blob;  
//     if (!this.dataSizeIsRightService() || !this.dataFormatIsRightService()) {
//         throw new Error('Ungültige Dateigröße oder Dateityp');
//     }

//     const storageRef = ref(this.storage, `avatars/${uid}`);
//     await uploadBytes(storageRef, blob);

//     const downloadURL = await getDownloadURL(storageRef);
//     return downloadURL;
// }



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


  deleteUploadedDataService(uploadedDataUrl: string, index: number) {
    this.urlContainsPdfEnding = this.pattern.test(JSON.stringify(uploadedDataUrl))
    if (this.urlContainsPdfEnding) {
      this.deletePdfDataService(uploadedDataUrl, index);
    } else {
      this.deleteImagesService(uploadedDataUrl, index);
    }
  }


  deletePdfDataService(uploadedDataUrl: string, index: number) {
    this.filteredUrlToString = JSON.stringify(uploadedDataUrl).substring(42).replace('"}', '');
    const storageRef = ref(this.storage, this.filteredUrlToString);
    deleteObject(storageRef)
      .then(() => {
        this.uploadedDatas.splice(index, 1);
      });
  }


  deleteImagesService(uploadedDataUrl: string, index: number) {
    const storageRef = ref(this.storage, uploadedDataUrl);
    deleteObject(storageRef)
      .then(() => {
        this.uploadedImages.splice(index, 1);
      });
  }

}

