/**
 * Property-Based Tests for Notification Service
 * 
 * **Feature: smart-file-manager, Property 32: Appropriate Notifications**
 * **Validates: Requirements 9.5, 9.6**
 */

import fc from 'fast-check';
import { NotificationService, NotificationType } from './notification.service';

describe('Feature: smart-file-manager, Property 32: Appropriate Notifications', () => {
    let service: NotificationService;

    beforeEach(() => {
        service = new NotificationService();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
        service.clearAll();
    });

    /**
     * **Property 32: Appropriate Notifications**
     * **Validates: Requirements 9.5, 9.6**
     * 
     * For any upload operation, the File_Manager should display a success notification 
     * when it completes successfully, or an error notification with actionable information 
     * when it fails.
     */
    it('should display success notifications for successful operations', () => {
        fc.assert(
            fc.property(
                fc.string({ minLength: 1, maxLength: 200 }),
                (message) => {
                    const notificationId = service.showSuccess(message);

                    // Verify notification was created
                    expect(notificationId).toBeTruthy();
                    expect(typeof notificationId).toBe('string');

                    // Verify notification is in the list
                    const notifications = service.getNotifications();
                    expect(notifications.length).toBe(1);
                    expect(notifications[0].type).toBe('success');
                    expect(notifications[0].message).toBe(message);
                    expect(notifications[0].id).toBe(notificationId);

                    // Clean up for next iteration
                    service.clearAll();
                }
            ),
            { numRuns: 15 }
        );
    });

    it('should display error notifications for failed operations', () => {
        fc.assert(
            fc.property(
                fc.string({ minLength: 1, maxLength: 200 }),
                (message) => {
                    const notificationId = service.showError(message);

                    // Verify notification was created
                    expect(notificationId).toBeTruthy();
                    expect(typeof notificationId).toBe('string');

                    // Verify notification is in the list
                    const notifications = service.getNotifications();
                    expect(notifications.length).toBe(1);
                    expect(notifications[0].type).toBe('error');
                    expect(notifications[0].message).toBe(message);
                    expect(notifications[0].id).toBe(notificationId);

                    // Clean up for next iteration
                    service.clearAll();
                }
            ),
            { numRuns: 15 }
        );
    });

    it('should display info notifications', () => {
        fc.assert(
            fc.property(
                fc.string({ minLength: 1, maxLength: 200 }),
                (message) => {
                    const notificationId = service.showInfo(message);

                    // Verify notification was created
                    expect(notificationId).toBeTruthy();
                    expect(typeof notificationId).toBe('string');

                    // Verify notification is in the list
                    const notifications = service.getNotifications();
                    expect(notifications.length).toBe(1);
                    expect(notifications[0].type).toBe('info');
                    expect(notifications[0].message).toBe(message);
                    expect(notifications[0].id).toBe(notificationId);

                    // Clean up for next iteration
                    service.clearAll();
                }
            ),
            { numRuns: 15 }
        );
    });

    it('should notify subscribers when notifications are shown', () => {
        fc.assert(
            fc.property(
                fc.record({
                    message: fc.string({ minLength: 1, maxLength: 200 }),
                    type: fc.constantFrom<NotificationType>('success', 'error', 'info'),
                }),
                (data) => {
                    const mockCallback = jest.fn();
                    const unsubscribe = service.subscribe(mockCallback);

                    // Show notification based on type
                    let notificationId: string;
                    switch (data.type) {
                        case 'success':
                            notificationId = service.showSuccess(data.message);
                            break;
                        case 'error':
                            notificationId = service.showError(data.message);
                            break;
                        case 'info':
                            notificationId = service.showInfo(data.message);
                            break;
                    }

                    // Verify callback was called
                    expect(mockCallback).toHaveBeenCalledTimes(1);
                    expect(mockCallback).toHaveBeenCalledWith(
                        expect.objectContaining({
                            type: data.type,
                            message: data.message,
                            id: notificationId!,
                        })
                    );

                    // Clean up
                    unsubscribe();
                    service.clearAll();
                }
            ),
            { numRuns: 15 }
        );
    });

    it('should auto-dismiss notifications after duration', () => {
        fc.assert(
            fc.property(
                fc.record({
                    message: fc.string({ minLength: 1, maxLength: 200 }),
                    duration: fc.integer({ min: 100, max: 5000 }),
                }),
                (data) => {
                    const notificationId = service.showSuccess(data.message, data.duration);

                    // Verify notification exists
                    expect(service.getNotifications().length).toBe(1);

                    // Fast-forward time
                    jest.advanceTimersByTime(data.duration);

                    // Verify notification was dismissed
                    expect(service.getNotifications().length).toBe(0);

                    // Clean up
                    service.clearAll();
                }
            ),
            { numRuns: 15 }
        );
    });

    it('should handle multiple notifications', () => {
        fc.assert(
            fc.property(
                fc.array(
                    fc.record({
                        message: fc.string({ minLength: 1, maxLength: 200 }),
                        type: fc.constantFrom<NotificationType>('success', 'error', 'info'),
                    }),
                    { minLength: 1, maxLength: 10 }
                ),
                (notifications) => {
                    const ids: string[] = [];

                    // Show all notifications
                    notifications.forEach(notif => {
                        let id: string;
                        switch (notif.type) {
                            case 'success':
                                id = service.showSuccess(notif.message);
                                break;
                            case 'error':
                                id = service.showError(notif.message);
                                break;
                            case 'info':
                                id = service.showInfo(notif.message);
                                break;
                        }
                        ids.push(id);
                    });

                    // Verify all notifications are present
                    const activeNotifications = service.getNotifications();
                    expect(activeNotifications.length).toBe(notifications.length);

                    // Verify each notification has correct data
                    notifications.forEach((notif, index) => {
                        const activeNotif = activeNotifications.find(n => n.id === ids[index]);
                        expect(activeNotif).toBeDefined();
                        expect(activeNotif?.type).toBe(notif.type);
                        expect(activeNotif?.message).toBe(notif.message);
                    });

                    // Clean up
                    service.clearAll();
                }
            ),
            { numRuns: 15 }
        );
    });

    it('should allow dismissing notifications manually', () => {
        const notificationId = service.showSuccess('Test message');
        expect(service.getNotifications().length).toBe(1);

        service.dismiss(notificationId);
        expect(service.getNotifications().length).toBe(0);
    });

    it('should allow unsubscribing from notifications', () => {
        const mockCallback = jest.fn();
        const unsubscribe = service.subscribe(mockCallback);

        service.showSuccess('Test 1');
        expect(mockCallback).toHaveBeenCalledTimes(1);

        unsubscribe();

        service.showSuccess('Test 2');
        expect(mockCallback).toHaveBeenCalledTimes(1); // Should not be called again
    });

    it('should use default durations for different notification types', () => {
        // Success notification (default 3000ms)
        service.showSuccess('Success');
        expect(service.getNotifications()[0].duration).toBe(3000);
        service.clearAll();

        // Error notification (default 5000ms)
        service.showError('Error');
        expect(service.getNotifications()[0].duration).toBe(5000);
        service.clearAll();

        // Info notification (default 3000ms)
        service.showInfo('Info');
        expect(service.getNotifications()[0].duration).toBe(3000);
    });

    it('should handle errors in notification listeners gracefully', () => {
        const errorCallback = jest.fn(() => {
            throw new Error('Listener error');
        });
        const normalCallback = jest.fn();

        service.subscribe(errorCallback);
        service.subscribe(normalCallback);

        // Should not throw
        expect(() => service.showSuccess('Test')).not.toThrow();

        // Normal callback should still be called
        expect(normalCallback).toHaveBeenCalled();
    });
});
