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

    function loginUser(email, password, remember) {
        // Afficher l'état de chargement
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Connexion...';
        submitBtn.disabled = true;

        // Appel à l'API d'authentification
        fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => Promise.reject(data));
            }
            return response.json();
        })
        .then(data => {
            // Connexion réussie
            submitBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Connexion réussie';
            submitBtn.classList.remove('bg-primary', 'hover:bg-blue-700');
            submitBtn.classList.add('bg-green-600', 'hover:bg-green-700');
            
            // Stocker le token dans localStorage ou sessionStorage
            if (remember) {
                localStorage.setItem('userToken', data.token);
                localStorage.setItem('userInfo', JSON.stringify({
                    id: data._id,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    isAdmin: data.isAdmin
                }));
            } else {
                sessionStorage.setItem('userToken', data.token);
                sessionStorage.setItem('userInfo', JSON.stringify({
                    id: data._id,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    isAdmin: data.isAdmin
                }));
            }
            
            setTimeout(() => {
                window.location.href = 'profile.html';
            }, 1000);
        })
        .catch(error => {
            // Échec de connexion
            console.error('Erreur de connexion:', error);
            showError(error.message || 'Email ou mot de passe incorrect.');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        });
    }
});