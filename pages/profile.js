document.addEventListener('DOMContentLoaded', function() {
    // Photo gallery functionality
    const photoItems = document.querySelectorAll('.photo-item');
    photoItems.forEach(item => {
        item.addEventListener('click', function() {
            // Create modal for photo view
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';
            modal.innerHTML = `
                <div class="relative max-w-4xl max-h-full p-4">
                    <img src="${this.querySelector('img').src}" alt="Photo" class="max-w-full max-h-full object-contain">
                    <button class="absolute top-4 right-4 text-white text-2xl hover:text-gray-300">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Close modal
            modal.addEventListener('click', function(e) {
                if (e.target === modal || e.target.closest('button')) {
                    modal.remove();
                }
            });
        });
    });

    // Profile completion progress
    const progressBar = document.querySelector('.bg-primary.h-2');
    const progressText = document.querySelector('.text-primary');
    
    // Animate progress bar
    setTimeout(() => {
        progressBar.style.transition = 'width 1s ease-in-out';
        progressBar.style.width = '85%';
    }, 500);

    // Quick actions functionality
    document.querySelectorAll('.bg-primary, .bg-green-600, .bg-yellow-600, .bg-gray-600').forEach(btn => {
        btn.addEventListener('click', function(e) {
            // Add click effect
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });

    // Share profile functionality
    document.querySelector('.fa-share').parentElement.addEventListener('click', function() {
        if (navigator.share) {
            navigator.share({
                title: 'Mon profil UBR',
                text: 'Découvrez mon profil sur UBR - Union Bénie et Réelle',
                url: window.location.href
            });
        } else {
            // Fallback for browsers that don't support Web Share API
            const url = window.location.href;
            navigator.clipboard.writeText(url).then(() => {
                showNotification('Lien du profil copié dans le presse-papiers', 'success');
            });
        }
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