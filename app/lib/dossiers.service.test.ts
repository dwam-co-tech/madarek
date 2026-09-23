import { createDossier, deleteDossier, DossierRequestError, getAdminIssueArticles, getDossier, getDossiers, updateDossier } from './dossiers.service';

jest.mock('./auth.service', () => ({ getAuthToken: () => 'test-token' }));

const mockFetch = jest.fn();
global.fetch = mockFetch;
const ok = (body: unknown) => ({ ok: true, status: 200, json: async () => body });
const payload = { title: 'Test', slug: 'test', intro: '', status: 'draft' as const, article_ids: [8, 3] };

beforeEach(() => mockFetch.mockReset());

it('uses the issue-scoped admin endpoints and ordered numeric article IDs', async () => {
  mockFetch.mockResolvedValue(ok({ dossier: {} }));
  await getDossiers(4);
  await getAdminIssueArticles(4);
  await getDossier(9);
  await createDossier(4, payload);
  expect(mockFetch.mock.calls.map(([url]) => url)).toEqual(expect.arrayContaining([
    expect.stringContaining('/api/admin/issues/4/dossiers'),
    expect.stringContaining('/api/admin/issues/4/articles'),
    expect.stringContaining('/api/admin/dossiers/9'),
  ]));
  const init = mockFetch.mock.calls[3][1] as RequestInit;
  expect(init.method).toBe('POST');
  expect(init.headers).toMatchObject({ Authorization: 'Bearer test-token' });
  expect([...((init.body as FormData).entries())]).toEqual([
    ['title', 'Test'], ['slug', 'test'], ['intro', ''], ['status', 'draft'],
    ['article_ids[0]', '8'], ['article_ids[1]', '3'],
  ]);
});

it('sends JSON PUT to clear articles and remove an existing cover', async () => {
  mockFetch.mockResolvedValue(ok({ dossier: {} }));
  await updateDossier(9, { ...payload, article_ids: [], cover_image: null });
  const init = mockFetch.mock.calls[0][1] as RequestInit;
  expect(init.method).toBe('PUT');
  expect(JSON.parse(init.body as string)).toMatchObject({ article_ids: [], cover_image: null });
  await deleteDossier(9);
  expect(mockFetch.mock.calls[1][1].method).toBe('DELETE');
});

it('replaces cover through Laravel multipart method spoofing and preserves order', async () => {
  mockFetch.mockResolvedValue(ok({ dossier: {} }));
  const file = new File(['image'], 'cover.png', { type: 'image/png' });
  await updateDossier(9, { ...payload, cover_image: file });
  const init = mockFetch.mock.calls[0][1] as RequestInit;
  expect(init.method).toBe('POST');
  const form = init.body as FormData;
  expect(form.get('_method')).toBe('PUT');
  expect(form.get('cover_image')).toBe(file);
  expect(form.getAll('article_ids[0]')).toEqual(['8']);
  expect(form.getAll('article_ids[1]')).toEqual(['3']);
});

it('surfaces safe validation messages without exposing server internals', async () => {
  mockFetch.mockResolvedValue({ ok: false, status: 422, json: async () => ({ message: 'Exception stack trace', errors: { slug: ['SQL exception'] } }) });
  await expect(createDossier(4, payload)).rejects.toMatchObject({ status: 422, errors: { slug: [expect.stringContaining('الرابط')] } });
  try { await createDossier(4, payload); } catch (error) {
    expect(error).toBeInstanceOf(DossierRequestError);
    expect((error as Error).message).not.toContain('SQL');
  }
});

it('reports network failures in Arabic', async () => {
  mockFetch.mockRejectedValue(new TypeError('failed to fetch'));
  await expect(getDossiers(4)).rejects.toMatchObject({ status: 0, message: expect.stringContaining('الاتصال') });
});
