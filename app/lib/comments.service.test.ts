import { getAdminComment, getAdminComments, updateCommentStatus } from './comments.service';

jest.mock('./auth.service', () => ({ getAuthToken: () => 'admin-token' }));

const response = (body: unknown, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: jest.fn().mockResolvedValue(body),
}) as unknown as Response;

describe('admin comments service', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock;
  });

  it('uses backend pagination and supported filters only', async () => {
    fetchMock.mockResolvedValue(response({ current_page: 2, last_page: 2, total: 1, per_page: 20, data: [] }));
    await getAdminComments(2, 'pending', 44);
    expect(fetchMock.mock.calls[0][0]).toBe('http://madarek-backend.test/api/admin/comments?page=2&status=pending&article_id=44');
    expect(fetchMock.mock.calls[0][1].headers).toEqual(expect.objectContaining({ Authorization: 'Bearer admin-token' }));
  });

  it('loads details and sends only approved or rejected status', async () => {
    fetchMock
      .mockResolvedValueOnce(response({ comment: { id: 5 } }))
      .mockResolvedValueOnce(response({ comment: { id: 5, status: 'approved' } }));
    await getAdminComment(5);
    await updateCommentStatus(5, 'approved');
    expect(fetchMock.mock.calls[0][0]).toBe('http://madarek-backend.test/api/admin/comments/5');
    expect(fetchMock.mock.calls[1][0]).toBe('http://madarek-backend.test/api/admin/comments/5/status');
    expect(fetchMock.mock.calls[1][1]).toEqual(expect.objectContaining({ method: 'PUT', body: JSON.stringify({ status: 'approved' }) }));
  });

  it('maps authorization and network failures to safe Arabic messages', async () => {
    fetchMock.mockResolvedValueOnce(response({}, 403));
    await expect(getAdminComments()).rejects.toMatchObject({ status: 403, message: expect.stringContaining('صلاحية') });
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    await expect(getAdminComments()).rejects.toMatchObject({ status: 0, message: expect.stringContaining('تعذر الاتصال بالخادم') });
  });

  it('translates backend success and validation messages before the UI receives them', async () => {
    fetchMock.mockResolvedValueOnce(response({ message: 'Comment moderation status updated successfully.', comment: { id: 5, status: 'approved' } }));
    await expect(updateCommentStatus(5, 'approved'))
      .resolves.toMatchObject({ message: 'تم تحديث حالة التعليق بنجاح.' });

    fetchMock.mockResolvedValueOnce(response({ message: 'The status field is invalid.', errors: { status: ['The status field is invalid.'] } }, 422));
    await expect(updateCommentStatus(5, 'rejected'))
      .rejects.toMatchObject({ status: 422, message: 'حالة التعليق غير صالحة.' });
  });
});
