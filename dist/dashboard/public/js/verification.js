document.addEventListener('DOMContentLoaded', function() {
    if (!window.location.pathname.includes('/verification')) return;

    const saveButton = document.getElementById('saveVerificationSettings');
    const enabledToggle = document.getElementById('verificationEnabled');

    function updateControlsState() {
        const controls = document.querySelectorAll('.verification-controls');
        controls.forEach(el => {
            if (enabledToggle.checked) {
                el.classList.remove('opacity-50', 'pointer-events-none');
            } else {
                el.classList.add('opacity-50', 'pointer-events-none');
            }
        });
    }

    enabledToggle.addEventListener('change', updateControlsState);

    saveButton.addEventListener('click', async function() {
        const settings = {
            enabled: enabledToggle.checked,
            roleId: document.getElementById('verificationRole').value,
            message: document.getElementById('verificationMessage').value,
            buttonLabel: document.getElementById('verificationButtonLabel').value
        };

        try {
            saveButton.disabled = true;
            saveButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Saving...';
            
            const response = await fetch('/api/verification/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            
            const data = await response.json();
            if (data.success) {
                showToast('Verification settings saved successfully', 'success');
            } else {
                showToast('Failed to save settings', 'error');
            }
        } catch (error) {
            console.error('Error saving verification settings:', error);
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
