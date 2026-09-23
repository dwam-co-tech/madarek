import { createTopic, deleteTopic, getAllAdminArticles, getTopics, TopicRequestError, updateTopic } from './topics.service';

jest.mock('./auth.service', () => ({ getAuthToken: () => 'test-token' }));

const response = (body: unknown, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: jest.fn().mockResolvedValue(body),
}) as unknown as Response;

describe('topics service', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock;
  });

  it('loads the direct admin Topics array with authentication', async () => {
    fetchMock.mockResolvedValue(response([{ id: 1, name: 'مصر', slug: 'egypt', category: 'country', article_ids: [2] }]));

    await expect(getTopics()).resolves.toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://madarek-backend.test/api/admin/topics',
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer test-token' }) }),
    );
  });

  it('sends only the confirmed create payload', async () => {
    fetchMock.mockResolvedValue(response({ topic: { id: 1 } }, 201));
    const payload = { name: 'مصر', slug: 'egypt', category: 'country' as const, article_ids: [5, 2] };

    await createTopic(payload);

    expect(fetchMock).toHaveBeenCalledWith(
      'http://madarek-backend.test/api/admin/topics',
      expect.objectContaining({ method: 'POST', body: JSON.stringify(payload) }),
    );
  });

  it.each(['country', 'author', 'sect', 'subject'] as const)('accepts the supported %s category', async (category) => {
    fetchMock.mockResolvedValue(response({ topic: { id: 1 } }, 201));
    await createTopic({ name: 'اسم', slug: `topic-${category}`, category, article_ids: [] });
    expect(JSON.parse(fetchMock.mock.calls[0][1].body as string).category).toBe(category);
  });

  it('uses the confirmed edit and delete endpoints', async () => {
    fetchMock
      .mockResolvedValueOnce(response({ topic: { id: 7 } }))
      .mockResolvedValueOnce(response({ message: 'ok' }));
    const payload = { name: 'محدّث', slug: 'updated', category: 'subject' as const, article_ids: [9, 3] };

    await updateTopic(7, payload);
    await deleteTopic(7);

    expect(fetchMock.mock.calls[0][0]).toBe('http://madarek-backend.test/api/admin/topics/7');
    expect(fetchMock.mock.calls[0][1]).toEqual(expect.objectContaining({ method: 'PUT', body: JSON.stringify(payload) }));
    expect(fetchMock.mock.calls[1][1]).toEqual(expect.objectContaining({ method: 'DELETE' }));
  });

  it('loads every admin Article page and preserves API order', async () => {
    fetchMock
      .mockResolvedValueOnce(response({ current_page: 1, last_page: 2, data: [{ id: 3, title: 'أ' }] }))
      .mockResolvedValueOnce(response({ current_page: 2, last_page: 2, data: [{ id: 9, title: 'ب' }] }));

    const articles = await getAllAdminArticles();

    expect(articles.map((article) => article.id)).toEqual([3, 9]);
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      'http://madarek-backend.test/api/admin/articles?page=1',
      'http://madarek-backend.test/api/admin/articles?page=2',
    ]);
  });

  it('maps 422 slug errors to a safe Arabic field error', async () => {
    fetchMock.mockResolvedValue(response({ errors: { slug: ['The slug has already been taken.'] } }, 422));

    await expect(createTopic({ name: 'مصر', slug: 'egypt', category: 'country', article_ids: [] }))
      .rejects.toMatchObject<TopicRequestError>({
        status: 422,
        errors: { slug: [expect.stringContaining('الرابط')] },
      });
  });

  it('turns network failures into a friendly Arabic error', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(getTopics()).rejects.toMatchObject<TopicRequestError>({
      status: 0,
      message: expect.stringContaining('تعذر الاتصال بالخادم'),
    });
  });
});
