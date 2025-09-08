 // Animation du compteur de membres
        function animateCounter() {
            const counter = document.getElementById('memberCount');
            const target = 2847;
            let current = 0;
            const increment = target / 100;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                counter.textContent = Math.floor(current).toLocaleString();
            }, 20);
        }

        // Gestion des modales
        const loginModal = document.getElementById('loginModal');
        const registerModal = document.getElementById('registerModal');
        const storiesModal = document.getElementById('storiesModal');
        const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
        
        // Boutons d'ouverture
        document.getElementById('loginBtn').addEventListener('click', () => {
            loginModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        });
        
        document.getElementById('registerBtn').addEventListener('click', () => {
            registerModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        });

        document.getElementById('mobileLoginBtn').addEventListener('click', () => {
            mobileMenuOverlay.classList.add('hidden');
            loginModal.classList.remove('hidden');
        });
        
        document.getElementById('mobileRegisterBtn').addEventListener('click', () => {
            mobileMenuOverlay.classList.add('hidden');
            registerModal.classList.remove('hidden');
        });
        
        // Boutons de fermeture
        document.getElementById('closeLoginModal').addEventListener('click', () => {
            loginModal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        });
        
        document.getElementById('closeRegisterModal').addEventListener('click', () => {
            registerModal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        });
        
        document.getElementById('closeStoriesModal').addEventListener('click', () => {
            storiesModal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        });
        
        // Basculement entre login et register
        document.getElementById('switchToRegister').addEventListener('click', () => {
            loginModal.classList.add('hidden');
            registerModal.classList.remove('hidden');
        });
        
        document.getElementById('switchToLogin').addEventListener('click', () => {
            registerModal.classList.add('hidden');
            loginModal.classList.remove('hidden');
        });
        
        // Menu mobile
        document.getElementById('mobileMenu').addEventListener('click', () => {
            mobileMenuOverlay.classList.remove('hidden');
        });
        
        document.getElementById('closeMobileMenu').addEventListener('click', () => {
            mobileMenuOverlay.classList.add('hidden');
        });
        
        // Fermeture des modales en cliquant à l'extérieur
        [loginModal, registerModal, storiesModal, mobileMenuOverlay].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.add('hidden');
                    document.body.style.overflow = 'auto';
                }
            });
        });
        
        // Démarrage des animations au chargement
        window.addEventListener('load', () => {
            animateCounter();
        });
        
        // Smooth scroll pour les liens d'ancrage
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
        
        // Validation basique du formulaire d'inscription
        document.querySelector('#registerModal form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const requiredFields = this.querySelectorAll('input[type="text"], input[type="email"], input[type="date"], input[type="password"], select');
            let allValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    field.classList.add('border-red-500');
                    allValid = false;
                } else {
                    field.classList.remove('border-red-500');
                }
            });
            
            const checkboxes = this.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                if (!checkbox.checked) {
                    allValid = false;
                    checkbox.parentElement.classList.add('text-red-500');
                } else {
                    checkbox.parentElement.classList.remove('text-red-500');
                }
            });
            
            if (allValid) {
                alert('Inscription réussie ! Un email de confirmation vous a été envoyé.');
                registerModal.classList.add('hidden');
                document.body.style.overflow = 'auto';
            } else {
                alert('Veuillez remplir tous les champs obligatoires et accepter les conditions.');
            }
        });
        
        // Animation d'apparition au scroll
        const observerOptions = {
            threshold: 0.3,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);
        
        // Observer les éléments à animer
        document.querySelectorAll('.card-hover').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'all 0.6s ease';
            observer.observe(card);
        });