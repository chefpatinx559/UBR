/**
 * Initialisation du système de messagerie
 * Ce fichier initialise le système de messagerie avec les éléments DOM nécessaires
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialiser le système de messagerie
    new MessagingSystem({
        messagesContainer: document.getElementById('messagesContainer'),
        messageInput: document.getElementById('message-input'),
        sendButton: document.getElementById('send-button'),
        conversationItems: document.querySelectorAll('.conversation-item'),
        conversationName: document.getElementById('conversation-name'),
        conversationStatus: document.getElementById('conversation-status'),
        conversationAvatar: document.getElementById('conversation-avatar'),
        searchInput: document.querySelector('input[placeholder*="Rechercher"]')
    });
});