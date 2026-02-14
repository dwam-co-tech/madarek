export interface NewsletterSubscriber {
    id: number;
    email: string;
    created_at: string;
    formatted_date?: string;
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
