import { TestBed, inject } from '@angular/core/testing';

import { UploadedFloorPlanService } from './uploaded-floor-plan.service';

describe('UploadedFloorPlanService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UploadedFloorPlanService]
    });
  });

  it('should be created', inject([UploadedFloorPlanService], (service: UploadedFloorPlanService) => {
    expect(service).toBeTruthy();
  }));
});
