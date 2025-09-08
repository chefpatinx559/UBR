document.addEventListener('DOMContentLoaded', function() {
    // Navigation between sections
    const navButtons = document.querySelectorAll('.settings-nav-btn');
    const sections = document.querySelectorAll('[id$="-section"]');
    
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            navButtons.forEach(btn => {
                btn.classList.remove('active', 'bg-primary', 'text-white');
                btn.classList.add('text-gray-700', 'hover:bg-gray-50');
            });
            
            // Add active class to clicked button
            this.classList.add('active', 'bg-primary', 'text-white');
            this.classList.remove('text-gray-700', 'hover:bg-gray-50');
            
            // Hide all sections
            sections.forEach(section => {
                section.classList.add('hidden');
            });
            
            // Show target section
            const targetSection = this.getAttribute('data-section');
            document.getElementById(targetSection + '-section').classList.remove('hidden');
        });
    });

    // Toggle functionality for checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const setting = this.closest('.flex').querySelector('h3')?.textContent || 'Paramètre';
            const status = this.checked ? 'activé' : 'désactivé';
            showNotification(`${setting} ${status}`, 'info');
        });
    });

    // Form submission
    document.querySelectorAll('button').forEach(btn => {
        if (btn.textContent.includes('Enregistrer') || btn.textContent.includes('Changer')) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                showNotification('Modifications enregistrées avec succès', 'success');
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