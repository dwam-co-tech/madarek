import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ArticlesAdminPage from './page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: jest.fn() }),
  useSearchParams: () => new URLSearchParams('id=1'),
}));
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));
jest.mock('@/components/LoadingOverlay', () => ({ __esModule: true, default: () => null }));
jest.mock('@/components/RichTextEditor/RichTextEditor', () => ({ __esModule: true, default: () => null }));
jest.mock('@/app/lib/articles.service', () => ({
  getArticleById: jest.fn(), updateArticle: jest.fn(), deleteArticle: jest.fn(),
}));
jest.mock('@/app/lib/issues.service', () => ({
  getAdminIssue: jest.fn(), getAdminIssueSections: jest.fn(), getAdminSectionArticles: jest.fn(),
}));

import { getAdminIssue, getAdminSectionArticles } from '@/app/lib/issues.service';

it('paginates every article in an issue section without hiding later articles', async () => {
  const articles = Array.from({ length: 12 }, (_, index) => ({
    id: index + 1,
    title: `مقال ${index + 1}`,
    issue_section_id: 4,
    views_count: 0,
  }));
  const section = { id: 4, issue_id: 1, title: 'مقالات', slug: 'articles', key: 'arc-articles', sort_order: 1, is_active: true };
  (getAdminIssue as jest.Mock).mockResolvedValue({ id: 1, title: 'عدد تجريبي', articles, sections: [section] });
  (getAdminSectionArticles as jest.Mock).mockResolvedValue(articles);

  render(<ArticlesAdminPage />);

  await waitFor(() => expect(screen.getByText('الصفحة 1 من 2 — إجمالي المقالات: 12')).toBeInTheDocument());
  expect(screen.queryAllByText('مقال 11')).toHaveLength(0);
  fireEvent.click(screen.getByRole('button', { name: 'الصفحة التالية في مقالات' }));
  expect(screen.getByText('الصفحة 2 من 2 — إجمالي المقالات: 12')).toBeInTheDocument();
  expect(screen.getAllByText('مقال 11')).toHaveLength(2);
  expect(screen.getByRole('button', { name: 'الصفحة التالية في مقالات' })).toBeDisabled();
});
