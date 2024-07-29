import { TestBed } from '@angular/core/testing';

import { SqlFormatterService } from './sql-formatter.service';

describe('SqlFormatterService', () => {
  let service: SqlFormatterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SqlFormatterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
