import { TestBed } from '@angular/core/testing';

import { BlobStorageService } from './blob-storage.service';

describe('BlobStorageService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BlobStorageService = TestBed.get(BlobStorageService);
    expect(service).toBeTruthy();
  });
});
