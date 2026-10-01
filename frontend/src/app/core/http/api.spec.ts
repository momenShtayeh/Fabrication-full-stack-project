import { toPageParams } from './api';

//a plain function needs no angular setup, just call it and check the result
describe('toPageParams', () => {

  it('turns paging and sorting into the query parameters the backend expects', () => {
    const params = toPageParams({ page: 2, size: 20, sort: { active: 'code', direction: 'desc' } });

    expect(params.toString()).toBe('page=2&size=20&sort=code,desc');
  });

  it('leaves out the sort when no direction is chosen', () => {
    const params = toPageParams({ page: 0, size: 10, sort: { active: 'code', direction: '' } });

    expect(params.has('sort')).toBeFalse();
  });

  it('adds filters that have a value and skips empty ones', () => {
    const params = toPageParams(
      { page: 0, size: 10, sort: { active: 'spoolNo', direction: 'asc' } },
      { search: 'SP', status: null }
    );

    expect(params.get('search')).toBe('SP');
    expect(params.has('status')).toBeFalse();
  });
});
