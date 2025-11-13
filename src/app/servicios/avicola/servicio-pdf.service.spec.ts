import { TestBed } from '@angular/core/testing';

import { ServicioPdfService } from './servicio-pdf.service';

describe('ServicioPdfService', () => {
  let service: ServicioPdfService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServicioPdfService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
