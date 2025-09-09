/**
 * Système d'authentification pour UBR
 * Gère la connexion, l'inscription et la gestion des sessions
 */

class AuthManager {
    constructor() {
        this.api = window.ubrApi;
        this.currentUser = null;
        this.init();
    }

    init() {
        // Vérifier si l'utilisateur est connecté au chargement
        this.checkAuthStatus();
        
        // Écouter les changements de stockage (pour la synchronisation entre onglets)
        window.addEventListener('storage', (e) => {
            if (e.key === 'userToken' || e.key === 'userInfo') {
                this.checkAuthStatus();
            }
        });
    }

    /**
     * Vérifie le statut d'authentification
     */
    async checkAuthStatus() {
        const token = this.api.getToken();
        const userInfo = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');

        if (token && userInfo) {
            try {
                this.currentUser = JSON.parse(userInfo);
                // Vérifier que le token est toujours valide
                await this.api.getMe();
                this.onAuthSuccess();
            } catch (error) {
                console.error('Token invalide:', error);
                this.logout();
            }
        } else {
            this.onAuthFailure();
        }
    }

    /**
     * Connexion utilisateur
     */
    async login(email, password, remember = false) {
        try {
            const response = await this.api.login(email, password);
            
            // Stocker le token et les informations utilisateur
            this.api.setToken(response.token, remember);
            
            const userInfo = {
                id: response.user.id,
                firstName: response.user.first_name,
                lastName: response.user.last_name,
                email: response.user.email,
                isAdmin: response.user.is_admin,
                profilePhoto: response.user.primary_photo?.path
            };

            if (remember) {
                localStorage.setItem('userInfo', JSON.stringify(userInfo));
            } else {
                sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
            }

            this.currentUser = userInfo;
            this.onAuthSuccess();

            return response;
        } catch (error) {
            console.error('Erreur de connexion:', error);
            throw error;
        }
    }

    /**
     * Inscription utilisateur
     */
    async register(userData) {
        try {
            const response = await this.api.register(userData);
            
            // Connexion automatique après inscription
            this.api.setToken(response.token, false);
            
            const userInfo = {
                id: response.user.id,
                firstName: response.user.first_name,
                lastName: response.user.last_name,
                email: response.user.email,
                isAdmin: response.user.is_admin
            };

            sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
            this.currentUser = userInfo;
            this.onAuthSuccess();

            return response;
        } catch (error) {
            console.error('Erreur d\'inscription:', error);
            throw error;
        }
    }

    /**
     * Déconnexion
     */
    async logout() {
        try {
            if (this.api.getToken()) {
                await this.api.logout();
            }
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        } finally {
            this.api.removeToken();
            this.currentUser = null;
            this.onAuthFailure();
        }
    }

    /**
     * Connexion admin
     */
    async adminLogin(username, password, remember = false) {
        try {
            const response = await this.api.adminLogin(username, password);
            
            this.api.setToken(response.token, remember);
            
            const adminInfo = {
                id: response.user.id,
                firstName: response.user.first_name,
                lastName: response.user.last_name,
                email: response.user.email,
                isAdmin: true
            };

            if (remember) {
                localStorage.setItem('adminInfo', JSON.stringify(adminInfo));
            } else {
                sessionStorage.setItem('adminInfo', JSON.stringify(adminInfo));
            }

            return response;
        } catch (error) {
            console.error('Erreur de connexion admin:', error);
            throw error;
        }
    }

    /**
     * Vérifie si l'utilisateur est connecté
     */
    isAuthenticated() {
        return !!this.currentUser && !!this.api.getToken();
    }

    /**
     * Vérifie si l'utilisateur est admin
     */
    isAdmin() {
        return this.currentUser?.isAdmin || false;
    }

    /**
     * Obtient l'utilisateur actuel
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Actions à effectuer lors d'une authentification réussie
     */
    onAuthSuccess() {
        // Mettre à jour l'interface utilisateur
        this.updateUI();
        
        // Rediriger si nécessaire
        const currentPath = window.location.pathname;
        if (currentPath.includes('login.html') || currentPath.includes('register.html')) {
            if (this.isAdmin()) {
                window.location.href = '/pages/admin.html';
            } else {
                window.location.href = '/pages/profile.html';
            }
        }
    }

    /**
     * Actions à effectuer lors d'un échec d'authentification
     */
    onAuthFailure() {
        // Mettre à jour l'interface utilisateur
        this.updateUI();
        
        // Rediriger vers la page de connexion si sur une page protégée
        const protectedPages = ['profile.html', 'matches.html', 'messages.html', 'discover.html', 'admin.html'];
        const currentPath = window.location.pathname;
        
        if (protectedPages.some(page => currentPath.includes(page))) {
            window.location.href = '/pages/login.html';
        }
    }

    /**
     * Met à jour l'interface utilisateur selon l'état d'authentification
     */
    updateUI() {
        const loginBtns = document.querySelectorAll('#loginBtn, .login-btn');
        const registerBtns = document.querySelectorAll('#registerBtn, .register-btn');
        const userMenus = document.querySelectorAll('.user-menu');
        const userNames = document.querySelectorAll('.user-name');

        if (this.isAuthenticated()) {
            // Masquer les boutons de connexion/inscription
            loginBtns.forEach(btn => btn.style.display = 'none');
            registerBtns.forEach(btn => btn.style.display = 'none');
            
            // Afficher les menus utilisateur
            userMenus.forEach(menu => menu.style.display = 'block');
            
            // Mettre à jour le nom d'utilisateur
            userNames.forEach(nameEl => {
                nameEl.textContent = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
            });
        } else {
            // Afficher les boutons de connexion/inscription
            loginBtns.forEach(btn => btn.style.display = 'inline-block');
            registerBtns.forEach(btn => btn.style.display = 'inline-block');
            
            // Masquer les menus utilisateur
            userMenus.forEach(menu => menu.style.display = 'none');
        }
    }

    /**
     * Protège une page (redirige vers login si non connecté)
     */
    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = '/pages/login.html';
            return false;
        }
        return true;
    }

    /**
     * Protège une page admin
     */
    requireAdmin() {
        if (!this.isAuthenticated() || !this.isAdmin()) {
            window.location.href = '/pages/admin-login.html';
            return false;
        }
        return true;
    }
}

// Instance globale du gestionnaire d'authentification
window.authManager = new AuthManager();

// Export pour les modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}