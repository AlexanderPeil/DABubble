import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextfieldInChathistoryComponent } from './textfield-in-chathistory.component';

describe('TextfieldInChathistoryComponent', () => {
  let component: TextfieldInChathistoryComponent;
  let fixture: ComponentFixture<TextfieldInChathistoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TextfieldInChathistoryComponent]
    });
    fixture = TestBed.createComponent(TextfieldInChathistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
