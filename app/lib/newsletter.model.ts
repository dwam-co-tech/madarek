export interface NewsletterSubscriber {
    id: number;
    email: string;
    created_at: string;
    formatted_date?: string;
    unsubscribed_at?: string | null;
}

export type NewsletterRecipientType = 'all' | 'single';
export type NewsletterCampaignStatus = 'queued' | 'processing' | 'completed' | 'completed_with_failures' | 'failed';
export type NewsletterDeliveryStatus = 'pending' | 'processing' | 'sent' | 'failed' | 'skipped';

export interface NewsletterCampaign {
    id: number;
    subject: string;
    /** Present on campaign details; omitted from the history list by the API. */
    body?: string;
    recipient_type: NewsletterRecipientType;
    recipient_email?: string | null;
    status: NewsletterCampaignStatus;
    total_recipients: number;
    sent_count: number;
    failed_count: number;
    queued_at?: string | null;
    completed_at?: string | null;
    created_at: string;
    updated_at?: string;
}

export interface NewsletterCampaignDelivery {
    id: number;
    subscriber_id?: number | null;
    email?: string;
    status: NewsletterDeliveryStatus;
    attempts: number;
    sent_at?: string | null;
    failed_at?: string | null;
    subscriber?: Pick<NewsletterSubscriber, 'id' | 'email'> | null;
}

export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface NewsletterCampaignDetails {
    campaign: NewsletterCampaign;
    deliveries_summary: Record<string, number>;
    deliveries: PaginatedResponse<NewsletterCampaignDelivery>;
}

export interface CreateNewsletterCampaignPayload {
    subject: string;
    body: string;
    recipient_type: NewsletterRecipientType;
    subscriber_id?: number;
}

export interface SubscribeResponse {
    message: string;
    subscriber?: NewsletterSubscriber;
}

export interface ApiErrorResponse {
    message: string;
    errors?: {
        [key: string]: string[];
    };
    error?: string;
}
