import { TestBed } from '@angular/core/testing';

import { ProductorAvicolaService } from './productor-avicola.service';

describe('ProductorAvicolaService', () => {
  let service: ProductorAvicolaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductorAvicolaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
