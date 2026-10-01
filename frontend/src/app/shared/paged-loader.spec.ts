import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { Page, PageRequest } from '../core/http/api';
import { PagedLoader } from './paged-loader';

describe('PagedLoader', () => {
  const firstRequest: PageRequest = { page: 0, size: 10, sort: { active: 'code', direction: 'asc' } };
  let requests: { request: PageRequest; response: Subject<Page<string>> }[];
  let loader: PagedLoader<string>;

  //every fetch returns a Subject, so the test decides when (and whether) each response arrives
  function fetch(request: PageRequest): Subject<Page<string>> {
    const response = new Subject<Page<string>>();
    requests.push({ request, response });
    return response;
  }

  function page(content: string[]): Page<string> {
    return { content, page: 0, size: 10, totalElements: content.length, totalPages: 1 };
  }

  beforeEach(() => {
    requests = [];
    //PagedLoader stops itself with the component, so it has to be created where angular can inject
    loader = TestBed.runInInjectionContext(() => new PagedLoader<string>(fetch, firstRequest));
  });

  it('shows a loading state until the page arrives', () => {
    loader.reload();
    expect(loader.loading()).toBeTrue();

    requests[0].response.next(page(['A', 'B']));

    expect(loader.loading()).toBeFalse();
    expect(loader.page()?.content).toEqual(['A', 'B']);
  });

  it('goes back to the first page when the sort changes', () => {
    loader.changePage({ pageIndex: 3, pageSize: 20, length: 100 });
    loader.changeSort({ active: 'quantity', direction: 'desc' });

    expect(requests[1].request).toEqual({ page: 0, size: 20, sort: { active: 'quantity', direction: 'desc' } });
  });

  it('ignores the answer to an older request that a newer one replaced', () => {
    loader.reload();
    loader.reload();

    requests[1].response.next(page(['new']));
    requests[0].response.next(page(['old']));

    expect(loader.page()?.content).toEqual(['new']);
  });

  it('keeps the current page and stops loading when a request fails', () => {
    loader.reload();
    requests[0].response.next(page(['A']));
    loader.reload();

    requests[1].response.error(new Error('server down'));

    expect(loader.loading()).toBeFalse();
    expect(loader.page()?.content).toEqual(['A']);
  });
});
