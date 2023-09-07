import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})


export class ThreadService {
  threadAreClosed: boolean = false;


  constructor() {

  }


  openThreadService() {
    this.threadAreClosed = false;
  }


  closeThreadService() {
    this.threadAreClosed = true;
  }
}
