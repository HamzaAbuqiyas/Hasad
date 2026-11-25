import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { HasadAiService } from './hasad-ai.service';

describe('HasadAiService', () => {
  it('should be created', () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    expect(TestBed.inject(HasadAiService)).toBeTruthy();
  });
});
