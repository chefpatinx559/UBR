document.addEventListener('DOMContentLoaded', function() {
    // Mark all as read button
    const markAllReadBtn = document.getElementById('markAllReadBtn');
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', function() {
            document.querySelectorAll('.notification-unread').forEach(item => {
                item.classList.remove('notification-unread');
                item.classList.add('notification-read');
            });
            
            // Update notification count
            const notificationCount = document.querySelector('#notificationsBtn span');
            if (notificationCount) {
                notificationCount.textContent = '0';
            }
            
            showNotification('Toutes les notifications ont été marquées comme lues', 'success');
        });
    }
    
    // Individual notification actions
    document.querySelectorAll('.notification-action').forEach(button => {
        button.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            const notification = this.closest('.notification-item');
            
            if (action === 'read') {
                notification.classList.remove('notification-unread');
                notification.classList.add('notification-read');
                showNotification('Notification marquée comme lue', 'success');
            } else if (action === 'delete') {
                notification.style.opacity = '0';
                setTimeout(() => {
                    notification.remove();
                    showNotification('Notification supprimée', 'info');
                }, 300);
            }
        });
    });
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('bg-primary', 'text-white');
                btn.classList.add('bg-white', 'text-gray-700');
            });
            
            // Add active class to clicked button
            this.classList.remove('bg-white', 'text-gray-700');
            this.classList.add('bg-primary', 'text-white');
            
            const filter = this.getAttribute('data-filter');
            const notifications = document.querySelectorAll('.notification-item');
            
            notifications.forEach(notification => {
                if (filter === 'all') {
                    notification.classList.remove('hidden');
                } else {
                    const type = notification.getAttribute('data-type');
                    if (type === filter) {
                        notification.classList.remove('hidden');
                    } else {
                        notification.classList.add('hidden');
                    }
                }
            });
        });
    });
    
    // Close notification button
    document.querySelectorAll('.close-notification').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const notification = this.closest('.notification-item');
            notification.style.opacity = '0';
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
    });

    // Notification system
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full`;
        
        const colors = {
            success: 'bg-green-500 text-white',
            error: 'bg-red-500 text-white',
            warning: 'bg-yellow-500 text-white',
            info: 'bg-blue-500 text-white'
        };
        
        notification.className += ` ${colors[type]}`;
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : type === 'warning' ? 'exclamation-triangle' : 'info'} mr-2"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
});