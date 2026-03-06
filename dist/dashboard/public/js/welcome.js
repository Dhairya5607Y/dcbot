document.addEventListener('DOMContentLoaded', function() {
    if (!window.location.pathname.includes('/welcome')) return;

    const saveButton = document.getElementById('saveWelcomeSettings');
    const enabledToggle = document.getElementById('welcomeEnabled');
    const embedToggle = document.getElementById('welcomeEmbedEnabled');
    const dmToggle = document.getElementById('welcomeDmEnabled');
    
    // Welcome controls
    const channelSelect = document.getElementById('welcomeChannel');
    const messageTextarea = document.getElementById('welcomeMessage');
    
    // Embed controls
    const embedTitle = document.getElementById('welcomeEmbedTitle');
    const embedColor = document.getElementById('welcomeEmbedColor');
    const embedDescription = document.getElementById('welcomeEmbedDescription');
    const embedThumbnail = document.getElementById('welcomeEmbedThumbnail');
    const embedImage = document.getElementById('welcomeEmbedImage');
    const embedFooter = document.getElementById('welcomeEmbedFooter');
    const embedTimestamp = document.getElementById('welcomeEmbedTimestamp');
    
    // DM controls
    const dmMessage = document.getElementById('welcomeDmMessage');

    // Update controls state based on toggles
    function updateControlsState() {
        const welcomeControls = document.querySelectorAll('.welcome-controls');
        const embedControls = document.querySelectorAll('.embed-controls');
        const dmControls = document.querySelectorAll('.dm-controls');
        
        welcomeControls.forEach(el => {
            if (enabledToggle.checked) {
                el.classList.remove('opacity-50', 'pointer-events-none');
            } else {
                el.classList.add('opacity-50', 'pointer-events-none');
            }
        });
        
        embedControls.forEach(el => {
            if (embedToggle.checked && enabledToggle.checked) {
                el.classList.remove('opacity-50', 'pointer-events-none');
            } else {
                el.classList.add('opacity-50', 'pointer-events-none');
            }
        });
        
        dmControls.forEach(el => {
            if (dmToggle.checked && enabledToggle.checked) {
                el.classList.remove('opacity-50', 'pointer-events-none');
            } else {
                el.classList.add('opacity-50', 'pointer-events-none');
            }
        });
        
        updatePreview();
    }

    // Live Preview logic
    function updatePreview() {
        const embedPreview = document.getElementById('embedPreview');
        const textPreview = document.getElementById('textPreview');
        
        if (!enabledToggle.checked) {
            embedPreview.classList.add('hidden');
            textPreview.classList.add('hidden');
            return;
        }

        const vars = {
            '{user}': 'User#0001',
            '{server}': 'My Discord Server',
            '{memberCount}': '123'
        };

        function replaceVars(text) {
            if (!text) return '';
            let result = text;
            for (const [key, value] of Object.entries(vars)) {
                result = result.split(key).join(value);
            }
            return result;
        }

        if (embedToggle.checked) {
            embedPreview.classList.remove('hidden');
            textPreview.classList.add('hidden');
            
            document.getElementById('previewTitle').innerText = replaceVars(embedTitle.value);
            document.getElementById('previewDescription').innerText = replaceVars(embedDescription.value);
            document.getElementById('previewEmbedContent').style.borderColor = embedColor.value;
            
            const image = document.getElementById('previewImage');
            if (embedImage.value) {
                image.src = embedImage.value;
                image.classList.remove('hidden');
            } else {
                image.classList.add('hidden');
            }
            
            document.getElementById('previewFooterText').innerText = replaceVars(embedFooter.value);
            
            const timestamp = document.getElementById('previewTimestamp');
            if (embedTimestamp.checked) {
                timestamp.classList.remove('hidden');
            } else {
                timestamp.classList.add('hidden');
            }
        } else {
            embedPreview.classList.add('hidden');
            textPreview.classList.remove('hidden');
            document.getElementById('previewTextMessage').innerText = replaceVars(messageTextarea.value);
        }
    }

    // Event listeners
    [enabledToggle, embedToggle, dmToggle, channelSelect, messageTextarea, embedTitle, embedColor, embedDescription, embedThumbnail, embedImage, embedFooter, embedTimestamp, dmMessage].forEach(el => {
        el.addEventListener('change', updateControlsState);
        el.addEventListener('input', updatePreview);
    });

    saveButton.addEventListener('click', async function() {
        const settings = {
            enabled: enabledToggle.checked,
            channelId: channelSelect.value,
            message: messageTextarea.value,
            embed: {
                enabled: embedToggle.checked,
                title: embedTitle.value,
                description: embedDescription.value,
                color: embedColor.value,
                thumbnail: embedThumbnail.value === 'User Avatar' ? true : embedThumbnail.value,
                image: embedImage.value,
                footer: embedFooter.value,
                timestamp: embedTimestamp.checked
            },
            dm: {
                enabled: dmToggle.checked,
                message: dmMessage.value
            }
        };

        try {
            saveButton.disabled = true;
            saveButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Saving...';
            
            const response = await fetch('/api/welcome/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            
            const data = await response.json();
            if (data.success) {
                showToast('Welcome settings saved successfully', 'success');
            } else {
                showToast('Failed to save settings: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error saving welcome settings:', error);
            showToast('An error occurred while saving settings', 'error');
        } finally {
            saveButton.disabled = false;
            saveButton.innerHTML = '<i class="fas fa-save mr-2"></i> Save Settings';
        }
    });

    // Initial state
    updateControlsState();
});

function showToast(message, type = 'success') {
    // Check if showToast is available from other scripts, otherwise alert
    if (typeof window.showToast === 'function') {
        window.showToast(message, type);
    } else {
        alert(message);
    }
}
