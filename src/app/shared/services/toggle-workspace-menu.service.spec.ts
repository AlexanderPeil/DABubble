import { TestBed } from '@angular/core/testing';

import { ToggleWorkspaceMenuService } from './toggle-workspace-menu.service';

describe('ToggleWorkspaceMenuService', () => {
  let service: ToggleWorkspaceMenuService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToggleWorkspaceMenuService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
