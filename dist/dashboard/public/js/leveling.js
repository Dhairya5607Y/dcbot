document.addEventListener('DOMContentLoaded', function() {
    if (!window.location.pathname.includes('/leveling')) return;

    const saveButton = document.getElementById('saveLevelingSettings');
    const enabledToggle = document.getElementById('levelingEnabled');
    const announceToggle = document.getElementById('levelUpAnnounce');
    const addRewardButton = document.getElementById('addReward');
    const rewardsList = document.getElementById('rewardsList');

    function createRewardItem(reward = { level: 1, roleId: '' }) {
        const item = document.createElement('div');
        item.className = 'reward-item flex items-center space-x-4 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600';
        
        let roleOptions = availableRoles.map(r => `<option value="${r.id}" ${reward.roleId === r.id ? 'selected' : ''}>@ ${r.name}</option>`).join('');
        
        item.innerHTML = `
            <div class="w-24">
                <label class="block text-[10px] font-bold text-gray-500 uppercase">Level</label>
                <input type="number" class="reward-level w-full bg-white dark:bg-gray-800 border-none text-sm rounded-lg" value="${reward.level}" min="1">
            </div>
            <div class="flex-1">
                <label class="block text-[10px] font-bold text-gray-500 uppercase">Role Reward</label>
                <select class="reward-role-id w-full bg-white dark:bg-gray-800 border-none text-sm rounded-lg">
                    ${roleOptions}
                </select>
            </div>
            <button class="remove-reward text-red-500 hover:text-red-700 mt-4">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        item.querySelector('.remove-reward').addEventListener('click', () => item.remove());
        return item;
    }

    addRewardButton.addEventListener('click', () => {
        rewardsList.appendChild(createRewardItem());
    });

    // Initialize existing rewards
    document.querySelectorAll('.reward-item').forEach(el => {
        el.querySelector('.remove-reward').addEventListener('click', () => el.remove());
    });

    function updateControlsState() {
        const levelingControls = document.querySelectorAll('.leveling-controls');
        levelingControls.forEach(el => {
            if (enabledToggle.checked) {
                el.classList.remove('opacity-50', 'pointer-events-none');
            } else {
                el.classList.add('opacity-50', 'pointer-events-none');
            }
        });

        const announceControls = document.querySelector('.announcement-controls');
        if (announceToggle.checked && enabledToggle.checked) {
            announceControls.classList.remove('hidden');
        } else {
            announceControls.classList.add('hidden');
        }
    }

    enabledToggle.addEventListener('change', updateControlsState);
    announceToggle.addEventListener('change', updateControlsState);

    saveButton.addEventListener('click', async function() {
        const rewards = [];
        document.querySelectorAll('.reward-item').forEach(el => {
            rewards.push({
                level: parseInt(el.querySelector('.reward-level').value) || 1,
                roleId: el.querySelector('.reward-role-id').value
            });
        });

        const settings = {
            enabled: enabledToggle.checked,
            xpPerMessage: {
                min: parseInt(document.getElementById('xpMin').value) || 15,
                max: parseInt(document.getElementById('xpMax').value) || 25
            },
            cooldown: (parseInt(document.getElementById('xpCooldown').value) || 60) * 1000,
            rewards: rewards,
            ignoredChannels: Array.from(document.getElementById('ignoredChannels').selectedOptions).map(o => o.value),
            ignoredRoles: Array.from(document.getElementById('ignoredRoles').selectedOptions).map(o => o.value),
            announcement: {
                enabled: announceToggle.checked,
                channel: document.getElementById('announceChannel').value,
                message: document.getElementById('levelUpMessage').value
            }
        };

        try {
            saveButton.disabled = true;
            saveButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Saving...';
            
            const response = await fetch('/api/leveling/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            
            const data = await response.json();
            if (data.success) {
                showToast('Leveling settings saved successfully', 'success');
            } else {
                showToast('Failed to save settings: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error saving leveling settings:', error);
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
