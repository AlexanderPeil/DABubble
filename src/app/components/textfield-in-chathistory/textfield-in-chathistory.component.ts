import { Component } from '@angular/core';
import { StorageService } from 'src/app/shared/services/storage.service';


@Component({
  selector: 'app-textfield-in-chathistory',
  templateUrl: './textfield-in-chathistory.component.html',
  styleUrls: ['./textfield-in-chathistory.component.scss']
})


export class TextfieldInChathistoryComponent {


  constructor(public storageService: StorageService) {

  }


  chooseFile($event: any) {
    this.storageService.chooseFileSevice($event);
  }

}
