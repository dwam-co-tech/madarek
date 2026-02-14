export type MonthCount = {
  month: number;
  count: number;
};

export type MonthViews = {
  month: number;
  views: number;
};

export type HomeStatsResponse = {
  year: number;
  issues_count: number;
  articles_count: number;
  total_views: number;
  issues_by_month: MonthCount[];
  views_by_month: MonthViews[];
};
