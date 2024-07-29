import { TestBed } from '@angular/core/testing';

import { SnowflakeService } from './snowflake.service';

describe('SnowflakeService', () => {
  let service: SnowflakeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SnowflakeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
