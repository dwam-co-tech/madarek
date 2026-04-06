/**
 * Smart File Manager - Notification Service
 * 
 * This service provides functionality to display toast notifications for
 * success, error, and informational messages.
 * 
 * Requirements: 9.5, 9.6
 */

export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
    id: string;
    type: NotificationType;
    message: string;
    duration?: number;
}

export type NotificationCallback = (notification: Notification) => void;

/**
 * NotificationService
 * 
 * Provides methods for displaying toast notifications with different types.
 */
export class NotificationService {
    private listeners: NotificationCallback[] = [];
    private notifications: Notification[] = [];

    /**
     * Registers a callback to be called when a notification is shown.
     * 
     * @param callback - Function to call when a notification is shown
     * @returns Unsubscribe function
     */
    subscribe(callback: NotificationCallback): () => void {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }

    /**
     * Displays a success notification.
     * 
     * @param message - Success message to display
     * @param duration - Optional duration in milliseconds (default: 3000)
     * 
     * **Validates: Requirements 9.5**
     */
    showSuccess(message: string, duration: number = 3000): string {
        return this.show('success', message, duration);
    }

    /**
     * Displays an error notification.
     * 
     * @param message - Error message to display
     * @param duration - Optional duration in milliseconds (default: 5000)
     * 
     * **Validates: Requirements 9.6**
     */
    showError(message: string, duration: number = 5000): string {
        return this.show('error', message, duration);
    }

    /**
     * Displays an informational notification.
     * 
     * @param message - Info message to display
     * @param duration - Optional duration in milliseconds (default: 3000)
     */
    showInfo(message: string, duration: number = 3000): string {
        return this.show('info', message, duration);
    }

    /**
     * Internal method to show a notification.
     * 
     * @param type - Type of notification
     * @param message - Message to display
     * @param duration - Duration in milliseconds
     * @returns Notification ID
     */
    private show(type: NotificationType, message: string, duration: number): string {
        const notification: Notification = {
            id: this.generateId(),
            type,
            message,
            duration,
        };

        this.notifications.push(notification);
        this.notifyListeners(notification);

        // Auto-dismiss after duration
        if (duration > 0) {
            setTimeout(() => {
                this.dismiss(notification.id);
            }, duration);
        }

        return notification.id;
    }

    /**
     * Dismisses a notification by ID.
     * 
     * @param id - Notification ID to dismiss
     */
    dismiss(id: string): void {
        this.notifications = this.notifications.filter(n => n.id !== id);
    }

    /**
     * Gets all active notifications.
     * 
     * @returns Array of active notifications
     */
    getNotifications(): Notification[] {
        return [...this.notifications];
    }

    /**
     * Clears all notifications.
     */
    clearAll(): void {
        this.notifications = [];
    }

    /**
     * Notifies all listeners of a new notification.
     * 
     * @param notification - Notification to broadcast
     */
    private notifyListeners(notification: Notification): void {
        this.listeners.forEach(callback => {
            try {
                callback(notification);
            } catch (error) {
                console.error('Error in notification listener:', error);
            }
        });
    }

    /**
     * Generates a unique ID for a notification.
     * 
     * @returns Unique notification ID
     */
    private generateId(): string {
        return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}

/**
 * Singleton instance of NotificationService
 */
export const notificationService = new NotificationService();
