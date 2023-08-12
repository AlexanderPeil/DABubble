import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkspaceMenuBtnComponent } from './workspace-menu-btn.component';

describe('WorkspaceMenuBtnComponent', () => {
  let component: WorkspaceMenuBtnComponent;
  let fixture: ComponentFixture<WorkspaceMenuBtnComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WorkspaceMenuBtnComponent]
    });
    fixture = TestBed.createComponent(WorkspaceMenuBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
