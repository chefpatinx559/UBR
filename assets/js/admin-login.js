/**
 * Script d'authentification pour l'interface admin
 * Gère la connexion, la validation du formulaire et le stockage des tokens
 */

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('adminLoginForm');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    // Toggle password visibility
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
    });

    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = passwordInput.value.trim();
        const remember = document.getElementById('remember').checked;

        // Validation basique
        if (!username || !password) {
            showError('Veuillez remplir tous les champs.');
            return;
        }

        // Authentification
        loginAdmin(username, password, remember);
    });

    function showError(message) {
        errorText.textContent = message;
        errorMessage.classList.remove('hidden');
        setTimeout(() => {
            errorMessage.classList.add('hidden');
        }, 5000);
    }

    function loginAdmin(username, password, remember) {
        // Simuler un délai de connexion
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Connexion...';
        submitBtn.disabled = true;

        // Appel à l'API d'authentification admin
        fetch('http://localhost:5000/api/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
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
            submitBtn.classList.remove('from-primary', 'to-divine', 'hover:from-blue-700', 'hover:to-purple-700');
            submitBtn.classList.add('bg-green-600', 'hover:bg-green-700');
            
            // Stocker le token dans localStorage ou sessionStorage
            if (remember) {
                localStorage.setItem('adminToken', data.token);
                localStorage.setItem('adminInfo', JSON.stringify({
                    id: data._id,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    isAdmin: data.isAdmin
                }));
            } else {
                sessionStorage.setItem('adminToken', data.token);
                sessionStorage.setItem('adminInfo', JSON.stringify({
                    id: data._id,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    isAdmin: data.isAdmin
                }));
            }
            
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 1000);
        })
        .catch(error => {
            // Échec de connexion
            console.error('Erreur de connexion:', error);
            showError(error.message || 'Nom d\'utilisateur ou mot de passe incorrect.');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        });
    }
    
    // Auto-focus sur le premier champ
    document.getElementById('username').focus();

    // Gestion des erreurs en temps réel
    const inputs = form.querySelectorAll('input[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (!this.value.trim()) {
                this.classList.add('border-red-500');
            } else {
                this.classList.remove('border-red-500');
            }
        });

        input.addEventListener('input', function() {
            if (this.value.trim()) {
                this.classList.remove('border-red-500');
            }
        });
    });
});