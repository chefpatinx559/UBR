/**
 * Script d'inscription pour les nouveaux utilisateurs
 * Gère la validation du formulaire, l'inscription et le stockage des tokens
 */

document.addEventListener('DOMContentLoaded', function() {
    // Gestion du formulaire d'inscription
    const form = document.getElementById('registerForm');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Récupérer les valeurs du formulaire
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('email').value.trim();
        const dateOfBirth = document.getElementById('dateOfBirth').value;
        const gender = document.getElementById('gender').value;
        const city = document.getElementById('city').value.trim();
        const denomination = document.getElementById('denomination').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validation basique
        if (!firstName || !lastName || !email || !dateOfBirth || !gender || !city || !denomination || !password) {
            showError('Veuillez remplir tous les champs obligatoires.');
            return;
        }
        
        if (password !== confirmPassword) {
            showError('Les mots de passe ne correspondent pas.');
            return;
        }
        
        if (password.length < 8) {
            showError('Le mot de passe doit contenir au moins 8 caractères.');
            return;
        }
        
        // Vérifier les cases à cocher
        const checkboxes = form.querySelectorAll('input[type="checkbox"]');
        let allChecked = true;
        checkboxes.forEach(checkbox => {
            if (!checkbox.checked) {
                allChecked = false;
            }
        });
        
        if (!allChecked) {
            showError('Veuillez accepter toutes les conditions.');
            return;
        }
        
        // Appel à l'API d'inscription
        registerUser({
            firstName,
            lastName,
            email,
            password,
            password_confirmation: confirmPassword,
            dateOfBirth,
            gender,
            city,
            denomination,
            subscription: 'discovery' // Plan par défaut
        });
    });

    function showError(message) {
        errorText.textContent = message;
        errorMessage.classList.remove('hidden');
        setTimeout(() => {
            errorMessage.classList.add('hidden');
        }, 5000);
    }

    async function registerUser(userData) {
        // Afficher l'état de chargement
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Inscription en cours...';
        submitBtn.disabled = true;

        try {
            // Utiliser le gestionnaire d'authentification
            const response = await window.authManager.register(userData);
            
            // Inscription réussie
            submitBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Inscription réussie';
            submitBtn.classList.remove('bg-secondary', 'hover:bg-green-700');
            submitBtn.classList.add('bg-green-600', 'hover:bg-green-700');
            
            setTimeout(() => {
                window.location.href = 'profile.html';
            }, 1000);
        } catch (error) {
            // Échec de l'inscription
            console.error('Erreur d\'inscription:', error);
            showError(error.message || 'Erreur lors de l\'inscription.');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }
});