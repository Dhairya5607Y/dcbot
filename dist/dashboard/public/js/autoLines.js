document.addEventListener('DOMContentLoaded', function() {
    if (!window.location.pathname.includes('/autolines')) return;

    const saveButton = document.getElementById('saveAutoLinesSettings');
    const enabledToggle = document.getElementById('autoLinesEnabled');
    const addChannelButton = document.getElementById('addAutoLineChannel');
    const channelsList = document.getElementById('autoLineChannelsList');

    function createChannelItem(ch = { channelId: '', interval: 60, messages: [] }) {
        const item = document.createElement('div');
        item.className = 'autoline-channel bg-gray-50 dark:bg-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600';
        
        let channelOptions = availableChannels.map(c => `<option value="${c.id}" ${ch.channelId === c.id ? 'selected' : ''}># ${c.name}</option>`).join('');
        
        item.innerHTML = `
            <div class="flex items-center justify-between mb-4">
                <div class="flex-1 mr-4">
                    <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Target Channel</label>
                    <select class="channel-id w-full bg-white dark:bg-gray-800 border-none text-sm rounded-lg focus:ring-teal-500">
                        ${channelOptions}
                    </select>
                </div>
                <div class="w-24 mr-4">
                    <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Interval (min)</label>
                    <input type="number" class="interval w-full bg-white dark:bg-gray-800 border-none text-sm rounded-lg focus:ring-teal-500" value="${ch.interval || 60}" min="1">
                </div>
                <button class="remove-autoline-channel text-red-500 hover:text-red-700 mt-5">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            
            <div>
                <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Messages (One per line)</label>
                <textarea class="messages-list w-full bg-white dark:bg-gray-800 border-none text-sm rounded-lg focus:ring-teal-500" rows="3" placeholder="Enter messages here...">${(ch.messages || []).join('\n')}</textarea>
                <p class="text-[10px] text-gray-500 mt-1">If multiple messages are provided, one will be chosen randomly.</p>
            </div>
        `;
        
        item.querySelector('.remove-autoline-channel').addEventListener('click', () => item.remove());
        return item;
    }

    addChannelButton.addEventListener('click', () => {
        channelsList.appendChild(createChannelItem());
    });

    // Initialize existing channels
    document.querySelectorAll('.autoline-channel').forEach(el => {
        el.querySelector('.remove-autoline-channel').addEventListener('click', () => el.remove());
    });

    function updateControlsState() {
        const controls = document.querySelectorAll('.autolines-controls');
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
        const channels = [];
        document.querySelectorAll('.autoline-channel').forEach(el => {
            channels.push({
                channelId: el.querySelector('.channel-id').value,
                interval: parseInt(el.querySelector('.interval').value) || 60,
                messages: el.querySelector('.messages-list').value.split('\n').map(m => m.trim()).filter(m => m)
            });
        });

        const settings = {
            enabled: enabledToggle.checked,
            channels: channels
        };

        try {
            saveButton.disabled = true;
            saveButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Saving...';
            
            const response = await fetch('/api/autolines/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            
            const data = await response.json();
            if (data.success) {
                showToast('Auto Lines settings saved successfully', 'success');
            } else {
                showToast('Failed to save settings: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error saving auto lines settings:', error);
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
