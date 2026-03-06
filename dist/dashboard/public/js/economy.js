document.addEventListener('DOMContentLoaded', function() {
    if (!window.location.pathname.includes('/economy')) return;

    const saveButton = document.getElementById('saveEconomySettings');
    const enabledToggle = document.getElementById('economyEnabled');

    function updateControlsState() {
        const controls = document.querySelectorAll('.economy-controls');
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
            currency: document.getElementById('currencySymbol').value,
            dailyAmount: parseInt(document.getElementById('dailyAmount').value),
            workMin: parseInt(document.getElementById('workMin').value),
            workMax: parseInt(document.getElementById('workMax').value),
            crimeSuccessRate: parseInt(document.getElementById('crimeSuccessRate').value)
        };

        try {
            saveButton.disabled = true;
            saveButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Saving...';
            
            const response = await fetch('/api/economy/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            
            const data = await response.json();
            if (data.success) {
                showToast('Economy settings saved successfully', 'success');
            } else {
                showToast('Failed to save settings', 'error');
            }
        } catch (error) {
            console.error('Error saving economy settings:', error);
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
