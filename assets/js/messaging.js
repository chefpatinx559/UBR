/**
 * Système de messagerie pour UBR - Union Bénie et Réelle
 * Ce fichier gère les fonctionnalités de messagerie entre utilisateurs
 */

// Classe principale pour la gestion des messages
class MessagingSystem {
    constructor(config = {}) {
        // Initialisation des données
        this.messages = {};
        this.currentUser = this.getCurrentUser();
        this.activeConversation = null;
        this.api = window.ubrApi;
        this.config = config;
        
        // Initialisation automatique si les éléments sont fournis
        if (Object.keys(config).length > 0) {
            this.initWithConfig();
        }
    }
    
    // Initialisation avec configuration
    initWithConfig() {
        // Assignation des éléments DOM depuis la configuration
        this.messagesContainer = this.config.messagesContainer;
        this.messageInput = this.config.messageInput;
        this.sendButton = this.config.sendButton;
        this.conversationItems = this.config.conversationItems;
        this.conversationName = this.config.conversationName;
        this.conversationStatus = this.config.conversationStatus;
        this.conversationAvatar = this.config.conversationAvatar;
        this.searchInput = this.config.searchInput;
        this.messagesList = this.messagesContainer;
        
        // Initialiser les écouteurs d'événements
        this.initEventListeners();
        
        // Charger les conversations
        this.fetchConversations();
    }
    
    // Méthode d'initialisation manuelle
    init() {
        this.initElements();
        this.initEventListeners();
        this.fetchConversations();
    }
    
    // Initialisation des éléments DOM (méthode de secours)
    initElements() {
        this.conversationItems = document.querySelectorAll('.conversation-item');
        this.chatContainer = document.getElementById('chat-container');
        this.messageInput = document.getElementById('message-input');
        this.sendButton = document.getElementById('send-button');
        this.conversationName = document.getElementById('conversation-name');
        this.conversationStatus = document.getElementById('conversation-status');
        this.conversationAvatar = document.getElementById('conversation-avatar');
        this.messagesContainer = document.getElementById('messagesContainer');
        this.messagesList = this.messagesContainer;
        this.emptyState = document.getElementById('empty-state');
    }
    
    // Initialisation des écouteurs d'événements
    initEventListeners() {
        // Gestion des clics sur les conversations
        this.conversationItems.forEach(item => {
            item.addEventListener('click', () => {
                const conversationId = item.getAttribute('data-conversation');
                this.setActiveConversation(conversationId);
            });
        });
        
        // Envoi de message
        if (this.sendButton) {
            this.sendButton.addEventListener('click', () => {
                this.sendMessage();
            });
        }
        
        // Envoi avec la touche Entrée
        if (this.messageInput) {
            this.messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }
    }
    
    // Obtenir l'utilisateur actuel (simulé)
    getCurrentUser() {
        const userInfo = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
        if (userInfo) {
            return JSON.parse(userInfo);
        }
        return null;
    }
    
    // Récupérer les conversations depuis l'API
    async fetchConversations() {
        try {
            const conversations = await this.api.getConversations();
        
            if (conversations && conversations.length > 0) {
                // Mettre à jour l'interface avec les conversations
                this.updateConversationsUI(conversations);
                
                // Activer la première conversation par défaut
                if (conversations.length > 0) {
                    this.setActiveConversation(conversations[0].id);
                }
            } else {
                this.showEmptyState();
            }
        } catch (error) {
            console.error('Erreur lors du chargement des conversations:', error);
            this.showEmptyState();
        }
    }
    
    // Afficher l'état vide
    showEmptyState() {
        if (this.emptyState) {
            this.emptyState.classList.remove('hidden');
            this.emptyState.innerHTML = `
                <div class="text-center p-6">
                    <i class="fas fa-comments text-gray-300 text-5xl mb-4"></i>
                    <h3 class="text-xl font-semibold text-gray-600 mb-2">Aucune conversation</h3>
                    <p class="text-gray-500">Commencez à discuter avec d'autres membres pour voir vos conversations ici.</p>
                </div>
            `;
        }
        if (this.chatContainer) this.chatContainer.classList.add('hidden');
    }
    
    // Mettre à jour l'interface des conversations
    updateConversationsUI(conversations) {
        const conversationsList = document.querySelector('.flex-1.overflow-y-auto');
        if (!conversationsList) return;
        
        // Vider la liste des conversations
        conversationsList.innerHTML = '';
        
        // Ajouter chaque conversation à la liste
        conversations.forEach(conversation => {
            const otherUser = conversation.other_user;
            const lastMessage = conversation.last_message;
            const isOnline = otherUser.is_online;
            const formattedTime = lastMessage ? new Date(lastMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
            const photoUrl = otherUser.primary_photo?.path 
                ? `http://localhost:8000/storage/${otherUser.primary_photo.path}`
                : `https://via.placeholder.com/50x50/10b981/ffffff?text=${otherUser.first_name.charAt(0)}`;
            
            const conversationItem = document.createElement('div');
            conversationItem.className = 'conversation-item p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-all duration-200 ease-in-out border-l-4 border-transparent hover:border-gray-200';
            conversationItem.setAttribute('data-conversation-id', conversation.id);
            conversationItem.setAttribute('data-user-id', otherUser.id);
            
            conversationItem.innerHTML = `
                <div class="flex items-center space-x-3">
                    <div class="relative">
                        <img src="${photoUrl}" alt="${otherUser.first_name}" class="w-12 h-12 rounded-full object-cover">
                        ${isOnline ? '<div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>' : ''}
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between">
                            <h3 class="font-semibold text-gray-800 truncate">${otherUser.first_name} ${otherUser.last_name.charAt(0)}.</h3>
                            <span class="text-xs text-gray-500">${formattedTime}</span>
                        </div>
                        <p class="text-sm text-gray-600 truncate">${lastMessage ? lastMessage.content : 'Aucun message'}</p>
                    </div>
                    ${conversation.unread_count > 0 ? `<div class="flex flex-col items-end"><span class="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">${conversation.unread_count}</span></div>` : ''}
                </div>
            `;
            
            conversationItem.addEventListener('click', () => {
                this.setActiveConversation(conversation.id);
            });
            
            conversationsList.appendChild(conversationItem);
        });
        
        // Mettre à jour la référence aux éléments de conversation
        this.conversationItems = document.querySelectorAll('.conversation-item');
    }
    
    // Définir la conversation active
    async setActiveConversation(conversationId) {
        // Mettre à jour la classe active
        this.conversationItems.forEach(item => {
            if (item.getAttribute('data-conversation-id') == conversationId) {
                item.classList.add('bg-gray-100');
                item.classList.remove('border-transparent');
                item.classList.add('border-primary');
                // Supprimer le badge de notification
                const badge = item.querySelector('.bg-primary');
                if (badge) badge.remove();
            } else {
                item.classList.remove('bg-gray-100');
                item.classList.remove('border-primary');
                item.classList.add('border-transparent');
            }
        });
        
        this.activeConversation = conversationId;
        
        // Mettre à jour les informations de la conversation
        this.updateConversationInfo(conversationId);
        
        // Récupérer et afficher les messages
        await this.fetchAndDisplayMessages(conversationId);
        
        // Afficher la conversation et masquer l'état vide
        if (this.emptyState) this.emptyState.classList.add('hidden');
        if (this.chatContainer) this.chatContainer.classList.remove('hidden');
    }
    
    // Mettre à jour les informations de la conversation (titre, statut, avatar)
    updateConversationInfo(conversationId) {
        const conversationItem = document.querySelector(`[data-conversation-id="${conversationId}"]`);
        if (!conversationItem) return;
        
        const name = conversationItem.querySelector('h3').textContent;
        const avatar = conversationItem.querySelector('img').src;
        const isOnline = conversationItem.querySelector('.bg-green-500') !== null;
        
        if (this.conversationName) this.conversationName.textContent = name;
        if (this.conversationStatus) {
            this.conversationStatus.innerHTML = isOnline ? '<i class="fas fa-circle mr-1"></i>En ligne' : '<i class="fas fa-circle mr-1"></i>Hors ligne';
            this.conversationStatus.className = isOnline ? 'text-sm text-green-600' : 'text-sm text-gray-500';
        }
        if (this.conversationAvatar) this.conversationAvatar.src = avatar;
    }
    
    // Récupérer et afficher les messages d'une conversation
    async fetchAndDisplayMessages(conversationId) {
        if (!this.messagesList) return;
        
        // Vider la liste des messages
        this.messagesList.innerHTML = '';
        
        // Afficher un indicateur de chargement
        this.messagesList.innerHTML = `
            <div class="flex justify-center items-center h-32">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        `;
        
        try {
            // Récupérer les messages depuis l'API
            const response = await this.api.getMessages(conversationId);
            const messages = response.data || [];
        
            // Vider à nouveau la liste des messages
            this.messagesList.innerHTML = '';
        
            if (!messages || messages.length === 0) {
                // Afficher un message si aucun message n'est disponible
                this.messagesList.innerHTML = `
                    <div class="text-center p-6">
                        <p class="text-gray-500">Aucun message. Commencez la conversation !</p>
                    </div>
                `;
                return;
            }
        
            // Stocker les messages dans la mémoire locale
            this.messages[conversationId] = messages;
        
            // Afficher chaque message
            messages.forEach(message => {
                const isSent = message.sender_id == this.currentUser.id;
                const messageElement = this.createMessageElement(message, isSent);
                this.messagesList.appendChild(messageElement);
            });
        
            // Faire défiler jusqu'au dernier message
            this.scrollToBottom();
        } catch (error) {
            console.error('Erreur lors du chargement des messages:', error);
            this.messagesList.innerHTML = `
                <div class="text-center p-6">
                    <p class="text-red-500">Erreur lors du chargement des messages</p>
                </div>
            `;
        }
    }
    
    // Créer un élément de message
    createMessageElement(message, isSent) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `flex ${isSent ? 'justify-end' : 'justify-start'} mb-4`;
        
        const timestamp = new Date(message.created_at);
        const formattedTime = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.innerHTML = `
            <div class="flex flex-col ${isSent ? 'items-end' : 'items-start'}">
                <div class="${isSent ? 'bg-primary text-white rounded-t-lg rounded-bl-lg' : 'bg-gray-100 text-gray-800 rounded-t-lg rounded-br-lg'} px-4 py-3 max-w-xs md:max-w-md lg:max-w-lg shadow-sm">
                    ${message.content}
                </div>
                <span class="text-xs text-gray-500 mt-1">${formattedTime}</span>
            </div>
        `;
        
        return messageDiv;
    }
    
    // Envoyer un message
    async sendMessage() {
        if (!this.messageInput || !this.activeConversation) return;
        
        const content = this.messageInput.value.trim();
        if (!content) return;

        // Obtenir l'ID de l'utilisateur destinataire
        const activeConversationItem = document.querySelector(`[data-conversation-id="${this.activeConversation}"]`);
        const receiverId = activeConversationItem?.getAttribute('data-user-id');
        
        if (!receiverId) {
            console.error('ID du destinataire non trouvé');
            return;
        }
        
        // Désactiver le bouton d'envoi pendant l'envoi
        if (this.sendButton) {
            this.sendButton.disabled = true;
            this.sendButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        }
        
        try {
            // Envoyer le message à l'API
            const response = await this.api.sendMessage(receiverId, content);
        
            // Réactiver le bouton d'envoi
            if (this.sendButton) {
                this.sendButton.disabled = false;
                this.sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
            }
        
            if (response) {
                // Ajouter le message à la conversation locale
                if (!this.messages[this.activeConversation]) {
                    this.messages[this.activeConversation] = [];
                }
                this.messages[this.activeConversation].push(response.data);
                
                // Afficher le nouveau message
                const messageElement = this.createMessageElement(response.data, true);
                if (this.messagesList) {
                    this.messagesList.appendChild(messageElement);
                    this.scrollToBottom();
                }
                
                // Vider le champ de saisie
                this.messageInput.value = '';
                
                // Mettre à jour la liste des conversations
                this.fetchConversations();
            }
        } catch (error) {
            console.error('Erreur lors de l\'envoi du message:', error);
            
            // Réactiver le bouton d'envoi
            if (this.sendButton) {
                this.sendButton.disabled = false;
                this.sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
            }
            
            alert('Erreur lors de l\'envoi du message. Veuillez réessayer.');
        }
    }
    
    // Vérifier les nouveaux messages périodiquement
    startMessagePolling() {
        // Vérifier les nouveaux messages toutes les 30 secondes
        this.pollingInterval = setInterval(() => {
            if (this.activeConversation) {
                this.fetchAndDisplayMessages(this.activeConversation);
            }
            this.fetchConversations();
        }, 30000);
    }
    
    // Arrêter la vérification périodique
    stopMessagePolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
        }
    }
    
    // Afficher l'indicateur de frappe
    showTypingIndicator() {
        if (!this.messagesList) return;
        
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator';
        typingDiv.className = 'flex justify-start mb-4';
        
        typingDiv.innerHTML = `
            <div class="bg-gray-100 text-gray-800 rounded-t-lg rounded-br-lg px-4 py-3 flex space-x-1 items-center">
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-0"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></div>
            </div>
        `;
        
        this.messagesList.appendChild(typingDiv);
        this.scrollToBottom();
    }
    
    // Masquer l'indicateur de frappe
    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    // Faire défiler jusqu'au dernier message
    scrollToBottom() {
        if (this.messagesList) {
            this.messagesList.scrollTop = this.messagesList.scrollHeight;
        }
    }
    
    // Créer une nouvelle conversation
    async createNewConversation(userId) {
        // Envoyer un premier message pour créer la conversation
        const messageData = {
            receiverId: userId,
            content: "Bonjour, j'aimerais faire votre connaissance."
        };
        
        const response = await this.fetchAPI('/messages', 'POST', messageData);
        
        if (response) {
            // Rafraîchir les conversations
            await this.fetchConversations();
            
            // Activer la nouvelle conversation
            this.setActiveConversation(userId);
            
            return true;
        }
        
        return false;
    }
}

// Initialiser le système de messagerie lorsque le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    const messagingSystem = new MessagingSystem();
    
    // Exposer l'instance pour les tests
    window.messagingSystem = messagingSystem;
});

