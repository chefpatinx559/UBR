// Variables globales
let scrollY = 0;

// Animation du compteur de membres dans le hero
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

// Animation des compteurs dans les statistiques
function animateCounters() {
    const counters = document.querySelectorAll('.counter-animate[data-target]');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        let current = 0;
        const increment = target / 100;
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                counter.textContent = Math.floor(current);
                setTimeout(updateCounter, 20);
            } else {
                counter.textContent = target;
                if (target === 98) {
                    counter.textContent = target + '%';
                }
            }
        };
        
        updateCounter();
    });
}

// Gestion du scroll et des animations
function handleScroll() {
    scrollY = window.scrollY;
    
    // Animation du header
    const header = document.getElementById('header');
    if (scrollY > 100) {
        header.classList.add('header-scrolled');
    } else {
        header.classList.remove('header-scrolled');
    }

    // Effet parallax subtil
    const parallaxElements = document.querySelectorAll('.parallax-slow');
    parallaxElements.forEach(el => {
        const speed = 0.5;
        el.style.setProperty('--scroll-y', `${scrollY * speed * -1}px`);
    });
}

// Intersection Observer pour les animations au scroll
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-visible');
                
                // Si c'est la section des statistiques, déclencher l'animation des compteurs
                if (entry.target.closest('section') && 
                    entry.target.closest('section').querySelector('.counter-animate[data-target]') && 
                    !entry.target.classList.contains('counters-animated')) {
                    entry.target.classList.add('counters-animated');
                    setTimeout(() => {
                        animateCounters();
                    }, 300);
                }
            }
        });
    }, observerOptions);

    // Observer tous les éléments avec la classe scroll-animate
    document.querySelectorAll('.scroll-animate').forEach(el => {
        observer.observe(el);
    });
}

// Gestion du bouton "Comment ça marche"
function initHowItWorksButton() {
    const howItWorksBtn = document.getElementById('howItWorksBtn');
    if (howItWorksBtn) {
        howItWorksBtn.addEventListener('click', () => {
            const howItWorksSection = document.getElementById('howItWorks');
            if (howItWorksSection) {
                howItWorksSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }
}

function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenu');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    const closeMobileMenuBtn = document.getElementById('closeMobileMenu');

    mobileMenuBtn.addEventListener('click', () => {
        mobileMenuOverlay.classList.remove('hidden');
    });

    closeMobileMenuBtn.addEventListener('click', () => {
        mobileMenuOverlay.classList.add('hidden');
    });

    // Fermer le menu en cliquant sur l'overlay
    mobileMenuOverlay.addEventListener('click', (e) => {
        if (e.target === mobileMenuOverlay) {
            mobileMenuOverlay.classList.add('hidden');
        }
    });
}

// Smooth scroll pour les liens d'ancrage
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                    
                // Fermer le menu mobile si ouvert
                const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
                if (!mobileMenuOverlay.classList.contains('hidden')) {
                    mobileMenuOverlay.classList.add('hidden');
                }
            }
        });
    });
}

// Gestion du formulaire de contact
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Animation de soumission
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Envoi en cours...';
        submitBtn.disabled = true;
        
        // Simulation d'envoi
        setTimeout(() => {
            submitBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Message envoyé !';
            submitBtn.classList.remove('bg-primary', 'hover:bg-blue-700');
            submitBtn.classList.add('bg-green-500');
            
            // Reset après 3 secondes
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                submitBtn.classList.remove('bg-green-500');
                submitBtn.classList.add('bg-primary', 'hover:bg-blue-700');
                contactForm.reset();
            }, 3000);
        }, 2000);
    });
}

// Animation de révélation progressive des éléments de liste
function initListAnimations() {
    const lists = document.querySelectorAll('ul li, .space-y-2 li, .space-y-3 li');
    lists.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
        item.style.transition = `all 0.6s ease ${index * 0.1}s`;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateX(0)';
                }
            });
        });
        
        observer.observe(item);
    });
}

// Animation des étoiles dans les témoignages
function initStarAnimations() {
    const starContainers = document.querySelectorAll('.flex.text-accent');
    starContainers.forEach(container => {
        const stars = container.querySelectorAll('.fas.fa-star');
        stars.forEach((star, index) => {
            star.style.opacity = '0';
            star.style.transform = 'scale(0) rotate(180deg)';

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            star.style.transition = 'all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
                            star.style.opacity = '1';
                            star.style.transform = 'scale(1) rotate(0deg)';
                        }, index * 100);
                    }
                });
            });
            
            observer.observe(container);
        });
    });
}

// Animation des icônes au hover
function initIconAnimations() {
    const iconContainers = document.querySelectorAll('[class*="bg-"]:has(i.fas)');
    iconContainers.forEach(container => {
        const icon = container.querySelector('i.fas');
        if (icon) {
            container.addEventListener('mouseenter', () => {
                icon.style.transform = 'scale(1.2) rotate(5deg)';
                icon.style.transition = 'transform 0.3s ease';
            });
            
            container.addEventListener('mouseleave', () => {
                icon.style.transform = 'scale(1) rotate(0deg)';
            });
        }
    });
}

// Animation de particules flottantes (effet subtil)
function createFloatingParticles() {
    const heroSection = document.getElementById('accueil');
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'absolute w-2 h-2 bg-white/20 rounded-full pointer-events-none';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animation = `float ${3 + Math.random() * 4}s ease-in-out infinite`;
        particle.style.animationDelay = Math.random() * 2 + 's';
        heroSection.appendChild(particle);
    }
}

// Initialisation de toutes les animations et fonctionnalités
function init() {
    // Animations de base
    initScrollAnimations();
    initSmoothScroll();
    initMobileMenu();
    initContactForm();
    initHowItWorksButton();
    
    // Animations avancées
    initListAnimations();
    initStarAnimations();
    initIconAnimations();
    
    // Effets visuels
    createFloatingParticles();
    
    // Démarrer l'animation du compteur principal
    setTimeout(() => {
        animateCounter();
    }, 1000);
}

// Event listeners
window.addEventListener('scroll', handleScroll);
window.addEventListener('load', init);

// Performance : throttle du scroll
let ticking = false;
function requestTick() {
    if (!ticking) {
        requestAnimationFrame(handleScroll);
        ticking = true;
        setTimeout(() => { ticking = false; }, 16);
    }
}

window.addEventListener('scroll', requestTick);