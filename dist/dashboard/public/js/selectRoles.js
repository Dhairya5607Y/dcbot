document.addEventListener('DOMContentLoaded', function() {
    if (!window.location.pathname.includes('/selectroles')) return;

    const saveButton = document.getElementById('saveSelectRolesSettings');
    const enabledToggle = document.getElementById('selectRolesEnabled');
    const addGroupButton = document.getElementById('addRoleGroup');
    const roleGroupsList = document.getElementById('roleGroupsList');

    function createRoleItem(role = { roleId: '', label: '', emoji: '' }) {
        const item = document.createElement('div');
        item.className = 'role-item flex items-center space-x-2 bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-600';
        
        let roleOptions = availableRoles.map(r => `<option value="${r.id}" ${role.roleId === r.id ? 'selected' : ''}>@ ${r.name}</option>`).join('');
        
        item.innerHTML = `
            <select class="role-id flex-1 bg-transparent border-none text-sm text-gray-800 dark:text-white focus:ring-0">
                ${roleOptions}
            </select>
            <input type="text" class="role-label w-24 bg-transparent border-none text-sm text-gray-800 dark:text-white focus:ring-0" value="${role.label}" placeholder="Label">
            <input type="text" class="role-emoji w-16 bg-transparent border-none text-sm text-gray-800 dark:text-white focus:ring-0" value="${role.emoji}" placeholder="Emoji">
            <button class="remove-role text-red-500 hover:text-red-700">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        item.querySelector('.remove-role').addEventListener('click', () => item.remove());
        return item;
    }

    function createRoleGroup(group = { name: '', roles: [] }) {
        const groupEl = document.createElement('div');
        groupEl.className = 'role-group bg-gray-50 dark:bg-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600';
        
        groupEl.innerHTML = `
            <div class="flex items-center justify-between mb-4">
                <input type="text" class="group-name bg-transparent border-none text-lg font-bold text-gray-800 dark:text-white focus:ring-0 p-0" value="${group.name}" placeholder="Group Name">
                <button class="remove-group text-red-500 hover:text-red-700">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="roles-list space-y-2"></div>
            <button class="add-role mt-4 w-full py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-white text-xs font-bold rounded-lg transition-colors">
                <i class="fas fa-plus mr-1"></i> Add Role
            </button>
        `;
        
        const rolesList = groupEl.querySelector('.roles-list');
        group.roles.forEach(role => rolesList.appendChild(createRoleItem(role)));
        
        groupEl.querySelector('.add-role').addEventListener('click', () => {
            rolesList.appendChild(createRoleItem());
        });
        
        groupEl.querySelector('.remove-group').addEventListener('click', () => groupEl.remove());
        
        return groupEl;
    }

    addGroupButton.addEventListener('click', () => {
        roleGroupsList.appendChild(createRoleGroup());
    });

    // Initialize existing groups
    document.querySelectorAll('.role-group').forEach(groupEl => {
        groupEl.querySelector('.add-role').addEventListener('click', () => {
            groupEl.querySelector('.roles-list').appendChild(createRoleItem());
        });
        groupEl.querySelector('.remove-group').addEventListener('click', () => groupEl.remove());
        groupEl.querySelectorAll('.remove-role').forEach(btn => {
            btn.addEventListener('click', () => btn.closest('.role-item').remove());
        });
    });

    saveButton.addEventListener('click', async function() {
        const groups = [];
        document.querySelectorAll('.role-group').forEach(groupEl => {
            const groupName = groupEl.querySelector('.group-name').value;
            const roles = [];
            groupEl.querySelectorAll('.role-item').forEach(roleEl => {
                roles.push({
                    roleId: roleEl.querySelector('.role-id').value,
                    label: roleEl.querySelector('.role-label').value,
                    emoji: roleEl.querySelector('.role-emoji').value
                });
            });
            groups.push({ name: groupName, roles });
        });

        const settings = {
            enabled: enabledToggle.checked,
            embed: {
                title: document.getElementById('selectRolesTitle').value,
                description: document.getElementById('selectRolesDescription').value,
                color: document.getElementById('selectRolesColor').value
            },
            groups: groups
        };

        try {
            saveButton.disabled = true;
            saveButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Saving...';
            
            const response = await fetch('/api/selectroles/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            
            const data = await response.json();
            if (data.success) {
                showToast('Role selection settings saved successfully', 'success');
            } else {
                showToast('Failed to save settings: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error saving select roles settings:', error);
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
