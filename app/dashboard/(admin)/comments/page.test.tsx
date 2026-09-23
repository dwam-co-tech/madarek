import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import CommentsPage from './page';
import { CommentRequestError, getAdminComment, getAdminComments, updateCommentStatus } from '../../../lib/comments.service';
import type { ArticleComment, ModerationStatus } from '../../../lib/comments.model';

jest.mock('../../../lib/comments.service', () => ({
  CommentRequestError: class CommentRequestError extends Error {
    constructor(message: string, public status: number) { super(message); }
  },
  getAdminComments: jest.fn(),
  getAdminComment: jest.fn(),
  updateCommentStatus: jest.fn(),
}));

const mockList = getAdminComments as jest.MockedFunction<typeof getAdminComments>;
const mockDetails = getAdminComment as jest.MockedFunction<typeof getAdminComment>;
const mockUpdate = updateCommentStatus as jest.MockedFunction<typeof updateCommentStatus>;

const pending: ArticleComment = {
  id: 8,
  article_id: 15,
  author_name: 'أحمد',
  text: 'هذا نص التعليق كاملاً',
  status: 'pending',
  created_at: '2026-09-23T10:00:00Z',
  updated_at: '2026-09-23T10:00:00Z',
  article: { id: 15, title: 'عنوان المقال' },
};

const listResponse = (comments: ArticleComment[] = [pending]) => ({ current_page: 1, last_page: 1, per_page: 20, total: comments.length, data: comments });

describe('Comments dashboard page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockList.mockResolvedValue(listResponse());
    mockDetails.mockResolvedValue({ comment: pending });
    mockUpdate.mockImplementation(async (_id, status) => ({
      message: status === 'approved' ? 'تم اعتماد التعليق من الباك.' : 'تم رفض التعليق من الباك.',
      comment: { ...pending, status },
    }));
  });

  it('renders the comments list and applies the backend status filter', async () => {
    render(<CommentsPage />);
    expect(await screen.findByText('أحمد')).toBeInTheDocument();
    expect(screen.getByText('عنوان المقال')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'معلق' }));
    await waitFor(() => expect(mockList).toHaveBeenLastCalledWith(1, 'pending'));
  });

  it('loads full comment details', async () => {
    render(<CommentsPage />);
    fireEvent.click(await screen.findByRole('button', { name: 'عرض تعليق أحمد' }));
    expect(await screen.findByRole('heading', { name: 'تفاصيل التعليق' })).toBeInTheDocument();
    expect(screen.getAllByText('هذا نص التعليق كاملاً')).toHaveLength(2);
    expect(mockDetails).toHaveBeenCalledWith(8);
  });

  it.each([
    ['قبول تعليق أحمد', 'approved', 'تم اعتماد التعليق من الباك.'],
    ['رفض تعليق أحمد', 'rejected', 'تم رفض التعليق من الباك.'],
  ] as Array<[string, ModerationStatus, string]>)('moderates through %s', async (buttonName, status, message) => {
    render(<CommentsPage />);
    fireEvent.click(await screen.findByRole('button', { name: buttonName }));
    await waitFor(() => expect(mockUpdate).toHaveBeenCalledWith(8, status));
    expect(screen.getByRole('status').textContent).toContain(message);
  });

  it('closes details and shows the backend rejection reason in the feedback area', async () => {
    mockUpdate.mockRejectedValue(new CommentRequestError('رفض الباك تعديل الحالة لهذا التعليق.', 422));
    render(<CommentsPage />);
    fireEvent.click(await screen.findByRole('button', { name: 'عرض تعليق أحمد' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'قبول' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.getByRole('alert').textContent).toContain('رفض الباك تعديل الحالة لهذا التعليق.');
  });

  it('shows a safe API error', async () => {
    mockList.mockRejectedValue(new Error('Failed to fetch'));
    render(<CommentsPage />);
    expect((await screen.findByRole('alert')).textContent).toContain('تعذر إتمام الطلب');
    expect(screen.queryByText('Failed to fetch')).toBeNull();
  });
});
