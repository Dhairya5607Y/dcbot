document.addEventListener('DOMContentLoaded', function() {
    if (!window.location.pathname.includes('/games')) return;

    const saveButton = document.getElementById('saveGamesSettings');
    const enabledToggle = document.getElementById('gamesEnabled');
    
    // Controls
    const leaderboardEnabled = document.getElementById('leaderboardEnabled');
    const triviaEnabled = document.getElementById('triviaEnabled');
    const countingEnabled = document.getElementById('countingEnabled');
    const countingChannel = document.getElementById('countingChannel');

    function updateControlsState() {
        const gamesControls = document.querySelectorAll('.games-controls');
        gamesControls.forEach(el => {
            if (enabledToggle.checked) {
                el.classList.remove('opacity-50', 'pointer-events-none');
            } else {
                el.classList.add('opacity-50', 'pointer-events-none');
            }
        });
    }

    [enabledToggle, leaderboardEnabled, triviaEnabled, countingEnabled, countingChannel].forEach(el => {
        el.addEventListener('change', updateControlsState);
    });

    saveButton.addEventListener('click', async function() {
        const settings = {
            enabled: enabledToggle.checked,
            leaderboard: {
                enabled: leaderboardEnabled.checked,
                type: 'global'
            },
            categories: {
                trivia: { enabled: triviaEnabled.checked },
                counting: { 
                    enabled: countingEnabled.checked,
                    channelId: countingChannel.value
                }
            }
        };

        try {
            saveButton.disabled = true;
            saveButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Saving...';
            
            const response = await fetch('/api/games/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            
            const data = await response.json();
            if (data.success) {
                showToast('Games settings saved successfully', 'success');
            } else {
                showToast('Failed to save settings: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error saving games settings:', error);
            showToast('An error occurred while saving settings', 'error');
        } finally {
            saveButton.disabled = false;
            saveButton.innerHTML = '<i class="fas fa-save mr-2"></i> Save Settings';
        }
    });

    updateControlsState();
});

function showToast(message, type = 'success') {
    if (typeof window.showToast === 'function') {
        window.showToast(message, type);
    } else {
        alert(message);
    }
}
