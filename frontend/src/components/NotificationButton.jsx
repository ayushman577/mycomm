import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotifications } from '../services/notificationService';

function NotificationButton() {
    const navigate = useNavigate();
    const [notificationCount, setNotificationCount] = useState(0);

    useEffect(() => {
        const loadNotificationCount = async () => {
            try {
                const response = await getNotifications();
                const notifications = response?.data?.notifications || [];
                setNotificationCount(notifications.length);
            } catch (error) {
                console.error('Error loading notification count:', error);
            }
        };

        loadNotificationCount();
    }, []);

    return (
        <button
            type="button"
            className="notification-btn"
            onClick={() => navigate('/notifications')}
            aria-label="Notifications"
        >
            <div className="notification-icon-wrap">
                {/* Premium SVG replaces the standard text emoji */}
                <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>

                {notificationCount > 0 && (
                    <span className="notification-badge">
                        {notificationCount > 99 ? '99+' : notificationCount}
                    </span>
                )}
            </div>
        </button>
    );
}

export default NotificationButton;