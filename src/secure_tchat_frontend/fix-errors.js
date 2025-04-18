// Script to fix issues and ensure all functionality works
(function() {
    console.log('Running error fixes...');
    
    // Add event delegation for attachment option buttons
    document.addEventListener('click', function(event) {
        // Handle attachment option buttons
        if (event.target.closest('.attachment-options-btn')) {
            event.stopPropagation();
            const button = event.target.closest('.attachment-options-btn');
            const attachmentId = button.closest('[data-attachment-id]').dataset.attachmentId;
            const type = button.getAttribute('data-type') || 'application/octet-stream';
            const fileName = button.getAttribute('data-filename') || 'file';
            
            // Call the function from the global scope
            if (window.showAttachmentOptions) {
                window.showAttachmentOptions(attachmentId, type, fileName);
            }
            
            return false;
        }
    });
    
    // Create direct functions for attachment handling
    if (!window.openAttachment) {
        window.openAttachment = function(attachmentId) {
            console.log('Opening attachment:', attachmentId);
            const attachment = window.messageAttachments && window.messageAttachments[attachmentId];
            if (!attachment || !attachment.data) return;
            
            // For images, videos, and audio, show in a modal
            if (attachment.type.startsWith('image/') || 
                attachment.type.startsWith('video/') ||
                attachment.type.startsWith('audio/')) {
                
                if (window.showMediaViewer) {
                    window.showMediaViewer(attachment);
                } else {
                    // Fallback if showMediaViewer doesn't exist
                    window.open(attachment.data, '_blank');
                }
            } else {
                // For other files, open in a new tab
                window.open(attachment.data, '_blank');
            }
        };
    }
    
    // Function to display media in a modal if not already defined
    if (!window.showMediaViewer) {
        window.showMediaViewer = function(attachment) {
            // Remove any existing viewer
            const existingViewer = document.querySelector('.media-viewer-container');
            if (existingViewer) existingViewer.remove();
            
            // Create the media viewer container
            const viewerContainer = document.createElement('div');
            viewerContainer.className = 'media-viewer-container';
            
            // Create content based on media type
            let mediaContent = '';
            
            if (attachment.type.startsWith('image/')) {
                mediaContent = `
                    <div class="media-viewer-content image-viewer">
                        <img src="${attachment.data}" alt="${attachment.name}">
                        <div class="media-info">
                            <span>${attachment.name}</span>
                        </div>
                    </div>
                `;
            } else if (attachment.type.startsWith('video/')) {
                mediaContent = `
                    <div class="media-viewer-content video-viewer">
                        <video controls autoplay>
                            <source src="${attachment.data}" type="${attachment.type}">
                            Your browser does not support the video tag.
                        </video>
                        <div class="media-info">
                            <span>${attachment.name}</span>
                        </div>
                    </div>
                `;
            } else if (attachment.type.startsWith('audio/')) {
                mediaContent = `
                    <div class="media-viewer-content audio-viewer">
                        <div class="audio-container">
                            <i class="bi bi-music-note-beamed audio-icon"></i>
                            <audio controls autoplay>
                                <source src="${attachment.data}" type="${attachment.type}">
                                Your browser does not support the audio tag.
                            </audio>
                        </div>
                        <div class="media-info">
                            <span>${attachment.name}</span>
                        </div>
                    </div>
                `;
            }
            
            // Set the viewer HTML
            viewerContainer.innerHTML = `
                <div class="media-viewer-backdrop"></div>
                ${mediaContent}
                <button class="media-viewer-close">
                    <i class="bi bi-x-lg"></i>
                </button>
            `;
            
            // Add to body
            document.body.appendChild(viewerContainer);
            
            // Add animation
            setTimeout(() => {
                viewerContainer.classList.add('show');
            }, 10);
            
            // Add close event
            const closeButton = viewerContainer.querySelector('.media-viewer-close');
            const backdrop = viewerContainer.querySelector('.media-viewer-backdrop');
            
            function closeViewer() {
                viewerContainer.classList.remove('show');
                setTimeout(() => {
                    if (document.body.contains(viewerContainer)) {
                        document.body.removeChild(viewerContainer);
                    }
                }, 300);
            }
            
            closeButton.addEventListener('click', closeViewer);
            backdrop.addEventListener('click', closeViewer);
        };
    }
    
    if (!window.saveAttachment) {
        window.saveAttachment = function(attachmentId, fileName) {
            console.log('Saving attachment:', attachmentId, fileName);
            const attachment = window.messageAttachments && window.messageAttachments[attachmentId];
            if (attachment && attachment.data) {
                const a = document.createElement('a');
                a.href = attachment.data;
                a.download = fileName || 'download';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        };
    }
    
    // Fix missing reply functions
    if (!window.replyToMessage) {
        window.replyToMessage = function(messageId) {
            console.log('Replying to message:', messageId);
            const currentChatId = localStorage.getItem('currentChatId');
            if (!currentChatId) return;
            
            // Find the message in the chat
            const chatsData = window.chats || {};
            const chat = chatsData[currentChatId];
            if (!chat || !chat.messages) return;
            
            const message = chat.messages.find(m => m.id === messageId);
            if (!message) return;
            
            // Get the sender info
            const currentUser = JSON.parse(localStorage.getItem('tchat_user')) || {};
            const contacts = window.contacts || [];
            const sender = message.senderId === currentUser.id ? 
                currentUser : 
                contacts.find(c => c.id === message.senderId) || {displayName: 'User'};
            
            // Create reply state
            const replyingTo = {
                messageId: message.id,
                text: message.text || 'Attachment',
                senderId: message.senderId,
                senderName: sender.displayName
            };
            
            // Show reply UI
            let replyComposer = document.querySelector('.reply-composer');
            if (!replyComposer) {
                replyComposer = document.createElement('div');
                replyComposer.className = 'reply-composer';
                const inputContainer = document.querySelector('.message-input-container');
                if (inputContainer) {
                    inputContainer.insertBefore(replyComposer, inputContainer.firstChild);
                }
            }
            
            // Set reply content
            if (replyComposer) {
                replyComposer.innerHTML = `
                    <div class="reply-composer-content">
                        <div class="reply-composer-info">
                            <div class="reply-to-label">Replying to ${replyingTo.senderName}</div>
                            <div class="reply-to-preview">${replyingTo.text.length > 50 ? replyingTo.text.substring(0, 47) + '...' : replyingTo.text}</div>
                        </div>
                        <button class="cancel-reply-btn" onclick="cancelReply()"><i class="bi bi-x"></i></button>
                    </div>
                `;
                
                // Store reply info for sending
                window.replyingTo = replyingTo;
                
                // Focus the input
                const messageInput = document.getElementById('message-input');
                if (messageInput) messageInput.focus();
            }
        };
    }
    
    // Fix missing cancel reply function
    if (!window.cancelReply) {
        window.cancelReply = function() {
            console.log('Cancelling reply');
            window.replyingTo = null;
            const replyComposer = document.querySelector('.reply-composer');
            if (replyComposer) {
                replyComposer.remove();
            }
        };
    }
    
    // Fix missing scroll to message function
    if (!window.scrollToMessage) {
        window.scrollToMessage = function(messageId) {
            console.log('Scrolling to message:', messageId);
            const messageElement = document.querySelector(`.message-container[data-message-id="${messageId}"]`);
            if (messageElement) {
                // Scroll to the message
                messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Add a highlight effect
                messageElement.classList.add('highlight-message');
                setTimeout(() => {
                    messageElement.classList.remove('highlight-message');
                }, 2000);
            }
        };
    }
    
    // Create a simple attachment options menu function if it doesn't exist
    if (!window.showAttachmentOptions) {
        window.showAttachmentOptions = function(attachmentId, type, fileName) {
            console.log('Showing options for:', attachmentId, type, fileName);
            
            // Remove any existing menus
            const existingMenu = document.querySelector('.attachment-options-menu');
            if (existingMenu) existingMenu.remove();
            
            // Get the attachment and element
            const attachmentElement = document.querySelector(`[data-attachment-id="${attachmentId}"]`);
            if (!attachmentElement) return;
            
            // Create options menu
            const menu = document.createElement('div');
            menu.className = 'attachment-options-menu';
            
            // Add different options based on file type
            if (type.startsWith('image/') || type.startsWith('video/')) {
                menu.innerHTML = `
                    <button class="option-btn" onclick="window.openAttachment('${attachmentId}')"><i class="bi bi-eye"></i> View</button>
                    <button class="option-btn" onclick="window.saveAttachment('${attachmentId}', '${fileName}')"><i class="bi bi-download"></i> Save As</button>
                `;
            } else {
                menu.innerHTML = `
                    <button class="option-btn" onclick="window.openAttachment('${attachmentId}')"><i class="bi bi-box-arrow-up-right"></i> Open</button>
                    <button class="option-btn" onclick="window.saveAttachment('${attachmentId}', '${fileName}')"><i class="bi bi-download"></i> Save As</button>
                `;
            }
            
            // Position the menu on the left side
            const rect = attachmentElement.getBoundingClientRect();
            menu.style.position = 'fixed';
            menu.style.top = `${rect.top + window.scrollY}px`;
            menu.style.left = `${rect.left - 170 + window.scrollX}px`; // Position to the left of the attachment
            
            // Add to document
            document.body.appendChild(menu);
            
            // Close when clicking outside
            setTimeout(() => {
                const closeMenu = function(e) {
                    if (!menu.contains(e.target) && !attachmentElement.contains(e.target)) {
                        menu.remove();
                        document.removeEventListener('click', closeMenu);
                    }
                };
                document.addEventListener('click', closeMenu);
            }, 10);
        };
    }
    
    console.log('Fixes applied successfully!');
})();
