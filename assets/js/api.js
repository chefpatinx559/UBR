/**
 * API Client pour UBR - Union Bénie et Réelle
 * Gère toutes les communications avec le backend Laravel
 */

class UBRApi {
    constructor() {
        this.baseURL = 'http://localhost:8000/api';
        this.token = this.getToken();
    }

    /**
     * Récupère le token d'authentification
     */
    getToken() {
        return localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
    }

    /**
     * Stocke le token d'authentification
     */
    setToken(token, remember = false) {
        if (remember) {
            localStorage.setItem('userToken', token);
        } else {
            sessionStorage.setItem('userToken', token);
        }
        this.token = token;
    }

    /**
     * Supprime le token d'authentification
     */
    removeToken() {
        localStorage.removeItem('userToken');
        sessionStorage.removeItem('userToken');
        localStorage.removeItem('userInfo');
        sessionStorage.removeItem('userInfo');
        this.token = null;
    }

    /**
     * Effectue une requête HTTP
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Ajouter le token d'authentification si disponible
        if (this.token) {
            config.headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            
            // Rediriger vers la page de connexion si token expiré
            if (error.message.includes('401') || error.message.includes('Unauthenticated')) {
                this.removeToken();
                if (window.location.pathname !== '/pages/login.html') {
                    window.location.href = '/pages/login.html';
                }
            }
            
            throw error;
        }
    }

    // === AUTHENTIFICATION ===
    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async login(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    async logout() {
        const result = await this.request('/auth/logout', { method: 'POST' });
        this.removeToken();
        return result;
    }

    async getMe() {
        return this.request('/auth/me');
    }

    // === UTILISATEURS ===
    async getUsers(filters = {}) {
        const params = new URLSearchParams(filters);
        return this.request(`/users?${params}`);
    }

    async getUser(id) {
        return this.request(`/users/${id}`);
    }

    async updateProfile(data) {
        return this.request('/users/profile', {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async uploadPhoto(file, isPrimary = false) {
        const formData = new FormData();
        formData.append('photo', file);
        formData.append('is_primary', isPrimary);

        return this.request('/users/photos', {
            method: 'POST',
            headers: {}, // Laisser le navigateur définir le Content-Type pour FormData
            body: formData
        });
    }

    // === MATCHES ===
    async likeUser(userId) {
        return this.request(`/matches/like/${userId}`, { method: 'POST' });
    }

    async dislikeUser(userId) {
        return this.request(`/matches/dislike/${userId}`, { method: 'POST' });
    }

    async getMatches() {
        return this.request('/matches');
    }

    // === MESSAGES ===
    async getConversations() {
        return this.request('/messages/conversations');
    }

    async getMessages(conversationId) {
        return this.request(`/messages/${conversationId}`);
    }

    async sendMessage(receiverId, content) {
        return this.request('/messages', {
            method: 'POST',
            body: JSON.stringify({
                receiver_id: receiverId,
                content: content
            })
        });
    }

    // === BLOCAGE ===
    async blockUser(userId, reason, description = '') {
        return this.request(`/users/${userId}/block`, {
            method: 'POST',
            body: JSON.stringify({ reason, description })
        });
    }

    async unblockUser(userId) {
        return this.request(`/users/${userId}/unblock`, { method: 'DELETE' });
    }

    async getBlockedUsers() {
        return this.request('/blocked-users');
    }

    // === SIGNALEMENTS ===
    async createReport(reportData) {
        return this.request('/reports', {
            method: 'POST',
            body: JSON.stringify(reportData)
        });
    }

    // === TÉMOIGNAGES ===
    async getTestimonials(filters = {}) {
        const params = new URLSearchParams(filters);
        return this.request(`/testimonials?${params}`);
    }

    async createTestimonial(testimonialData) {
        return this.request('/testimonials', {
            method: 'POST',
            body: JSON.stringify(testimonialData)
        });
    }

    // === NOTIFICATIONS ===
    async getNotifications() {
        return this.request('/notifications');
    }

    async markNotificationAsRead(notificationId) {
        return this.request(`/notifications/${notificationId}/read`, { method: 'PUT' });
    }

    async markAllNotificationsAsRead() {
        return this.request('/notifications/mark-all-read', { method: 'PUT' });
    }

    // === CONTACT ===
    async sendContactMessage(contactData) {
        return this.request('/contact', {
            method: 'POST',
            body: JSON.stringify(contactData)
        });
    }

    // === ADMIN ===
    async adminLogin(username, password) {
        return this.request('/admin/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
    }

    async getAdminStats() {
        return this.request('/admin/stats');
    }

    async getAdminUsers(filters = {}) {
        const params = new URLSearchParams(filters);
        return this.request(`/admin/users?${params}`);
    }
}

// Instance globale de l'API
window.ubrApi = new UBRApi();

// Export pour les modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UBRApi;
}