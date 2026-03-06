document.addEventListener('DOMContentLoaded', function() {
    if (!window.location.pathname.includes('/automod')) return;

    const saveButton = document.getElementById('saveAutomodSettings');
    const enabledToggle = document.getElementById('automodEnabled');
    
    // Rule toggles and settings containers
    const rules = ['links', 'invites', 'mentions', 'badWords', 'caps'];

    function updateControlsState() {
        const automodControls = document.querySelectorAll('.automod-controls');
        automodControls.forEach(el => {
            if (enabledToggle.checked) {
                el.classList.remove('opacity-50', 'pointer-events-none');
            } else {
                el.classList.add('opacity-50', 'pointer-events-none');
            }
        });

        rules.forEach(ruleId => {
            const toggle = document.getElementById(`${ruleId}Enabled`);
            const settings = toggle.closest('.bg-white').querySelector('.rule-settings');
            if (toggle.checked && enabledToggle.checked) {
                settings.classList.remove('hidden');
            } else {
                settings.classList.add('hidden');
            }
        });
    }

    enabledToggle.addEventListener('change', updateControlsState);
    rules.forEach(ruleId => {
        document.getElementById(`${ruleId}Enabled`).addEventListener('change', updateControlsState);
    });

    saveButton.addEventListener('click', async function() {
        const settings = {
            enabled: enabledToggle.checked,
            rules: {}
        };

        rules.forEach(ruleId => {
            settings.rules[ruleId] = {
                enabled: document.getElementById(`${ruleId}Enabled`).checked,
                action: document.getElementById(`${ruleId}Action`).value
            };
            
            if (ruleId === 'mentions') {
                settings.rules[ruleId].limit = parseInt(document.getElementById('mentionsLimit').value) || 5;
            } else if (ruleId === 'badWords') {
                settings.rules[ruleId].words = document.getElementById('badWordsList').value.split(',').map(w => w.trim()).filter(w => w);
            } else if (ruleId === 'caps') {
                settings.rules[ruleId].limit = parseInt(document.getElementById('capsLimit').value) || 70;
            }
        });

        try {
            saveButton.disabled = true;
            saveButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Saving...';
            
            const response = await fetch('/api/automod/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            
            const data = await response.json();
            if (data.success) {
                showToast('AutoMod settings saved successfully', 'success');
            } else {
                showToast('Failed to save settings: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error saving automod settings:', error);
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
