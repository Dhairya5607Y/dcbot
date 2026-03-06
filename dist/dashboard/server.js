"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dashboard = void 0;
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const path_1 = __importDefault(require("path"));
const config_1 = __importDefault(require("../config"));
const fs_1 = require("fs");
const path_2 = require("path");
const express_ejs_layouts_1 = __importDefault(require("express-ejs-layouts"));
const discord_js_1 = require("discord.js");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
class Dashboard {
    constructor(client) {
        this.client = client;
        this.locales = {};
        this.app = (0, express_1.default)();
        this.startTime = new Date();
        this.loadLocales();
        this.setup();
        this.routes();
    }
    loadLocales() {
        try {
            const localesPath = path_1.default.join(__dirname, 'locales');
            this.locales = {
                en: JSON.parse((0, fs_1.readFileSync)(path_1.default.join(localesPath, 'en.json'), 'utf-8')),
            };
        }
        catch (error) {
            console.error('Error loading dashboard locales:', error);
        }
    }
    getLocale(lang = 'en') {
        return this.locales[lang] || this.locales['en'];
    }
    getUptime() {
        const now = new Date();
        const diff = now.getTime() - this.startTime.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        if (days > 0)
            return `${days}d ${hours}h ${minutes}m`;
        if (hours > 0)
            return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    }
    getPing() {
        return Math.round(this.client.ws.ping);
    }
    getBreadcrumbs(path) {
        const parts = path.split('/').filter(Boolean);
        if (parts.length === 0)
            return 'Dashboard';
        return parts.map((part, index) => {
            const isLast = index === parts.length - 1;
            const formattedPart = part.charAt(0).toUpperCase() + part.slice(1);
            return isLast ? formattedPart : `${formattedPart} /`;
        }).join(' ');
    }
    setup() {
        this.app.set('view engine', 'ejs');
        this.app.set('views', path_1.default.join(__dirname, 'views'));
        this.app.use(express_ejs_layouts_1.default);
        this.app.set('layout', 'layouts/main');
        this.app.set('layout extractScripts', true);
        this.app.set('layout extractStyles', true);
        this.app.use((req, res, next) => {
            res.locals = {
                ...res.locals,
                locale: this.getLocale(res.locals.currentLang),
                path: req.path,
                currentLang: res.locals.currentLang || 'en',
                title: 'Dashboard',
                renderPartial: (name) => {
                    try {
                        const partialPath = path_1.default.join(__dirname, 'views', 'partials', `${name}.ejs`);
                        return require('ejs').render(require('fs').readFileSync(partialPath, 'utf8'), res.locals);
                    }
                    catch (error) {
                        console.error(`Error rendering partial ${name}:`, error);
                        return `<div class="error">Error loading ${name}</div>`;
                    }
                }
            };
            next();
        });
        this.app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
        this.app.use((req, res, next) => {
            res.locals.path = req.path;
            next();
        });
        const isProduction = process.env.NODE_ENV === 'production';
        this.app.use((0, express_session_1.default)({
            secret: config_1.default.dashboard.secret,
            resave: false,
            saveUninitialized: false,
            cookie: { secure: isProduction }
        }));
        this.app.use(express_1.default.json());
        this.app.use((0, cookie_parser_1.default)());
        this.app.use((req, res, next) => {
            const lang = req.query.lang ||
                req.cookies?.preferredLanguage ||
                'en';
            const validLang = ['en'].includes(lang) ? lang : 'en';
            res.cookie('preferredLanguage', validLang, {
                maxAge: 365 * 24 * 60 * 60 * 1000,
                httpOnly: false,
                path: '/',
                secure: isProduction
            });
            res.locals.locale = this.getLocale(validLang);
            res.locals.currentLang = validLang;
            res.setHeader('Content-Language', validLang);
            next();
        });
        this.app.use((req, res, next) => {
            res.locals.ping = this.getPing();
            res.locals.uptime = this.getUptime();
            res.locals.path = req.path;
            res.locals.breadcrumbs = this.getBreadcrumbs(req.path);
            next();
        });
    }
    requireAuth(req, res, next) {
        if (!req.session.user) {
            return res.redirect('/auth/login');
        }
        res.locals.user = req.session.user;
        next();
    }
    async requireAdmin(req, res, next) {
        if (!req.session.user) {
            return res.redirect('/auth/login');
        }
        const guildId = req.params.guildId || req.query.guild || req.session.selectedGuild;
        if (!guildId) {
            return res.redirect('/dashboard');
        }
        const guild = this.client.guilds.cache.get(guildId);
        if (!guild) {
            return res.status(404).send('Guild not found or bot not in guild');
        }
        try {
            let member = guild.members.cache.get(req.session.user.id);
            if (!member) {
                member = await guild.members.fetch(req.session.user.id).catch(() => null);
            }
            if (!member || !member.permissions.has(discord_js_1.PermissionFlagsBits.Administrator)) {
                return res.status(403).send('You must be an administrator of this server');
            }
            res.locals.user = req.session.user;
            res.locals.guild = guild;
            next();
        }
        catch (error) {
            console.error('Error in requireAdmin:', error);
            res.status(500).send('Internal Server Error');
        }
    }
    async fetchDiscordUser(accessToken) {
        const response = await fetch('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        return await response.json();
    }
    async fetchUserGuilds(accessToken) {
        const response = await fetch('https://discord.com/api/users/@me/guilds', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        return await response.json();
    }
    routes() {
        this.app.get('/', async (req, res) => {
            if (req.session.user) {
                return res.redirect('/dashboard');
            }
            const currentLang = req.cookies?.preferredLanguage || 'en';
            const locale = this.getLocale(currentLang);
            
            try {
                const stats = await this.generateDashboardStats();
                const moduleStatus = this.getModuleStatus();
                const recentActivity = await this.getRecentActivity();
                const trends = {
                    servers: { percentage: 5, direction: 'up', period: 'week' },
                    users: { percentage: 12, direction: 'up', period: 'month' },
                    commands: { percentage: 8, direction: 'up', period: 'day' }
                };

                res.render('index', {
                    title: 'Home',
                    stats,
                    trends,
                    moduleStatus,
                    recentActivity,
                    settings: this.client.settings,
                    client: this.client,
                    config: config_1.default,
                    path: '/',
                    currentLang,
                    locale,
                    user: null,
                    breadcrumbs: this.getBreadcrumbs('/')
                });
            } catch (error) {
                console.error('Error rendering guest index:', error);
                res.status(500).send('Internal Server Error');
            }
        });

        this.app.get('/auth/login', (_req, res) => {
            const redirectUri = encodeURIComponent(config_1.default.dashboard.callbackUrl);
            const scope = encodeURIComponent('identify guilds');
            const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${config_1.default.clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
            res.redirect(authUrl);
        });
        this.app.get('/auth/callback', async (req, res) => {
            const code = req.query.code;
            if (!code) {
                return res.redirect('/');
            }
            try {
                const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: new URLSearchParams({
                        client_id: config_1.default.clientId,
                        client_secret: config_1.default.dashboard.clientSecret,
                        grant_type: 'authorization_code',
                        code: code,
                        redirect_uri: config_1.default.dashboard.callbackUrl
                    })
                });
                const tokenData = await tokenResponse.json();
                if (!tokenData.access_token) {
                    console.error('OAuth error:', tokenData);
                    return res.redirect('/');
                }
                const user = await this.fetchDiscordUser(tokenData.access_token);
                const guilds = await this.fetchUserGuilds(tokenData.access_token);
                const botGuilds = this.client.guilds.cache.map(g => g.id);
                const mutualGuilds = guilds.filter(g => botGuilds.includes(g.id) && (parseInt(g.permissions) & 0x8) === 0x8);
                req.session.user = {
                    id: user.id,
                    username: user.username,
                    discriminator: user.discriminator,
                    avatar: user.avatar,
                    guilds: mutualGuilds
                };
                req.session.accessToken = tokenData.access_token;
                if (mutualGuilds.length > 0) {
                    req.session.selectedGuild = mutualGuilds[0].id;
                }
                res.redirect('/dashboard');
            }
            catch (error) {
                console.error('OAuth callback error:', error);
                res.redirect('/');
            }
        });
        this.app.get('/auth/logout', (req, res) => {
            req.session.destroy(() => {
                res.redirect('/');
            });
        });
        this.app.get('/dashboard', this.requireAuth.bind(this), async (req, res) => {
            const currentLang = req.cookies?.preferredLanguage || 'en';
            const locale = this.getLocale(currentLang);
            try {
                const userGuilds = req.session.user.guilds || [];
                res.render('dashboard-select', {
                    title: 'Select Server',
                    user: req.session.user,
                    guilds: userGuilds,
                    currentLang,
                    locale,
                    path: '/dashboard'
                });
            }
            catch (error) {
                console.error('Error rendering dashboard:', error);
                res.status(500).send('Internal Server Error');
            }
        });
        this.app.get('/dashboard/:guildId', this.requireAdmin.bind(this), async (req, res) => {
            const currentLang = req.cookies?.preferredLanguage || 'en';
            const locale = this.getLocale(currentLang);
            const guild = res.locals.guild;
            
            try {
                req.session.selectedGuild = req.params.guildId;
                const stats = await this.generateDashboardStats();
                const moduleStatus = this.getModuleStatus();
                const recentActivity = await this.getRecentActivity();
                const trends = {
                    servers: { percentage: 5, direction: 'up', period: 'week' },
                    users: { percentage: 12, direction: 'up', period: 'month' },
                    commands: { percentage: 8, direction: 'up', period: 'day' }
                };
                
                return res.render('index', {
                    title: locale.dashboard.title,
                    stats,
                    trends,
                    moduleStatus,
                    recentActivity,
                    settings: this.client.settings,
                    client: this.client,
                    config: config_1.default,
                    path: `/dashboard/${req.params.guildId}`,
                    currentLang,
                    locale,
                    user: req.session.user,
                    guild: res.locals.guild,
                    breadcrumbs: this.getBreadcrumbs(`/dashboard/${req.params.guildId}`)
                });
            }
            catch (error) {
                console.error('Error rendering guild dashboard:', error);
                res.status(500).send('Internal Server Error');
            }
        });
        this.app.get('/', (req, res) => {
            if (req.session.user) {
                return res.redirect('/dashboard');
            }
            const currentLang = req.cookies?.preferredLanguage || 'en';
            const locale = this.getLocale(currentLang);
            res.render('index', {
                title: 'Home',
                user: null,
                currentLang,
                locale,
                path: '/'
            });
        });
        this.app.get('/docs', (_req, res) => {
            try {
                const currentLang = _req.cookies?.preferredLanguage || 'en';
                const locale = this.getLocale(currentLang);
                return res.render('docs', {
                    page: 'docs',
                    title: locale.docs.title || 'Documentation',
                    settings: this.client.settings,
                    client: this.client,
                    config: config_1.default,
                    path: '/docs',
                    currentLang,
                    locale,
                    breadcrumbs: this.getBreadcrumbs('/docs')
                });
            }
            catch (error) {
                console.error('Error rendering documentation page:', error);
                return res.status(500).render('error', {
                    page: 'error',
                    title: 'Error',
                    error: { code: 500, message: 'Internal Server Error' },
                    currentLang: 'en',
                    locale: this.getLocale('en'),
                    path: '/docs'
                });
            }
        });
        this.app.get('/settings', this.requireAdmin.bind(this), async (req, res) => {
            const currentLang = req.cookies?.preferredLanguage || 'en';
            const locale = this.getLocale(currentLang);
            try {
                return res.render('settings', {
                    title: locale.dashboard.settings?.title || 'Bot Settings',
                    settings: this.client.settings,
                    client: this.client,
                    config: config_1.default,
                    path: '/settings',
                    currentLang,
                    locale,
                    user: req.session.user,
                    guild: res.locals.guild,
                    breadcrumbs: this.getBreadcrumbs('/settings')
                });
            }
            catch (error) {
                console.error('Error rendering settings page:', error);
                return res.status(500).render('error', {
                    title: 'Error',
                    error: { code: 500, message: 'Internal Server Error' },
                    currentLang,
                    locale
                });
            }
        });
        this.app.get('/commands', this.requireAdmin.bind(this), (req, res) => {
            const currentLang = req.cookies?.preferredLanguage || 'en';
            const locale = this.getLocale(currentLang);
            const categories = [
                {
                    id: 'general',
                    name: locale.dashboard.commands.general,
                    icon: 'users',
                    color: 'blue'
                },
                {
                    id: 'moderation',
                    name: locale.dashboard.commands.moderation,
                    icon: 'shield-alt',
                    color: 'purple'
                },
                {
                    id: 'utility',
                    name: locale.dashboard.commands.utility || 'Utility',
                    icon: 'tools',
                    color: 'green'
                }
            ];
            res.render('command-categories', {
                title: locale.dashboard.commands.title,
                categories,
                path: '/commands',
                currentLang,
                locale,
                user: req.session.user,
                guild: res.locals.guild,
                breadcrumbs: this.getBreadcrumbs('/commands')
            });
        });
        this.app.get('/commands/general', this.requireAdmin.bind(this), (req, res) => {
            const generalCommands = ['avatar', 'banner', 'ping', 'roles', 'server', 'user'].map(cmd => ({
                name: cmd,
                description: res.locals.locale.dashboard.commandDescriptions[cmd] || `${cmd} command`,
                enabled: this.client.settings.commands[cmd]?.enabled ?? false,
                aliases: this.client.settings.commands[cmd]?.aliases ?? [],
                cooldown: this.client.settings.commands[cmd]?.cooldown ?? 5
            }));
            res.render('commands', {
                title: res.locals.locale.dashboard.commands.general,
                page: 'general',
                commands: generalCommands,
                user: req.session.user,
                guild: res.locals.guild,
                roles: this.client.guilds.cache.first()?.roles.cache.map(role => ({
                    id: role.id,
                    name: role.name
                })) ?? []
            });
        });
        this.app.get('/commands/moderation', this.requireAdmin.bind(this), (req, res) => {
            const modCommands = ['ban', 'kick', 'mute', 'unmute', 'warn', 'unwarn', 'clear', 'lock', 'unlock', 'hide', 'unhide', 'move', 'timeout', 'rtimeout'].map(cmd => ({
                name: cmd,
                description: res.locals.locale.dashboard.commandDescriptions[cmd] || `${cmd} command`,
                enabled: this.client.settings.commands[cmd]?.enabled ?? false,
                aliases: this.client.settings.commands[cmd]?.aliases ?? [],
                cooldown: this.client.settings.commands[cmd]?.cooldown ?? 5
            }));
            res.render('commands', {
                title: res.locals.locale.dashboard.commands.moderation,
                page: 'moderation',
                commands: modCommands,
                user: req.session.user,
                guild: res.locals.guild,
                roles: this.client.guilds.cache.first()?.roles.cache.map(role => ({
                    id: role.id,
                    name: role.name
                })) ?? []
            });
        });
        this.app.get('/commands/utility', this.requireAdmin.bind(this), (req, res) => {
            const utilityCommands = ['setnick', 'role', 'rrole', 'warns', 'apply', 'ticket', 'unban'].map(cmd => ({
                name: cmd,
                description: res.locals.locale.dashboard.commandDescriptions[cmd] || `${cmd} command`,
                enabled: this.client.settings.commands[cmd]?.enabled ?? false,
                aliases: this.client.settings.commands[cmd]?.aliases ?? [],
                cooldown: this.client.settings.commands[cmd]?.cooldown ?? 5
            }));
            res.render('commands', {
                title: res.locals.locale.dashboard.commands.utility || 'Utility Commands',
                page: 'utility',
                commands: utilityCommands,
                user: req.session.user,
                guild: res.locals.guild,
                roles: this.client.guilds.cache.first()?.roles.cache.map(role => ({
                    id: role.id,
                    name: role.name
                })) ?? []
            });
        });
        this.app.post('/api/commands/toggle', this.requireAdmin.bind(this), async (req, res) => {
            try {
                const { command, enabled } = req.body;
                console.log('Toggling command:', command, enabled);
                if (!command) {
                    return res.status(400).json({ error: 'Command name is required' });
                }
                const settingsPath = (0, path_2.join)(process.cwd(), 'settings.json');
                let currentSettings = JSON.parse((0, fs_1.readFileSync)(settingsPath, 'utf8'));
                if (!currentSettings.commands[command]) {
                    currentSettings.commands[command] = {
                        enabled: enabled,
                        aliases: [],
                        cooldown: 5,
                        permissions: {
                            enabledRoleIds: [],
                            disabledRoleIds: []
                        }
                    };
                }
                else {
                    currentSettings.commands[command].enabled = enabled;
                }
                (0, fs_1.writeFileSync)(settingsPath, JSON.stringify(currentSettings, null, 4), 'utf8');
                currentSettings = JSON.parse((0, fs_1.readFileSync)(settingsPath, 'utf8'));
                this.client.settings = currentSettings;
                const verifySettings = JSON.parse((0, fs_1.readFileSync)(settingsPath, 'utf8'));
                console.log('Verified settings update:', {
                    command,
                    enabled: verifySettings.commands[command].enabled,
                    fileContent: verifySettings.commands[command]
                });
                return res.json({
                    success: true,
                    command,
                    enabled,
                    settings: verifySettings.commands[command]
                });
            }
            catch (error) {
                console.error('Error toggling command:', error);
                return res.status(500).json({ error: 'Failed to toggle command' });
            }
        });
        this.app.get('/api/commands/:command/permissions', this.requireAdmin.bind(this), (req, res) => {
            try {
                const command = req.params.command;
                if (!this.client.settings.commands[command]) {
                    return res.status(404).json({ error: 'Command not found' });
                }
                const permissions = this.client.settings.commands[command]?.permissions ?? {
                    enabledRoleIds: [],
                    disabledRoleIds: []
                };
                return res.json(permissions);
            }
            catch (error) {
                console.error('Error getting permissions:', error);
                return res.status(500).json({ error: 'Failed to get permissions' });
            }
        });
        this.app.post('/api/commands/:command/permissions', this.requireAdmin.bind(this), async (req, res) => {
            try {
                const { command } = req.params;
                const { enabledRoleIds, disabledRoleIds } = req.body;
                if (!this.client.settings.commands[command]) {
                    return res.status(404).json({ error: 'Command not found' });
                }
                this.client.settings.commands[command].permissions = {
                    enabledRoleIds,
                    disabledRoleIds
                };
                await this.saveSettings();
                return res.json({ success: true });
            }
            catch (error) {
                console.error('Error updating permissions:', error);
                return res.status(500).json({ error: 'Failed to update permissions' });
            }
        });
        this.app.post('/api/commands/:command/update', this.requireAdmin.bind(this), async (req, res) => {
            try {
                const { command } = req.params;
                const settings = req.body;
                if (!this.client.settings.commands[command]) {
                    return res.status(404).json({ error: 'Command not found' });
                }
                this.client.settings.commands[command] = {
                    ...this.client.settings.commands[command],
                    ...settings
                };
                await this.saveSettings();
                return res.json({ success: true });
            }
            catch (error) {
                console.error('Error updating command settings:', error);
                return res.status(500).json({ error: 'Failed to update command settings' });
            }
        });
        this.app.get('/api/roles', this.requireAdmin.bind(this), async (req, res) => {
            try {
                const guild = res.locals.guild;
                if (!guild) {
                    return res.status(404).json({ error: 'Guild not found' });
                }
                const roles = guild.roles.cache
                    .filter(role => role.id !== guild.id)
                    .sort((a, b) => b.position - a.position)
                    .map(role => ({
                    id: role.id,
                    name: role.name,
                    color: role.color,
                    position: role.position
                }));
                return res.json(roles);
            }
            catch (error) {
                console.error('Error fetching roles:', error);
                return res.status(500).json({ error: 'Failed to fetch roles' });
            }
        });
        this.app.get('/api/commands/:command/settings', this.requireAdmin.bind(this), async (req, res) => {
            try {
                const { command } = req.params;
                const settingsPath = (0, path_2.join)(process.cwd(), 'settings.json');
                const currentSettings = JSON.parse((0, fs_1.readFileSync)(settingsPath, 'utf8'));
                if (!currentSettings.commands[command]) {
                    return res.status(404).json({ error: 'Command not found' });
                }
                return res.json(currentSettings.commands[command]);
            }
            catch (error) {
                console.error('Error fetching command settings:', error);
                return res.status(500).json({ error: 'Failed to fetch command settings' });
            }
        });
        this.app.post('/api/commands/:command/settings', this.requireAdmin.bind(this), async (req, res) => {
            try {
                const { command } = req.params;
                const { aliases, permissions } = req.body;
                const settingsPath = (0, path_2.join)(process.cwd(), 'settings.json');
                let currentSettings = JSON.parse((0, fs_1.readFileSync)(settingsPath, 'utf8'));
                if (!currentSettings.commands[command]) {
                    return res.status(404).json({ error: 'Command not found' });
                }
                currentSettings.commands[command] = {
                    ...currentSettings.commands[command],
                    aliases: aliases || [],
                    permissions: {
                        enabledRoleIds: permissions?.enabledRoleIds || [],
                        disabledRoleIds: permissions?.disabledRoleIds || []
                    }
                };
                (0, fs_1.writeFileSync)(settingsPath, JSON.stringify(currentSettings, null, 4), 'utf8');
                currentSettings = JSON.parse((0, fs_1.readFileSync)(settingsPath, 'utf8'));
                this.client.settings = currentSettings;
                return res.json({
                    success: true,
                    settings: currentSettings.commands[command]
                });
            }
            catch (error) {
                console.error('Error saving command settings:', error);
                return res.status(500).json({ error: 'Failed to save command settings' });
            }
        });
        this.app.get('/api/channels', this.requireAdmin.bind(this), async (req, res) => {
            try {
                const guild = res.locals.guild;
                if (!guild) {
                    return res.status(404).json({ error: 'Guild not found' });
                }
                const channels = guild.channels.cache
                    .filter(channel => channel.type === 0)
                    .map(channel => ({
                    id: channel.id,
                    name: channel.name,
                    type: channel.type
                }));
                return res.json(channels);
            }
            catch (error) {
                console.error('Error fetching channels:', error);
                return res.status(500).json({ error: 'Failed to fetch channels' });
            }
        });
        this.app.get('/logs', this.requireAdmin.bind(this), (req, res) => {
            const currentLang = req.cookies?.preferredLanguage || 'en';
            const locale = this.getLocale(currentLang);
            try {
                const guild = res.locals.guild;
                const channels = guild.channels.cache
                    .filter(channel => channel.type === 0)
                    .map(channel => ({
                    id: channel.id,
                    name: channel.name
                }));
                return res.render('logs', {
                    title: locale.dashboard.logs.title,
                    settings: this.client.settings,
                    channels,
                    path: '/logs',
                    currentLang,
                    locale,
                    user: req.session.user,
                    guild: res.locals.guild,
                    breadcrumbs: this.getBreadcrumbs('/logs')
                });
            }
            catch (error) {
                console.error('Error rendering logs page:', error);
                return res.status(500).render('error', {
                    title: 'Error',
                    error: { code: 500, message: 'Internal Server Error' },
                    currentLang,
                    locale,
                    path: '/logs'
                });
            }
        });
        this.app.post('/api/logs/update', this.requireAdmin.bind(this), async (req, res) => {
            try {
                const { logType, settings } = req.body;
                if (!logType || !settings) {
                    return res.status(400).json({ error: 'Missing required parameters' });
                }
                const settingsPath = (0, path_2.join)(process.cwd(), 'settings.json');
                let currentSettings = JSON.parse((0, fs_1.readFileSync)(settingsPath, 'utf8'));
                if (!currentSettings.logs[logType]) {
                    return res.status(404).json({ error: 'Log type not found' });
                }
                currentSettings.logs[logType] = {
                    ...currentSettings.logs[logType],
                    ...settings
                };
                (0, fs_1.writeFileSync)(settingsPath, JSON.stringify(currentSettings, null, 4), 'utf8');
                this.client.settings = currentSettings;
                return res.json({
                    success: true,
                    settings: currentSettings.logs[logType]
                });
            }
            catch (error) {
                console.error('Error updating log settings:', error);
                return res.status(500).json({ error: 'Failed to update log settings' });
            }
        });
        this.app.get('/protection', this.requireAdmin.bind(this), async (req, res) => {
            try {
                const guild = res.locals.guild;
                const channels = guild.channels.cache
                    .filter(channel => channel.type === 0)
                    .map(channel => ({
                    id: channel.id,
                    name: channel.name
                }));
                const roles = guild.roles.cache
                    .filter(role => role.id !== guild.id)
                    .sort((a, b) => b.position - a.position)
                    .map(role => ({
                    id: role.id,
                    name: role.name,
                    color: role.hexColor
                }));
                res.render('protection', {
                    title: res.locals.locale.dashboard.protection.title,
                    settings: this.client.settings,
                    channels: channels,
                    roles: roles,
                    user: req.session.user,
                    guild: res.locals.guild,
                    path: '/protection'
                });
            }
            catch (error) {
                console.error('Error rendering protection page:', error);
                res.status(500).render('error', {
                    title: '500 - Server Error',
                    error: { code: 500, message: 'Internal server error' }
                });
            }
        });
        this.app.post('/api/protection/settings', this.requireAdmin.bind(this), async (req, res) => {
            try {
                const settings = req.body;
                const settingsPath = (0, path_2.join)(process.cwd(), 'settings.json');
                let currentSettings = JSON.parse((0, fs_1.readFileSync)(settingsPath, 'utf8'));
                currentSettings.protection = {
                    ...currentSettings.protection,
                    ...settings
                };
                (0, fs_1.writeFileSync)(settingsPath, JSON.stringify(currentSettings, null, 4), 'utf8');
                this.client.settings = currentSettings;
                return res.json({ success: true });
            }
            catch (error) {
                console.error('Error saving protection settings:', error);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to save protection settings'
                });
            }
        });
        this.app.post('/api/protection/update', this.requireAdmin.bind(this), async (req, res) => {
            try {
                const { section, settings } = req.body;
                if (!section || !settings) {
                    return res.status(400).json({ error: 'Missing required parameters' });
                }
                const settingsPath = (0, path_2.join)(process.cwd(), 'settings.json');
                let currentSettings = JSON.parse((0, fs_1.readFileSync)(settingsPath, 'utf8'));
                if (!currentSettings.protection) {
                    currentSettings.protection = {};
                }
                if (!currentSettings.protection[section]) {
                    currentSettings.protection[section] = {};
                }
                currentSettings.protection[section] = {
                    ...currentSettings.protection[section],
                    ...settings
                };
                (0, fs_1.writeFileSync)(settingsPath, JSON.stringify(currentSettings, null, 4), 'utf8');
                this.client.settings = currentSettings;
                return res.json({
                    success: true,
                    settings: currentSettings.protection[section]
                });
            }
            catch (error) {
                console.error('Error updating protection settings:', error);
                return res.status(500).json({ error: 'Failed to update protection settings' });
            }
        });
        this.app.get('/tickets', this.requireAdmin.bind(this), async (req, res) => {
            const currentLang = req.cookies?.preferredLanguage || 'en';
            const locale = this.getLocale(currentLang);
            try {
                const guild = res.locals.guild;
                const channels = guild.channels.cache
                    .filter(channel => channel.type === discord_js_1.ChannelType.GuildText)
                    .map(channel => ({
                    id: channel.id,
                    name: channel.name
                }));
                const categories = guild.channels.cache
                    .filter(channel => channel.type === discord_js_1.ChannelType.GuildCategory)
                    .map(channel => ({
                    id: channel.id,
                    name: channel.name
                }));
                const roles = guild.roles.cache
                    .filter(role => role.id !== guild.id)
                    .sort((a, b) => b.position - a.position)
                    .map(role => ({
                    id: role.id,
                    name: role.name,
                    color: role.hexColor || '#ffffff'
                }));
                return res.render('tickets', {
                    title: locale.dashboard.tickets.title,
                    settings: this.client.settings,
                    channels,
                    categories,
                    roles,
                    path: '/tickets',
                    currentLang,
                    user: req.session.user,
                    guild: res.locals.guild,
                    locale,
                    breadcrumbs: this.getBreadcrumbs('/tickets')
                });
            }
            catch (error) {
                console.error('Error rendering tickets page:', error);
                return res.status(500).render('error', {
                    title: 'Error',
                    error: { code: 500, message: 'Internal Server Error' },
                    currentLang,
                    locale,
                    path: '/tickets'
                });
            }
        });
        this.app.post('/api/tickets/settings', this.requireAdmin.bind(this), async (req, res) => {
            try {
                const settings = req.body;
                if (settings.embed) {
                    if (settings.embed.thumbnail === '')
                        settings.embed.thumbnail = null;
                    if (settings.embed.footerIcon === '')
                        settings.embed.footerIcon = null;
                }
                if (settings.sections && Array.isArray(settings.sections)) {
                    settings.sections.forEach((section) => {
                        if (section.imageUrl === '')
                            section.imageUrl = null;
                    });
                }
                const settingsPath = (0, path_2.join)(process.cwd(), 'settings.json');
                let currentSettings = JSON.parse((0, fs_1.readFileSync)(settingsPath, 'utf8'));
                currentSettings.ticket = {
                    ...currentSettings.ticket,
                    ...settings
                };
                (0, fs_1.writeFileSync)(settingsPath, JSON.stringify(currentSettings, null, 4), 'utf8');
                this.client.settings = currentSettings;
                return res.json({
                    success: true,
                    settings: currentSettings.ticket
                });
            }
            catch (error) {
                console.error('Error saving ticket settings:', error);
                return res.status(500).json({ error: 'Failed to save ticket settings' });
            }
        });
        this.app.get('/api/tickets/:section/settings', this.requireAdmin.bind(this), async (req, res) => {
            try {
                const { section } = req.params;
                const settingsPath = (0, path_2.join)(process.cwd(), 'settings.json');
                const currentSettings = JSON.parse((0, fs_1.readFileSync)(settingsPath, 'utf8'));
                if (!currentSettings.ticket.sections[section]) {
                    return res.status(404).json({ error: 'Section not found' });
                }
                return res.json(currentSettings.ticket.sections[section]);
            }
            catch (error) {
                console.error('Error fetching ticket section settings:', error);
                return res.status(500).json({ error: 'Failed to fetch section settings' });
            }
        });
        this.app.post('/api/tickets/:section/settings', this.requireAdmin.bind(this), async (req, res) => {
            try {
                const { section } = req.params;
                const settings = req.body;
                const settingsPath = (0, path_2.join)(process.cwd(), 'settings.json');
                let currentSettings = JSON.parse((0, fs_1.readFileSync)(settingsPath, 'utf8'));
                if (!currentSettings.ticket.sections[section]) {
                    return res.status(404).json({ error: 'Section not found' });
                }
                currentSettings.ticket.sections[section] = {
                    ...currentSettings.ticket.sections[section],
                    ...settings
                };
                (0, fs_1.writeFileSync)(settingsPath, JSON.stringify(currentSettings, null, 4), 'utf8');
                this.client.settings = currentSettings;
                return res.json({
                    success: true,
                    settings: currentSettings.ticket.sections[section]
                });
            }
            catch (error) {
                console.error('Error updating ticket section settings:', error);
                return res.status(500).json({ error: 'Failed to update section settings' });
            }
        });
        this.app.post('/api/tickets/sections/add', this.requireAdmin.bind(this), async (req, res) => {
            try {
                const newSection = req.body;
                if (newSection.imageUrl === '') {
                    newSection.imageUrl = null;
                }
                const settingsPath = (0, path_2.join)(process.cwd(), 'settings.json');
                let currentSettings = JSON.parse((0, fs_1.readFileSync)(settingsPath, 'utf8'));
                currentSettings.ticket.sections.push(newSection);
                (0, fs_1.writeFileSync)(settingsPath, JSON.stringify(currentSettings, null, 4), 'utf8');
                this.client.settings = currentSettings;
                return res.json({
                    success: true,
                    section: newSection
                });
            }
            catch (error) {
                console.error('Error adding ticket section:', error);
                return res.status(500).json({ error: 'Failed to add ticket section' });
            }
        });
        this.app.delete('/api/tickets/sections/:index', async (req, res) => {
            try {
                const { index } = req.params;
                const settingsPath = (0, path_2.join)(process.cwd(), 'settings.json');
                let currentSettings = JSON.parse((0, fs_1.readFileSync)(settingsPath, 'utf8'));
                if (!currentSettings.ticket.sections[index]) {
                    return res.status(404).json({ error: 'Section not found' });
                }
                currentSettings.ticket.sections.splice(parseInt(index), 1);
                (0, fs_1.writeFileSync)(settingsPath, JSON.stringify(currentSettings, null, 4), 'utf8');
                this.client.settings = currentSettings;
                return res.json({ success: true });
            }
            catch (error) {
                console.error('Error deleting ticket section:', error);
                return res.status(500).json({ error: 'Failed to delete ticket section' });
            }
        });
        this.app.get('/apply', this.requireAdmin.bind(this), async (req, res) => {
            try {
                const guild = res.locals.guild;
                if (!guild) {
                    return res.status(404).render('error', {
                        title: '404 - Not Found',
                        error: { code: 404, message: 'Guild not found' }
                    });
                }
                const channels = guild.channels.cache
                    .filter(channel => channel.type === discord_js_1.ChannelType.GuildText)
                    .map(channel => ({
                    id: channel.id,
                    name: channel.name
                }));
                const roles = guild.roles.cache
                    .filter(role => role.id !== guild.id)
                    .sort((a, b) => b.position - a.position)
                    .map(role => ({
                    id: role.id,
                    name: role.name,
                    color: role.hexColor,
                    position: role.position
                }));
                res.render('apply', {
                    title: res.locals.locale.dashboard.apply.title,
                    settings: this.client.settings,
                    channels,
                    roles,
                    path: '/apply'
                });
            }
            catch (error) {
                console.error('Error rendering apply page:', error);
                res.status(500).render('error', {
                    title: '500 - Server Error',
                    error: { code: 500, message: 'Internal server error' }
                });
            }
        });
        this.app.get('/api/apply/settings', this.requireAdmin.bind(this), async (_req, res) => {
            try {
                const settingsPath = (0, path_2.join)(process.cwd(), 'settings.json');
                const currentSettings = JSON.parse((0, fs_1.readFileSync)(settingsPath, 'utf8'));
                return res.json(currentSettings.apply || {
                    enabled: false,
                    embed: {
                        color: "#3498db",
                        thumbnail: "",
                        footer: "Powered by LR7",
                        footerIcon: "",
                        timestamp: true
                    },
                    positions: []
                });
            }
            catch (error) {
                console.error('Error fetching apply settings:', error);
                return res.status(500).json({ error: 'Failed to fetch apply settings' });
            }
        });
        this.app.post('/api/apply/settings', this.requireAdmin.bind(this), async (req, res) => {
            try {
                const settings = req.body;
                const settingsPath = (0, path_2.join)(process.cwd(), 'settings.json');
                let currentSettings = JSON.parse((0, fs_1.readFileSync)(settingsPath, 'utf8'));
                currentSettings.apply = {
                    ...currentSettings.apply,
                    ...settings
                };
                (0, fs_1.writeFileSync)(settingsPath, JSON.stringify(currentSettings, null, 4), 'utf8');
                this.client.settings = currentSettings;
                return res.json({
                    success: true,
                    settings: currentSettings.apply
                });
            }
            catch (error) {
                console.error('Error saving apply settings:', error);
                return res.status(500).json({ error: 'Failed to save apply settings' });
            }
        });
        this.app.delete('/api/apply/positions/:index', async (req, res) => {
            try {
                const { index } = req.params;
                const settingsPath = (0, path_2.join)(process.cwd(), 'settings.json');
                let currentSettings = JSON.parse((0, fs_1.readFileSync)(settingsPath, 'utf8'));
                if (!currentSettings.apply?.positions[index]) {
                    return res.status(404).json({ error: 'Position not found' });
                }
                currentSettings.apply.positions.splice(parseInt(index), 1);
                (0, fs_1.writeFileSync)(settingsPath, JSON.stringify(currentSettings, null, 4), 'utf8');
                this.client.settings = currentSettings;
                return res.json({ success: true });
            }
            catch (error) {
                console.error('Error deleting position:', error);
                return res.status(500).json({ error: 'Failed to delete position' });
            }
        });
        this.app.post('/api/apply/positions/add', this.requireAdmin.bind(this), async (req, res) => {
            try {
                const newPosition = req.body;
                const settingsPath = (0, path_2.join)(process.cwd(), 'settings.json');
                let currentSettings = JSON.parse((0, fs_1.readFileSync)(settingsPath, 'utf8'));
                if (!currentSettings.apply) {
                    currentSettings.apply = {
                        enabled: false,
                        embed: {
                            color: "#3498db",
                            thumbnail: "",
                            footer: "Powered by LR7",
                            footerIcon: "",
                            timestamp: true
                        },
                        positions: []
                    };
                }
                currentSettings.apply.positions.push(newPosition);
                (0, fs_1.writeFileSync)(settingsPath, JSON.stringify(currentSettings, null, 4), 'utf8');
                this.client.settings = currentSettings;
                return res.json({
                    success: true,
                    position: newPosition
                });
            }
            catch (error) {
                console.error('Error adding position:', error);
                return res.status(500).json({ error: 'Failed to add position' });
            }
        });
        this.app.get('/rules', this.requireAdmin.bind(this), async (req, res) => {
            try {
                res.render('rules', {
                    title: res.locals.locale.dashboard.rules.title,
                    settings: this.client.settings,
                    path: '/rules',
                    script: `<script>
                        window.settings = ${JSON.stringify(this.client.settings)};
                        console.log('Settings loaded:', window.settings);
                    </script>`
                });
            }
            catch (error) {
                console.error('Error rendering rules page:', error);
                res.status(500).render('error', {
                    title: '500 - Server Error',
                    error: { code: 500, message: 'Internal server error' }
                });
            }
        });
        this.app.post('/api/rules/settings', this.requireAdmin.bind(this), async (req, res) => {
            try {
                const settings = req.body;
                const settingsPath = (0, path_2.join)(process.cwd(), 'settings.json');
                let currentSettings = JSON.parse((0, fs_1.readFileSync)(settingsPath, 'utf8'));
                currentSettings.rules = {
                    ...currentSettings.rules,
                    ...settings
                };
                (0, fs_1.writeFileSync)(settingsPath, JSON.stringify(currentSettings, null, 4), 'utf8');
                this.client.settings = currentSettings;
                return res.json({
                    success: true,
                    settings: currentSettings.rules
                });
            }
            catch (error) {
                console.error('Error saving rules settings:', error);
                return res.status(500).json({ error: 'Failed to save rules settings' });
            }
        });
        this.app.get('/giveaway', this.requireAdmin.bind(this), async (req, res) => {
            try {
                const guild = res.locals.guild;
                if (!guild) {
                    return res.status(404).render('error', {
                        title: '404 - Not Found',
                        error: { code: 404, message: 'Guild not found' }
                    });
                }
                const channels = guild.channels.cache
                    .filter(channel => channel.type === discord_js_1.ChannelType.GuildText)
                    .map(channel => ({
                    id: channel.id,
                    name: channel.name
                }));
                const roles = guild.roles.cache
                    .filter(role => role.id !== guild.id)
                    .sort((a, b) => b.position - a.position)
                    .map(role => ({
                    id: role.id,
                    name: role.name,
                    color: role.hexColor
                }));
                res.render('giveaway', {
                    title: res.locals.locale.dashboard.giveaway.title,
                    settings: this.client.settings,
                    channels,
                    roles,
                    path: '/giveaway'
                });
            }
            catch (error) {
                console.error('Error rendering giveaway page:', error);
                res.status(500).render('error', {
                    title: '500 - Server Error',
                    error: { code: 500, message: 'Internal server error' }
                });
            }
        });
        this.app.post('/api/giveaway/settings', this.requireAdmin.bind(this), async (req, res) => {
            try {
                const settings = req.body;
                const settingsPath = (0, path_2.join)(process.cwd(), 'settings.json');
                let currentSettings = JSON.parse((0, fs_1.readFileSync)(settingsPath, 'utf8'));
                currentSettings.giveaway = {
                    ...currentSettings.giveaway,
                    ...settings
                };
                (0, fs_1.writeFileSync)(settingsPath, JSON.stringify(currentSettings, null, 4), 'utf8');
                this.client.settings = currentSettings;
                return res.json({
                    success: true,
                    settings: currentSettings.giveaway
                });
            }
            catch (error) {
                console.error('Error saving giveaway settings:', error);
                return res.status(500).json({ error: 'Failed to save giveaway settings' });
            }
        });
        this.app.get('/tempchannels', this.requireAdmin.bind(this), async (req, res) => {
            const currentLang = req.cookies?.preferredLanguage || 'en';
            const locale = this.getLocale(currentLang);
            try {
                const guild = this.client.guilds.cache.get(config_1.default.mainGuildId);
                if (!guild) {
                    return res.status(404).render('error', {
                        title: '404 - Not Found',
                        error: { code: 404, message: 'Guild not found' },
                        currentLang,
                        locale,
                        path: '/tempchannels'
                    });
                }
                const channels = guild.channels.cache
                    .filter(channel => channel.type === discord_js_1.ChannelType.GuildVoice)
                    .map(channel => ({
                    id: channel.id,
                    name: channel.name
                }));
                const categories = guild.channels.cache
                    .filter(channel => channel.type === discord_js_1.ChannelType.GuildCategory)
                    .map(channel => ({
                    id: channel.id,
                    name: channel.name
                }));
                const roles = guild.roles.cache
                    .filter(role => role.id !== guild.id)
                    .sort((a, b) => b.position - a.position)
                    .map(role => ({
                    id: role.id,
                    name: role.name,
                    color: role.hexColor || '#ffffff'
                }));
                return res.render('tempChannels', {
                    title: locale.dashboard.tempChannels.title,
                    settings: this.client.settings,
                    channels,
                    categories,
                    roles,
                    path: '/tempchannels',
                    currentLang,
                    locale,
                    breadcrumbs: this.getBreadcrumbs('/tempchannels')
                });
            }
            catch (error) {
                console.error('Error rendering temp channels page:', error);
                return res.status(500).render('error', {
                    title: 'Error',
                    error: { code: 500, message: 'Internal Server Error' },
                    currentLang,
                    locale,
                    path: '/tempchannels'
                });
            }
        });
        this.app.post('/api/tempchannels/settings', this.requireAdmin.bind(this), async (req, res) => {
            try {
                const settings = req.body;
                const settingsPath = (0, path_2.join)(process.cwd(), 'settings.json');
                let currentSettings = JSON.parse((0, fs_1.readFileSync)(settingsPath, 'utf8'));
                currentSettings.tempChannels = {
                    ...currentSettings.tempChannels,
                    ...settings
                };
                (0, fs_1.writeFileSync)(settingsPath, JSON.stringify(currentSettings, null, 4), 'utf8');
                this.client.settings = currentSettings;
                return res.json({
                    success: true,
                    settings: currentSettings.tempChannels
                });
            }
            catch (error) {
                console.error('Error saving temp channels settings:', error);
                return res.status(500).json({ error: 'Failed to save temp channels settings' });
            }
        });
        this.app.get('/autoreply', this.requireAdmin.bind(this), async (req, res) => {
            try {
                const settings = JSON.parse((0, fs_1.readFileSync)((0, path_2.join)(process.cwd(), 'settings.json'), 'utf8'));
                res.render('autoReply', {
                    title: res.locals.locale.dashboard.autoReply.title,
                    settings,
                    path: '/autoreply',
                    locale: res.locals.locale,
                    currentLang: res.locals.currentLang || 'en',
                    script: `<script>window.settings = ${JSON.stringify(settings)};</script>`
                });
            }
            catch (error) {
                console.error('Error loading auto reply page:', error);
                res.status(500).render('error', {
                    title: '500 - Server Error',
                    error: { code: 500, message: 'Internal server error' }
                });
            }
        });
        this.app.post('/api/autoreply/settings', this.requireAdmin.bind(this), async (req, res) => {
            try {
                const settings = req.body;
                const settingsPath = (0, path_2.join)(process.cwd(), 'settings.json');
                let currentSettings = JSON.parse((0, fs_1.readFileSync)(settingsPath, 'utf8'));
                currentSettings.autoReply = {
                    ...currentSettings.autoReply,
                    ...settings
                };
                (0, fs_1.writeFileSync)(settingsPath, JSON.stringify(currentSettings, null, 4), 'utf8');
                this.client.settings = currentSettings;
                return res.json({
                    success: true,
                    settings: currentSettings.autoReply
                });
            }
            catch (error) {
                console.error('Error saving auto reply settings:', error);
                return res.status(500).json({ error: 'Failed to save settings' });
            }
        });
        this.app.get('/suggestions', this.requireAdmin.bind(this), async (req, res) => {
            try {
                const settings = JSON.parse((0, fs_1.readFileSync)((0, path_2.join)(process.cwd(), 'settings.json'), 'utf-8'));
                res.render('suggestions', {
                    title: res.locals.locale.dashboard.suggestions.title,
                    settings,
                    path: '/suggestions',
                    locale: res.locals.locale,
                    currentLang: res.locals.currentLang
                });
            }
            catch (error) {
                console.error('Error loading suggestions page:', error);
                res.status(500).send('Error loading page');
            }
        });
        this.app.post('/api/settings/suggestions', this.requireAdmin.bind(this), async (req, res) => {
            try {
                const settings = req.body;
                const settingsPath = (0, path_2.join)(process.cwd(), 'settings.json');
                let currentSettings = JSON.parse((0, fs_1.readFileSync)(settingsPath, 'utf8'));
                currentSettings.suggestions = {
                    ...currentSettings.suggestions,
                    ...settings
                };
                (0, fs_1.writeFileSync)(settingsPath, JSON.stringify(currentSettings, null, 4), 'utf8');
                this.client.settings = currentSettings;
                return res.json({
                    success: true,
                    settings: currentSettings.suggestions
                });
            }
            catch (error) {
                console.error('Error saving suggestions settings:', error);
                return res.status(500).json({ error: 'Failed to save settings' });
            }
        });
        this.app.get('/api/dashboard/stats', async (_req, res) => {
            try {
                const stats = await this.generateDashboardStats();
                return res.json({
                    success: true,
                    stats,
                    timestamp: new Date().toISOString()
                });
            }
            catch (error) {
                console.error('Error fetching dashboard stats:', error);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to fetch dashboard stats'
                });
            }
        });
        this.app.post('/api/settings/language', this.requireAdmin.bind(this), async (req, res) => {
            try {
                const { defaultLanguage, supportedLanguages } = req.body;
                if (!defaultLanguage || !supportedLanguages || !Array.isArray(supportedLanguages)) {
                    return res.status(400).json({
                        success: false,
                        error: 'Invalid input parameters'
                    });
                }
                if (supportedLanguages.length === 0) {
                    return res.status(400).json({
                        success: false,
                        error: 'At least one language must be supported'
                    });
                }
                if (!supportedLanguages.includes(defaultLanguage)) {
                    return res.status(400).json({
                        success: false,
                        error: 'Default language must be included in supported languages'
                    });
                }
                const settingsPath = (0, path_2.join)(process.cwd(), 'settings.json');
                let currentSettings = JSON.parse((0, fs_1.readFileSync)(settingsPath, 'utf8'));
                currentSettings.defaultLanguage = defaultLanguage;
                currentSettings.supportedLanguages = supportedLanguages;
                (0, fs_1.writeFileSync)(settingsPath, JSON.stringify(currentSettings, null, 4), 'utf8');
                this.client.settings = currentSettings;
                return res.json({
                    success: true,
                    settings: {
                        defaultLanguage,
                        supportedLanguages
                    }
                });
            }
            catch (error) {
                console.error('Error updating language settings:', error);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to update language settings'
                });
            }
        });
        this.app.post('/api/settings/autoRoles', this.requireAdmin.bind(this), async (req, res) => {
            try {
                const settings = req.body;
                if (!settings || typeof settings.enabled !== 'boolean' ||
                    !settings.members || !settings.bots ||
                    typeof settings.members.enabled !== 'boolean' ||
                    typeof settings.bots.enabled !== 'boolean' ||
                    !Array.isArray(settings.members.roleIds) ||
                    !Array.isArray(settings.bots.roleIds)) {
                    return res.status(400).json({
                        success: false,
                        error: 'Invalid input parameters'
                    });
                }
                const settingsPath = (0, path_2.join)(process.cwd(), 'settings.json');
                let currentSettings = JSON.parse((0, fs_1.readFileSync)(settingsPath, 'utf8'));
                currentSettings.autoRoles = {
                    enabled: settings.enabled,
                    members: {
                        enabled: settings.members.enabled,
                        roleIds: settings.members.roleIds
                    },
                    bots: {
                        enabled: settings.bots.enabled,
                        roleIds: settings.bots.roleIds
                    }
                };
                (0, fs_1.writeFileSync)(settingsPath, JSON.stringify(currentSettings, null, 4), 'utf8');
                this.client.settings = currentSettings;
                return res.json({
                    success: true,
                    settings: currentSettings.autoRoles
                });
            }
            catch (error) {
                console.error('Error updating auto roles settings:', error);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to update auto roles settings'
                });
            }
        });
        this.app.get('/api/dashboard/chart/:period', async (req, res) => {
            try {
                const period = req.params.period;
                let days = 30;
                switch (period) {
                    case 'day':
                        days = 1;
                        break;
                    case 'week':
                        days = 7;
                        break;
                    case 'month':
                    default:
                        days = 30;
                        break;
                }
                const dates = Array.from({ length: days }, (_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - (days - 1) + i);
                    return date.toISOString().split('T')[0];
                });
                const pingData = dates.map((_, i) => {
                    let baseValue = 80;
                    const dayVariation = Math.sin(i / 3) * 10;
                    const randomVariation = Math.floor(Math.random() * 30);
                    return Math.floor(baseValue + dayVariation + randomVariation);
                });
                const commandsData = dates.map((_, i) => {
                    const baseValue = 50;
                    const trendGrowth = i * 1.5;
                    const dayOfWeek = new Date(dates[i]).getDay();
                    const weekendBoost = (dayOfWeek === 0 || dayOfWeek === 6) ? 25 : 0;
                    const randomVariation = Math.floor(Math.random() * 15);
                    return Math.floor(baseValue + trendGrowth + weekendBoost + randomVariation);
                });
                const usersData = dates.map((_, i) => {
                    const baseValue = 300;
                    const trendGrowth = i * 5;
                    const dayOfWeek = new Date(dates[i]).getDay();
                    const weekendBoost = (dayOfWeek === 0 || dayOfWeek === 6) ? 100 : 0;
                    const randomVariation = Math.floor(Math.random() * 40);
                    return Math.floor(baseValue + trendGrowth + weekendBoost + randomVariation);
                });
                const formattedDates = dates.map(date => {
                    const d = new Date(date);
                    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                });
                return res.json({
                    success: true,
                    data: {
                        labels: formattedDates,
                        datasets: {
                            ping: pingData,
                            commands: commandsData,
                            users: usersData
                        }
                    },
                    period,
                    timestamp: new Date().toISOString()
                });
            }
            catch (error) {
                console.error('Error generating chart data:', error);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to generate chart data'
                });
            }
        });
        this.app.get('/welcome', this.requireAdmin.bind(this), (req, res) => {
            try {
                const currentLang = req.cookies?.preferredLanguage || 'en';
                const locale = this.getLocale(currentLang);
                const guild = res.locals.guild;
                const channels = guild.channels.cache
                    .filter(channel => channel.type === discord_js_1.ChannelType.GuildText)
                    .map(channel => ({ id: channel.id, name: channel.name }));

                return res.render('welcome', {
                    title: locale.dashboard.navigation.welcome,
                    settings: this.client.settings,
                    channels,
                    path: '/welcome',
                    currentLang,
                    locale,
                    user: req.session.user,
                    guild: res.locals.guild,
                    breadcrumbs: this.getBreadcrumbs('/welcome')
                });
            }
            catch (error) {
                console.error('Error rendering welcome system page:', error);
                return res.status(500).render('error', {
                    title: 'Error',
                    error: { code: 500, message: 'Internal Server Error' },
                    currentLang: 'en',
                    locale: this.getLocale('en')
                });
            }
        });

        this.app.post('/api/welcome/settings', this.requireAdmin.bind(this), async (req, res) => {
            try {
                const settings = req.body;
                const settingsPath = (0, path_2.join)(process.cwd(), 'settings.json');
                let currentSettings = JSON.parse((0, fs_1.readFileSync)(settingsPath, 'utf8'));
                currentSettings.welcome = { ...currentSettings.welcome, ...settings };
                (0, fs_1.writeFileSync)(settingsPath, JSON.stringify(currentSettings, null, 4), 'utf8');
                this.client.settings = currentSettings;
                return res.json({ success: true, settings: currentSettings.welcome });
            } catch (error) {
                console.error('Error saving welcome settings:', error);
                return res.status(500).json({ error: 'Failed to save settings' });
            }
        });

        this.app.get('/selectroles', this.requireAdmin.bind(this), (req, res) => {
            try {
                const currentLang = req.cookies?.preferredLanguage || 'en';
                const locale = this.getLocale(currentLang);
                const guild = res.locals.guild;
                const roles = guild.roles.cache
                    .filter(role => role.id !== guild.id)
                    .sort((a, b) => b.position - a.position)
                    .map(role => ({ id: role.id, name: role.name, color: role.hexColor }));

                return res.render('selectRoles', {
                    title: locale.dashboard.navigation.selectRoles,
                    settings: this.client.settings,
                    roles,
                    path: '/selectroles',
                    currentLang,
                    locale,
                    user: req.session.user,
                    guild: res.locals.guild,
                    breadcrumbs: this.getBreadcrumbs('/selectroles')
                });
            }
            catch (error) {
                console.error('Error rendering select roles page:', error);
                return res.status(500).render('error', {
                    title: 'Error',
                    error: { code: 500, message: 'Internal Server Error' },
                    currentLang: 'en',
                    locale: this.getLocale('en')
                });
            }
        });

        this.app.post('/api/selectroles/settings', this.requireAdmin.bind(this), async (req, res) => {
            try {
                const settings = req.body;
                const settingsPath = (0, path_2.join)(process.cwd(), 'settings.json');
                let currentSettings = JSON.parse((0, fs_1.readFileSync)(settingsPath, 'utf8'));
                currentSettings.selectRoles = { ...currentSettings.selectRoles, ...settings };
                (0, fs_1.writeFileSync)(settingsPath, JSON.stringify(currentSettings, null, 4), 'utf8');
                this.client.settings = currentSettings;
                return res.json({ success: true, settings: currentSettings.selectRoles });
            } catch (error) {
                console.error('Error saving select roles settings:', error);
                return res.status(500).json({ error: 'Failed to save settings' });
            }
        });

        this.app.post('/api/selectroles/send', this.requireAdmin.bind(this), async (req, res) => {
            try {
                const { channelId } = req.body;
                const guild = res.locals.guild;
                const channel = guild.channels.cache.get(channelId);
                if (!channel) return res.status(404).json({ error: 'Channel not found' });

                const { sendSelectRolesMessage } = require('../src/selectRoles/selectRolesHandler');
                await sendSelectRolesMessage(channel, this.client);
                return res.json({ success: true });
            } catch (error) {
                console.error('Error sending select roles message:', error);
                return res.status(500).json({ error: 'Failed to send message' });
            }
        });

        this.app.get('/games', this.requireAdmin.bind(this), (req, res) => {
            try {
                const currentLang = req.cookies?.preferredLanguage || 'en';
                const locale = this.getLocale(currentLang);
                const guild = res.locals.guild;
                const channels = guild.channels.cache
                    .filter(channel => channel.type === discord_js_1.ChannelType.GuildText)
                    .map(channel => ({ id: channel.id, name: channel.name }));

                return res.render('games', {
                    title: locale.dashboard.navigation.games,
                    settings: this.client.settings,
                    channels,
                    path: '/games',
                    currentLang,
                    locale,
                    user: req.session.user,
                    guild: res.locals.guild,
                    breadcrumbs: this.getBreadcrumbs('/games')
                });
            }
            catch (error) {
                console.error('Error rendering games page:', error);
                return res.status(500).render('error', {
                    title: 'Error',
                    error: { code: 500, message: 'Internal Server Error' },
                    currentLang: 'en',
                    locale: this.getLocale('en')
                });
            }
        });

        this.app.post('/api/games/settings', this.requireAdmin.bind(this), async (req, res) => {
            try {
                const settings = req.body;
                const settingsPath = (0, path_2.join)(process.cwd(), 'settings.json');
                let currentSettings = JSON.parse((0, fs_1.readFileSync)(settingsPath, 'utf8'));
                currentSettings.games = { ...currentSettings.games, ...settings };
                (0, fs_1.writeFileSync)(settingsPath, JSON.stringify(currentSettings, null, 4), 'utf8');
                this.client.settings = currentSettings;
                return res.json({ success: true, settings: currentSettings.games });
            } catch (error) {
                console.error('Error saving games settings:', error);
                return res.status(500).json({ error: 'Failed to save settings' });
            }
        });

        this.app.get('/automod', this.requireAdmin.bind(this), (req, res) => {
            try {
                const currentLang = req.cookies?.preferredLanguage || 'en';
                const locale = this.getLocale(currentLang);
                return res.render('automod', {
                    title: locale.dashboard.navigation.automod,
                    settings: this.client.settings,
                    path: '/automod',
                    currentLang,
                    locale,
                    user: req.session.user,
                    guild: res.locals.guild,
                    breadcrumbs: this.getBreadcrumbs('/automod')
                });
            }
            catch (error) {
                console.error('Error rendering automod page:', error);
                return res.status(500).render('error', {
                    title: 'Error',
                    error: { code: 500, message: 'Internal Server Error' },
                    currentLang: 'en',
                    locale: this.getLocale('en')
                });
            }
        });

        this.app.post('/api/automod/settings', this.requireAdmin.bind(this), async (req, res) => {
            try {
                const settings = req.body;
                const settingsPath = (0, path_2.join)(process.cwd(), 'settings.json');
                let currentSettings = JSON.parse((0, fs_1.readFileSync)(settingsPath, 'utf8'));
                currentSettings.automod = { ...currentSettings.automod, ...settings };
                (0, fs_1.writeFileSync)(settingsPath, JSON.stringify(currentSettings, null, 4), 'utf8');
                this.client.settings = currentSettings;
                return res.json({ success: true, settings: currentSettings.automod });
            } catch (error) {
                console.error('Error saving automod settings:', error);
                return res.status(500).json({ error: 'Failed to save settings' });
            }
        });

        this.app.get('/autolines', this.requireAdmin.bind(this), (req, res) => {
            try {
                const currentLang = req.cookies?.preferredLanguage || 'en';
                const locale = this.getLocale(currentLang);
                const guild = res.locals.guild;
                const channels = guild.channels.cache
                    .filter(channel => channel.type === discord_js_1.ChannelType.GuildText)
                    .map(channel => ({ id: channel.id, name: channel.name }));

                return res.render('autoLines', {
                    title: locale.dashboard.navigation.autoLines,
                    settings: this.client.settings,
                    channels,
                    path: '/autolines',
                    currentLang,
                    locale,
                    user: req.session.user,
                    guild: res.locals.guild,
                    breadcrumbs: this.getBreadcrumbs('/autolines')
                });
            }
            catch (error) {
                console.error('Error rendering auto lines page:', error);
                return res.status(500).render('error', {
                    title: 'Error',
                    error: { code: 500, message: 'Internal Server Error' },
                    currentLang: 'en',
                    locale: this.getLocale('en')
                });
            }
        });

        this.app.post('/api/autolines/settings', this.requireAdmin.bind(this), async (req, res) => {
            try {
                const settings = req.body;
                const settingsPath = (0, path_2.join)(process.cwd(), 'settings.json');
                let currentSettings = JSON.parse((0, fs_1.readFileSync)(settingsPath, 'utf8'));
                currentSettings.autoLines = { ...currentSettings.autoLines, ...settings };
                (0, fs_1.writeFileSync)(settingsPath, JSON.stringify(currentSettings, null, 4), 'utf8');
                this.client.settings = currentSettings;
                return res.json({ success: true, settings: currentSettings.autoLines });
            } catch (error) {
                console.error('Error saving auto lines settings:', error);
                return res.status(500).json({ error: 'Failed to save settings' });
            }
        });

        this.app.get('/leveling', this.requireAdmin.bind(this), (req, res) => {
            try {
                const currentLang = req.cookies?.preferredLanguage || 'en';
                const locale = this.getLocale(currentLang);
                const guild = res.locals.guild;
                const channels = guild.channels.cache
                    .filter(channel => channel.type === discord_js_1.ChannelType.GuildText)
                    .map(channel => ({ id: channel.id, name: channel.name }));
                const roles = guild.roles.cache
                    .filter(role => role.id !== guild.id)
                    .sort((a, b) => b.position - a.position)
                    .map(role => ({ id: role.id, name: role.name, color: role.hexColor }));

                return res.render('leveling', {
                    title: locale.dashboard.navigation.leveling,
                    settings: this.client.settings,
                    channels,
                    roles,
                    path: '/leveling',
                    currentLang,
                    locale,
                    user: req.session.user,
                    guild: res.locals.guild,
                    breadcrumbs: this.getBreadcrumbs('/leveling')
                });
            }
            catch (error) {
                console.error('Error rendering leveling system page:', error);
                return res.status(500).render('error', {
                    title: 'Error',
                    error: { code: 500, message: 'Internal Server Error' },
                    currentLang: 'en',
                    locale: this.getLocale('en')
                });
            }
        });

        this.app.post('/api/leveling/settings', this.requireAdmin.bind(this), async (req, res) => {
            try {
                const settings = req.body;
                const settingsPath = (0, path_2.join)(process.cwd(), 'settings.json');
                let currentSettings = JSON.parse((0, fs_1.readFileSync)(settingsPath, 'utf8'));
                currentSettings.leveling = { ...currentSettings.leveling, ...settings };
                (0, fs_1.writeFileSync)(settingsPath, JSON.stringify(currentSettings, null, 4), 'utf8');
                this.client.settings = currentSettings;
                return res.json({ success: true, settings: currentSettings.leveling });
            } catch (error) {
                console.error('Error saving leveling settings:', error);
                return res.status(500).json({ error: 'Failed to save settings' });
            }
        });

        // Economy Routes
        this.app.get('/economy', this.requireAdmin.bind(this), (req, res) => {
            try {
                const currentLang = req.cookies?.preferredLanguage || 'en';
                const locale = this.getLocale(currentLang);
                return res.render('economy', {
                    title: 'Economy Settings',
                    settings: this.client.settings,
                    path: '/economy',
                    currentLang,
                    locale,
                    user: req.session.user,
                    guild: res.locals.guild,
                    breadcrumbs: this.getBreadcrumbs('/economy')
                });
            } catch (error) {
                console.error('Error rendering economy page:', error);
                res.status(500).send('Internal Server Error');
            }
        });

        this.app.post('/api/economy/settings', this.requireAdmin.bind(this), async (req, res) => {
            try {
                const settings = req.body;
                const settingsPath = (0, path_2.join)(process.cwd(), 'settings.json');
                let currentSettings = JSON.parse((0, fs_1.readFileSync)(settingsPath, 'utf8'));
                currentSettings.economy = { ...currentSettings.economy, ...settings };
                (0, fs_1.writeFileSync)(settingsPath, JSON.stringify(currentSettings, null, 4), 'utf8');
                this.client.settings = currentSettings;
                return res.json({ success: true, settings: currentSettings.economy });
            } catch (error) {
                console.error('Error saving economy settings:', error);
                return res.status(500).json({ error: 'Failed to save settings' });
            }
        });

        // Verification Routes
        this.app.get('/verification', this.requireAdmin.bind(this), (req, res) => {
            try {
                const currentLang = req.cookies?.preferredLanguage || 'en';
                const locale = this.getLocale(currentLang);
                const guild = res.locals.guild;
                const roles = guild.roles.cache
                    .filter(role => role.id !== guild.id)
                    .sort((a, b) => b.position - a.position)
                    .map(role => ({ id: role.id, name: role.name, color: role.hexColor }));
                const channels = guild.channels.cache
                    .filter(channel => channel.type === discord_js_1.ChannelType.GuildText)
                    .map(channel => ({ id: channel.id, name: channel.name }));

                return res.render('verification', {
                    title: 'Verification Settings',
                    settings: this.client.settings,
                    roles,
                    channels,
                    path: '/verification',
                    currentLang,
                    locale,
                    user: req.session.user,
                    guild: res.locals.guild,
                    breadcrumbs: this.getBreadcrumbs('/verification')
                });
            } catch (error) {
                console.error('Error rendering verification page:', error);
                res.status(500).send('Internal Server Error');
            }
        });

        this.app.post('/api/verification/settings', this.requireAdmin.bind(this), async (req, res) => {
            try {
                const settings = req.body;
                const settingsPath = (0, path_2.join)(process.cwd(), 'settings.json');
                let currentSettings = JSON.parse((0, fs_1.readFileSync)(settingsPath, 'utf8'));
                currentSettings.verification = { ...currentSettings.verification, ...settings };
                (0, fs_1.writeFileSync)(settingsPath, JSON.stringify(currentSettings, null, 4), 'utf8');
                this.client.settings = currentSettings;
                return res.json({ success: true, settings: currentSettings.verification });
            } catch (error) {
                console.error('Error saving verification settings:', error);
                return res.status(500).json({ error: 'Failed to save settings' });
            }
        });

        // Server Lock Routes
        this.app.get('/serverlock', this.requireAdmin.bind(this), (req, res) => {
            try {
                const currentLang = req.cookies?.preferredLanguage || 'en';
                const locale = this.getLocale(currentLang);
                return res.render('serverlock', {
                    title: 'Server Lock Settings',
                    settings: this.client.settings,
                    path: '/serverlock',
                    currentLang,
                    locale,
                    user: req.session.user,
                    guild: res.locals.guild,
                    breadcrumbs: this.getBreadcrumbs('/serverlock')
                });
            } catch (error) {
                console.error('Error rendering serverlock page:', error);
                res.status(500).send('Internal Server Error');
            }
        });

        this.app.post('/api/serverlock/settings', this.requireAdmin.bind(this), async (req, res) => {
            try {
                const settings = req.body;
                const settingsPath = (0, path_2.join)(process.cwd(), 'settings.json');
                let currentSettings = JSON.parse((0, fs_1.readFileSync)(settingsPath, 'utf8'));
                currentSettings.serverLock = { ...currentSettings.serverLock, ...settings };
                (0, fs_1.writeFileSync)(settingsPath, JSON.stringify(currentSettings, null, 4), 'utf8');
                this.client.settings = currentSettings;
                return res.json({ success: true, settings: currentSettings.serverLock });
            } catch (error) {
                console.error('Error saving serverlock settings:', error);
                return res.status(500).json({ error: 'Failed to save settings' });
            }
        });
        this.app.get('/api/commands/list', this.requireAdmin.bind(this), async (_req, res) => {
            try {
                const settingsPath = (0, path_2.join)(process.cwd(), 'settings.json');
                const currentSettings = JSON.parse((0, fs_1.readFileSync)(settingsPath, 'utf8'));
                const allCommands = Object.entries(currentSettings.commands).map(([name, data]) => {
                    const commandData = data;
                    return {
                        name,
                        enabled: commandData.enabled || false,
                        aliases: commandData.aliases || [],
                        cooldown: commandData.cooldown || 5,
                        permissions: commandData.permissions || { enabledRoleIds: [], disabledRoleIds: [] }
                    };
                });
                const generalCommands = ['avatar', 'banner', 'ping', 'roles', 'server', 'user'];
                const moderationCommands = ['ban', 'kick', 'mute', 'unmute', 'warn', 'unwarn', 'clear', 'lock', 'unlock', 'hide', 'unhide', 'move', 'timeout', 'rtimeout'];
                const categories = {
                    general: allCommands.filter(cmd => generalCommands.includes(cmd.name)),
                    moderation: allCommands.filter(cmd => moderationCommands.includes(cmd.name)),
                    utility: allCommands.filter(cmd => !generalCommands.includes(cmd.name) && !moderationCommands.includes(cmd.name))
                };
                return res.json({
                    success: true,
                    categories,
                    allCommands
                });
            }
            catch (error) {
                console.error('Error fetching commands list:', error);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to fetch commands list'
                });
            }
        });
        this.app.get('/api/settings/export', this.requireAdmin.bind(this), (req, res) => {
            try {
                const settings = this.client.settings;
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', 'attachment; filename=settings.json');
                return res.send(JSON.stringify(settings, null, 4));
            } catch (error) {
                console.error('Error exporting settings:', error);
                return res.status(500).json({ error: 'Failed to export settings' });
            }
        });

        this.app.post('/api/settings/import', this.requireAdmin.bind(this), async (req, res) => {
            try {
                const settings = req.body;
                const settingsPath = (0, path_2.join)(process.cwd(), 'settings.json');
                (0, fs_1.writeFileSync)(settingsPath, JSON.stringify(settings, null, 4), 'utf8');
                this.client.settings = settings;
                return res.json({ success: true });
            } catch (error) {
                console.error('Error importing settings:', error);
                return res.status(500).json({ error: 'Failed to import settings' });
            }
        });

        // AI Moderation Routes
        this.app.get('/aimod', this.requireAdmin.bind(this), (req, res) => {
            try {
                const currentLang = req.cookies?.preferredLanguage || 'en';
                const locale = this.getLocale(currentLang);
                return res.render('aimod', {
                    title: 'AI Moderation Settings',
                    settings: this.client.settings,
                    path: '/aimod',
                    currentLang,
                    locale,
                    user: req.session.user,
                    guild: res.locals.guild,
                    breadcrumbs: this.getBreadcrumbs('/aimod')
                });
            } catch (error) {
                console.error('Error rendering aimod page:', error);
                res.status(500).send('Internal Server Error');
            }
        });

        this.app.post('/api/aimod/settings', this.requireAdmin.bind(this), async (req, res) => {
            try {
                const settings = req.body;
                const settingsPath = (0, path_2.join)(process.cwd(), 'settings.json');
                let currentSettings = JSON.parse((0, fs_1.readFileSync)(settingsPath, 'utf8'));
                currentSettings.aiModeration = { ...currentSettings.aiModeration, ...settings };
                (0, fs_1.writeFileSync)(settingsPath, JSON.stringify(currentSettings, null, 4), 'utf8');
                this.client.settings = currentSettings;
                return res.json({ success: true, settings: currentSettings.aiModeration });
            } catch (error) {
                console.error('Error saving aimod settings:', error);
                return res.status(500).json({ error: 'Failed to save settings' });
            }
        });

        // Social Integrations Routes
        this.app.get('/integrations', this.requireAdmin.bind(this), (req, res) => {
            try {
                const currentLang = req.cookies?.preferredLanguage || 'en';
                const locale = this.getLocale(currentLang);
                const guild = res.locals.guild;
                const channels = guild.channels.cache
                    .filter(channel => channel.type === discord_js_1.ChannelType.GuildText)
                    .map(channel => ({ id: channel.id, name: channel.name }));

                return res.render('integrations', {
                    title: 'Social Integrations',
                    settings: this.client.settings,
                    channels,
                    path: '/integrations',
                    currentLang,
                    locale,
                    user: req.session.user,
                    guild: res.locals.guild,
                    breadcrumbs: this.getBreadcrumbs('/integrations')
                });
            } catch (error) {
                console.error('Error rendering integrations page:', error);
                res.status(500).send('Internal Server Error');
            }
        });

        this.app.post('/api/integrations/settings', this.requireAdmin.bind(this), async (req, res) => {
            try {
                const settings = req.body;
                const settingsPath = (0, path_2.join)(process.cwd(), 'settings.json');
                let currentSettings = JSON.parse((0, fs_1.readFileSync)(settingsPath, 'utf8'));
                currentSettings.socialIntegration = { ...currentSettings.socialIntegration, ...settings };
                (0, fs_1.writeFileSync)(settingsPath, JSON.stringify(currentSettings, null, 4), 'utf8');
                this.client.settings = currentSettings;
                return res.json({ success: true, settings: currentSettings.socialIntegration });
            } catch (error) {
                console.error('Error saving integrations settings:', error);
                return res.status(500).json({ error: 'Failed to save settings' });
            }
        });

        // Custom Webhooks Routes
        this.app.get('/webhooks', this.requireAdmin.bind(this), (req, res) => {
            try {
                const currentLang = req.cookies?.preferredLanguage || 'en';
                const locale = this.getLocale(currentLang);
                const guild = res.locals.guild;
                const channels = guild.channels.cache
                    .filter(channel => channel.type === discord_js_1.ChannelType.GuildText)
                    .map(channel => ({ id: channel.id, name: channel.name }));

                return res.render('webhooks', {
                    title: 'Custom Webhooks',
                    settings: this.client.settings,
                    channels,
                    path: '/webhooks',
                    currentLang,
                    locale,
                    user: req.session.user,
                    guild: res.locals.guild,
                    breadcrumbs: this.getBreadcrumbs('/webhooks')
                });
            } catch (error) {
                console.error('Error rendering webhooks page:', error);
                res.status(500).send('Internal Server Error');
            }
        });

        this.app.post('/api/webhooks/settings', this.requireAdmin.bind(this), async (req, res) => {
            try {
                const settings = req.body;
                const settingsPath = (0, path_2.join)(process.cwd(), 'settings.json');
                let currentSettings = JSON.parse((0, fs_1.readFileSync)(settingsPath, 'utf8'));
                currentSettings.webhooks = { ...currentSettings.webhooks, ...settings };
                (0, fs_1.writeFileSync)(settingsPath, JSON.stringify(currentSettings, null, 4), 'utf8');
                this.client.settings = currentSettings;
                return res.json({ success: true, settings: currentSettings.webhooks });
            } catch (error) {
                console.error('Error saving webhooks settings:', error);
                return res.status(500).json({ error: 'Failed to save settings' });
            }
        });

        // Role Management Routes
        this.app.get('/rolemanagement', this.requireAdmin.bind(this), (req, res) => {
            try {
                const currentLang = req.cookies?.preferredLanguage || 'en';
                const locale = this.getLocale(currentLang);
                const guild = res.locals.guild;
                const roles = guild.roles.cache
                    .filter(role => role.id !== guild.id)
                    .sort((a, b) => b.position - a.position)
                    .map(role => ({ id: role.id, name: role.name, color: role.hexColor }));

                return res.render('rolemanagement', {
                    title: 'Role Management',
                    settings: this.client.settings,
                    roles,
                    path: '/rolemanagement',
                    currentLang,
                    locale,
                    user: req.session.user,
                    guild: res.locals.guild,
                    breadcrumbs: this.getBreadcrumbs('/rolemanagement')
                });
            } catch (error) {
                console.error('Error rendering rolemanagement page:', error);
                res.status(500).send('Internal Server Error');
            }
        });

        this.app.post('/api/rolemanagement/settings', this.requireAdmin.bind(this), async (req, res) => {
            try {
                const settings = req.body;
                const settingsPath = (0, path_2.join)(process.cwd(), 'settings.json');
                let currentSettings = JSON.parse((0, fs_1.readFileSync)(settingsPath, 'utf8'));
                currentSettings.roleManagement = { ...currentSettings.roleManagement, ...settings };
                (0, fs_1.writeFileSync)(settingsPath, JSON.stringify(currentSettings, null, 4), 'utf8');
                this.client.settings = currentSettings;
                return res.json({ success: true, settings: currentSettings.roleManagement });
            } catch (error) {
                console.error('Error saving rolemanagement settings:', error);
                return res.status(500).json({ error: 'Failed to save settings' });
            }
        });

        // System Settings Routes
        this.app.get('/system', this.requireAdmin.bind(this), (req, res) => {
            try {
                const currentLang = req.cookies?.preferredLanguage || 'en';
                const locale = this.getLocale(currentLang);
                return res.render('system', {
                    title: 'System Settings',
                    settings: this.client.settings,
                    path: '/system',
                    currentLang,
                    locale,
                    user: req.session.user,
                    guild: res.locals.guild,
                    breadcrumbs: this.getBreadcrumbs('/system')
                });
            } catch (error) {
                console.error('Error rendering system page:', error);
                res.status(500).send('Internal Server Error');
            }
        });

        this.app.post('/api/settings/branding', this.requireAdmin.bind(this), async (req, res) => {
            try {
                const settings = req.body;
                const settingsPath = (0, path_2.join)(process.cwd(), 'settings.json');
                let currentSettings = JSON.parse((0, fs_1.readFileSync)(settingsPath, 'utf8'));
                currentSettings.branding = { ...currentSettings.branding, ...settings };
                (0, fs_1.writeFileSync)(settingsPath, JSON.stringify(currentSettings, null, 4), 'utf8');
                this.client.settings = currentSettings;
                return res.json({ success: true, settings: currentSettings.branding });
            } catch (error) {
                console.error('Error saving branding settings:', error);
                return res.status(500).json({ error: 'Failed to save settings' });
            }
        });

        this.app.get('/api/webhooks/trigger/:id', async (req, res) => {
            try {
                const { id } = req.params;
                const config = this.client.settings.webhooks.endpoints.find(e => e.id === id);
                if (!config) return res.status(404).json({ error: 'Webhook not found' });
                
                const channel = this.client.channels.cache.get(config.channelId);
                if (channel) {
                    await channel.send(config.template || 'External data received!').catch(console.error);
                }
                
                return res.json({ success: true });
            } catch (error) {
                console.error('Error triggering webhook:', error);
                return res.status(500).json({ error: 'Failed to trigger webhook' });
            }
        });

        this.app.use((_req, res) => {
            res.status(404).render('error', {
                title: '404 - ' + res.locals.locale.dashboard.error['404'].title,
                error: {
                    code: 404,
                    message: res.locals.locale.dashboard.error['404'].message
                }
            });
        });
    }
    async saveSettings(settings) {
        try {
            const settingsPath = (0, path_2.join)(__dirname, '../settings.json');
            const settingsToSave = settings || this.client.settings;
            const settingsString = JSON.stringify(settingsToSave, null, 4);
            await (0, fs_1.writeFileSync)(settingsPath, settingsString);
            console.log('Settings saved successfully');
            delete require.cache[require.resolve('../settings.json')];
            const savedSettings = JSON.parse((0, fs_1.readFileSync)(settingsPath, 'utf8'));
            console.log('Verified saved settings:', savedSettings.commands[Object.keys(savedSettings.commands)[0]]);
            if (settings) {
                this.client.settings = settings;
            }
        }
        catch (error) {
            console.error('Error saving settings:', error);
            throw error;
        }
    }
    start() {
        try {
            const port = config_1.default.dashboard.port;
            console.log(`[Dashboard] Attempting to start dashboard on port ${port}...`);
            console.log(`[Dashboard] Port type: ${typeof port}, value: ${JSON.stringify(port)}`);
            console.log(`[Dashboard] Full config:`, JSON.stringify(config_1.default.dashboard));
            
            this.app.listen(port, '0.0.0.0', () => {
                console.log(`Dashboard running on port ${port}`);
                console.log(`Dashboard accessible at http://0.0.0.0:${port}`);
            });
            
            console.log(`[Dashboard] listen() called successfully`);
        }
        catch (error) {
            console.error('Failed to start dashboard:', error);
            throw error;
        }
    }
    async generateDashboardStats() {
        const serverCount = this.client.guilds.cache.size;
        const memberCount = this.client.guilds.cache.reduce((a, g) => a + g.memberCount, 0);
        const commandCount = this.client.commands.size;
        const totalChannels = this.client.guilds.cache.reduce((acc, guild) => acc + guild.channels.cache.size, 0);
        const memoryUsage = process.memoryUsage();
        const memoryUsageMB = Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100;
        let commandsUsed = 0;
        const commandStats = this.client.commandStats;
        if (commandStats && typeof commandStats === 'object') {
            commandsUsed = Object.values(commandStats).reduce((sum, count) => sum + count, 0);
        }
        const protection = this.client.settings.protection || {};
        const activeProtections = Object.keys(protection)
            .filter(k => k !== 'enabled' && protection[k]?.enabled)
            .length;
        const protectedRoles = protection.protectedRoles?.roles?.length || 0;
        const whitelistedBots = protection.antibot?.whitelistedBots?.length || 0;
        const logs = this.client.settings.logs || {};
        const logsArray = Object.values(logs);
        const activeLogs = logsArray.filter(log => log.enabled).length;
        const uptimeSeconds = process.uptime();
        const days = Math.floor(uptimeSeconds / 86400);
        const hours = Math.floor((uptimeSeconds % 86400) / 3600);
        const minutes = Math.floor((uptimeSeconds % 3600) / 60);
        const uptime = days > 0
            ? `${days}d ${hours}h ${minutes}m`
            : hours > 0
                ? `${hours}h ${minutes}m`
                : `${minutes}m`;
        return {
            servers: serverCount,
            users: memberCount,
            commands: commandCount,
            commandsUsed,
            channels: totalChannels,
            ping: this.getPing(),
            uptime,
            memoryUsage: memoryUsageMB,
            protection: {
                activeProtections,
                protectedRoles,
                whitelistedBots,
                activeLogs
            }
        };
    }
    getModuleStatus() {
        const settings = this.client.settings;
        return {
            protection: {
                enabled: settings.protection?.enabled || false,
                activeRules: Object.keys(settings.protection || {})
                    .filter(k => k !== 'enabled' && settings.protection[k]?.enabled)
                    .length
            },
            tickets: {
                enabled: settings.ticket?.enabled || false,
                sections: (settings.ticket?.sections || []).length
            },
            apply: {
                enabled: settings.apply?.enabled || false,
                positions: (settings.apply?.positions || [])
                    .filter((p) => p.enabled)
                    .length
            },
            rules: {
                enabled: settings.rules?.enabled || false,
                sections: (settings.rules?.sections || []).length
            },
            giveaway: {
                enabled: settings.giveaway?.enabled || false
            },
            logs: {
                enabled: Object.values(settings.logs || {}).some((log) => log.enabled),
                activeTypes: Object.values(settings.logs || {}).filter((log) => log.enabled).length
            },
            autoReply: {
                enabled: settings.autoReply?.enabled || false,
                triggers: (settings.autoReply?.triggers || []).length
            },
            tempChannels: {
                enabled: settings.tempChannels?.enabled || false
            },
            suggestions: {
                enabled: settings.suggestions?.enabled || false
            },
            welcome: {
                enabled: settings.welcome?.enabled || false
            },
            selectRoles: {
                enabled: settings.selectRoles?.enabled || false
            },
            games: {
                enabled: settings.games?.enabled || false
            },
            automod: {
                enabled: settings.automod?.enabled || false
            },
            autoLines: {
                enabled: settings.autoLines?.enabled || false
            },
            leveling: {
                enabled: settings.leveling?.enabled || false
            },
            economy: {
                enabled: settings.economy?.enabled || false
            },
            verification: {
                enabled: settings.verification?.enabled || false
            },
            serverLock: {
                enabled: settings.serverLock?.locked || false
            }
        };
    }
    async getRecentActivity() {
        const now = new Date();
        return [
            {
                id: 'system-init',
                type: 'system',
                title: 'System Initialized',
                description: 'All systems are up and running',
                icon: 'check-circle',
                color: 'blue',
                timestamp: this.startTime,
                timeAgo: this.getRelativeTime(this.startTime)
            },
            {
                id: 'api-connected',
                type: 'connection',
                title: 'API Connected',
                description: 'Gateway connection established',
                icon: 'server',
                color: 'green',
                timestamp: new Date(now.getTime() - 10 * 60000),
                timeAgo: '10 minutes ago'
            },
            {
                id: 'protection-active',
                type: 'protection',
                title: 'Protection Active',
                description: 'Server security systems enabled',
                icon: 'shield-alt',
                color: 'purple',
                timestamp: new Date(now.getTime() - 30 * 60000),
                timeAgo: '30 minutes ago'
            },
            {
                id: 'settings-updated',
                type: 'settings',
                title: 'Settings Updated',
                description: 'Configuration changes applied',
                icon: 'sync',
                color: 'amber',
                timestamp: new Date(now.getTime() - 60 * 60000),
                timeAgo: '1 hour ago'
            }
        ];
    }
    getRelativeTime(date) {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffSec = Math.round(diffMs / 1000);
        const diffMin = Math.round(diffSec / 60);
        const diffHour = Math.round(diffMin / 60);
        const diffDay = Math.round(diffHour / 24);
        if (diffSec < 60)
            return 'Just now';
        if (diffMin < 60)
            return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
        if (diffHour < 24)
            return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
        return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    }
}
exports.Dashboard = Dashboard;
