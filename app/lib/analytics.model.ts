export interface CountryStatistic {
    country_code: string;
    country_name: string;
    visits: number;
    percentage: number;
}

export interface DailyVisit {
    date: string; // YYYY-MM-DD format
    visits: number;
}

export interface CountryStatisticsResponse {
    countries: CountryStatistic[];
    total_visits: number;
    last_updated: string;
}

export interface DailyVisitsResponse {
    daily_visits: DailyVisit[];
    total_visits: number;
    date_range: {
        from: string | null;
        to: string | null;
    };
}
