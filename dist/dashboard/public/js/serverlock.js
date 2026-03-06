document.addEventListener('DOMContentLoaded', function() {
    if (!window.location.pathname.includes('/serverlock')) return;

    const saveButton = document.getElementById('saveServerLockSettings');

    saveButton.addEventListener('click', async function() {
        const settings = {
            locked: document.getElementById('serverLocked').checked,
            maintenance: document.getElementById('maintenanceMode').checked
        };

        try {
            saveButton.disabled = true;
            saveButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Saving...';
            
            const response = await fetch('/api/serverlock/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            
            const data = await response.json();
            if (data.success) {
                showToast('Server lock settings saved successfully', 'success');
            } else {
                showToast('Failed to save settings', 'error');
            }
        } catch (error) {
            console.error('Error saving server lock settings:', error);
            showToast('An error occurred while saving settings', 'error');
        } finally {
            saveButton.disabled = false;
            saveButton.innerHTML = '<i class="fas fa-save mr-2"></i> Save Settings';
        }
    });
});

function showToast(message, type = 'success') {
    if (typeof window.showToast === 'function') {
        window.showToast(message, type);
    } else {
        alert(message);
    }
}
