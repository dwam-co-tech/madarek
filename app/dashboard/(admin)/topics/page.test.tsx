import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import TopicsPage from './page';
import { createTopic, deleteTopic, getAllAdminArticles, getTopic, getTopics, updateTopic } from '../../../lib/topics.service';

jest.mock('../../../lib/topics.service', () => ({
  TopicRequestError: class TopicRequestError extends Error {},
  getTopics: jest.fn(),
  getTopic: jest.fn(),
  createTopic: jest.fn(),
  updateTopic: jest.fn(),
  deleteTopic: jest.fn(),
  getAllAdminArticles: jest.fn(),
}));

const mockGetTopics = getTopics as jest.MockedFunction<typeof getTopics>;
const mockGetArticles = getAllAdminArticles as jest.MockedFunction<typeof getAllAdminArticles>;
const mockCreateTopic = createTopic as jest.MockedFunction<typeof createTopic>;
const mockGetTopic = getTopic as jest.MockedFunction<typeof getTopic>;
const mockUpdateTopic = updateTopic as jest.MockedFunction<typeof updateTopic>;
const mockDeleteTopic = deleteTopic as jest.MockedFunction<typeof deleteTopic>;

describe('Topics dashboard page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetTopics.mockResolvedValue([]);
    mockGetArticles.mockResolvedValue([]);
  });

  it('shows the required empty state', async () => {
    render(<TopicsPage />);
    expect(await screen.findByText('لا توجد موضوعات مضافة حتى الآن.')).toBeInTheDocument();
  });

  it('creates a Topic with cross-Issue articles in the chosen order', async () => {
    mockGetArticles.mockResolvedValue([
      { id: 11, title: 'المقال الأول', issue_id: 1, user_id: 1, slug: 'one', status: 'published', created_at: '', updated_at: '', issue: { id: 1, title: 'العدد الأول', issue_number: 1, slug: 'i-1', status: 'published', cover_image: '', created_at: '', updated_at: '' } },
      { id: 22, title: 'المقال الثاني', issue_id: 2, user_id: 1, slug: 'two', status: 'draft', created_at: '', updated_at: '', issue: { id: 2, title: 'العدد الثاني', issue_number: 2, slug: 'i-2', status: 'draft', cover_image: '', created_at: '', updated_at: '' } },
    ]);
    mockCreateTopic.mockResolvedValue({ topic: { id: 1, name: 'مصر', slug: 'egypt', category: 'country', article_ids: [22, 11] } });

    render(<TopicsPage />);
    fireEvent.click(await screen.findByRole('button', { name: /إضافة موضوع/ }));
    fireEvent.change(screen.getByLabelText('الاسم'), { target: { value: 'مصر' } });
    fireEvent.change(screen.getByLabelText('الرابط'), { target: { value: 'egypt' } });
    fireEvent.click(screen.getByRole('button', { name: /المقال الأول/ }));
    fireEvent.click(screen.getByRole('button', { name: /المقال الثاني/ }));
    fireEvent.click(screen.getByRole('button', { name: /تقديم المقال الثاني/ }));
    fireEvent.click(screen.getByRole('button', { name: 'حفظ الموضوع' }));

    await waitFor(() => expect(mockCreateTopic).toHaveBeenCalledWith({
      name: 'مصر', slug: 'egypt', category: 'country', article_ids: [22, 11],
    }));
  });

  it('loads an existing Topic for editing and deletes only after confirmation', async () => {
    const topic = { id: 7, name: 'التصوف', slug: 'sufism', category: 'subject' as const, article_ids: [] };
    mockGetTopics.mockResolvedValue([topic]);
    mockGetTopic.mockResolvedValue({ topic });
    mockUpdateTopic.mockResolvedValue({ topic: { ...topic, name: 'التصوف الإسلامي' } });
    mockDeleteTopic.mockResolvedValue({ message: 'ok' });

    render(<TopicsPage />);
    fireEvent.click(await screen.findByRole('button', { name: 'تعديل التصوف' }));
    fireEvent.change(await screen.findByLabelText('الاسم'), { target: { value: 'التصوف الإسلامي' } });
    fireEvent.click(screen.getByRole('button', { name: 'حفظ الموضوع' }));
    await waitFor(() => expect(mockUpdateTopic).toHaveBeenCalledWith(7, expect.objectContaining({ name: 'التصوف الإسلامي' })));

    fireEvent.click(await screen.findByRole('button', { name: 'حذف التصوف' }));
    expect(screen.getByText('هل أنت متأكد من حذف هذا الموضوع من شجرة المواضيع؟')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'تأكيد الحذف' }));
    await waitFor(() => expect(mockDeleteTopic).toHaveBeenCalledWith(7));
  });
});
