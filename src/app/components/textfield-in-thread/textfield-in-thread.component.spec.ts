import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextfieldInThreadComponent } from './textfield-in-thread.component';

describe('TextfieldInThreadComponent', () => {
  let component: TextfieldInThreadComponent;
  let fixture: ComponentFixture<TextfieldInThreadComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TextfieldInThreadComponent]
    });
    fixture = TestBed.createComponent(TextfieldInThreadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
