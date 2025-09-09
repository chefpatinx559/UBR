/**
 * Script d'authentification pour la connexion utilisateur
 * Gère la connexion, la validation du formulaire et le stockage des tokens
 */

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');

    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        const remember = document.getElementById('remember').checked;

        // Validation basique
        if (!email || !password) {
            showError('Veuillez remplir tous les champs.');
            return;
        }

        // Appel à l'API d'authentification
        loginUser(email, password, remember);
    });

    function showError(message) {
        errorText.textContent = message;
        errorMessage.classList.remove('hidden');
        setTimeout(() => {
            errorMessage.classList.add('hidden');
        }, 5000);
    }

    async function loginUser(email, password, remember) {
        // Afficher l'état de chargement
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Connexion...';
        submitBtn.disabled = true;

        try {
            // Utiliser le gestionnaire d'authentification
            const response = await window.authManager.login(email, password, remember);
            
            // Connexion réussie
            submitBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Connexion réussie';
            submitBtn.classList.remove('bg-primary', 'hover:bg-blue-700');
            submitBtn.classList.add('bg-green-600', 'hover:bg-green-700');
            
            setTimeout(() => {
                if (response.user.is_admin) {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'profile.html';
                }
            }, 1000);
        } catch (error) {
            // Échec de connexion
            console.error('Erreur de connexion:', error);
            showError(error.message || 'Email ou mot de passe incorrect.');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }
});