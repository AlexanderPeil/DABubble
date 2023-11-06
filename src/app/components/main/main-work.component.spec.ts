import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainWorkComponent } from './main-work.component';

describe('MainComponent', () => {
  let component: MainWorkComponent;
  let fixture: ComponentFixture<MainWorkComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MainWorkComponent]
    });
    fixture = TestBed.createComponent(MainWorkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
