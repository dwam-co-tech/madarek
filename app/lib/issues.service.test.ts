import { getIssues, getPublishedIssues } from './issues.service';

jest.mock('./auth.service', () => ({ getAuthToken: () => 'test-token' }));

const mockFetch = jest.fn();
global.fetch = mockFetch;

const page = (ids: number[], lastPage: number) => ({
  ok: true,
  json: async () => ({ data: ids.map((id) => ({ id, title: `Issue ${id}` })), last_page: lastPage }),
});

beforeEach(() => mockFetch.mockReset());

it('loads every admin issue page in order with authentication', async () => {
  mockFetch.mockResolvedValueOnce(page([12, 11], 2)).mockResolvedValueOnce(page([10], 2));

  const issues = await getIssues();

  expect(issues.map((issue) => issue.id)).toEqual([12, 11, 10]);
  expect(mockFetch.mock.calls.map(([url]) => url)).toEqual([
    expect.stringContaining('/api/admin/issues?page=1'),
    expect.stringContaining('/api/admin/issues?page=2'),
  ]);
  expect(mockFetch.mock.calls[0][1].headers).toMatchObject({ Authorization: 'Bearer test-token' });
});

it('loads every published issue page for the archive', async () => {
  mockFetch.mockResolvedValueOnce(page([12, 11], 2)).mockResolvedValueOnce(page([10], 2));

  const issues = await getPublishedIssues();

  expect(issues.map((issue) => issue.id)).toEqual([12, 11, 10]);
  expect(mockFetch.mock.calls.map(([url]) => url)).toEqual([
    expect.stringContaining('/api/issues?status=published&page=1'),
    expect.stringContaining('/api/issues?status=published&page=2'),
  ]);
});
