/**
 * Library Management System - Authentication Service
 * Manages admin authentication, session persistence, profile management, and route guarding.
 */

const AUTH_CONFIG = {
    DEFAULT_USERNAME: 'admin',
    DEFAULT_PASSWORD: 'admin123',
    STORAGE_AUTH_KEY: 'lms_auth_session',
    STORAGE_CREDS_KEY: 'lms_admin_credentials'
};

class AuthService {
    constructor() {
        this.init();
    }

    init() {
        // Initialize default credentials if not configured
        if (!localStorage.getItem(AUTH_CONFIG.STORAGE_CREDS_KEY)) {
            const defaultCreds = {
                username: AUTH_CONFIG.DEFAULT_USERNAME,
                password: AUTH_CONFIG.DEFAULT_PASSWORD,
                name: 'Administrator',
                designation: 'Chief Librarian',
                department: 'Dept. of Computer Science & Engineering',
                email: 'admin@library.edu',
                phone: '+91 98765 43210'
            };
            localStorage.setItem(AUTH_CONFIG.STORAGE_CREDS_KEY, JSON.stringify(defaultCreds));
        }
    }

    getAdminProfile() {
        try {
            return JSON.parse(localStorage.getItem(AUTH_CONFIG.STORAGE_CREDS_KEY));
        } catch (e) {
            return {
                username: AUTH_CONFIG.DEFAULT_USERNAME,
                name: 'Administrator',
                email: 'admin@library.edu'
            };
        }
    }

    login(username, password, rememberMe = false) {
        const cleanUser = (username || '').trim().toLowerCase();
        const cleanPass = (password || '').trim();

        const adminCreds = this.getAdminProfile();

        if (!cleanUser || !cleanPass) {
            return { success: false, message: 'Please enter both username and password.' };
        }

        if (cleanUser === adminCreds.username.toLowerCase() && cleanPass === adminCreds.password) {
            const sessionData = {
                username: adminCreds.username,
                name: adminCreds.name,
                designation: adminCreds.designation,
                email: adminCreds.email,
                loginTime: new Date().toISOString(),
                rememberMe: rememberMe
            };

            if (rememberMe) {
                localStorage.setItem(AUTH_CONFIG.STORAGE_AUTH_KEY, JSON.stringify(sessionData));
            } else {
                sessionStorage.setItem(AUTH_CONFIG.STORAGE_AUTH_KEY, JSON.stringify(sessionData));
            }

            return { 
                success: true, 
                message: 'Login successful! Redirecting to dashboard...',
                user: sessionData 
            };
        } else {
            return { 
                success: false, 
                message: 'Invalid credentials! (Demo: admin / admin123)' 
            };
        }
    }

    logout() {
        localStorage.removeItem(AUTH_CONFIG.STORAGE_AUTH_KEY);
        sessionStorage.removeItem(AUTH_CONFIG.STORAGE_AUTH_KEY);
        window.location.href = 'login.html';
    }

    getCurrentUser() {
        try {
            const local = localStorage.getItem(AUTH_CONFIG.STORAGE_AUTH_KEY);
            const session = sessionStorage.getItem(AUTH_CONFIG.STORAGE_AUTH_KEY);
            const raw = local || session;
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    isAuthenticated() {
        return !!this.getCurrentUser();
    }

    checkAuth(redirectTarget = 'login.html') {
        if (!this.isAuthenticated()) {
            window.location.href = redirectTarget;
            return false;
        }
        return true;
    }

    redirectIfLoggedIn(redirectTarget = 'dashboard.html') {
        if (this.isAuthenticated()) {
            window.location.href = redirectTarget;
            return true;
        }
        return false;
    }

    updateProfile(updatedData) {
        try {
            const current = this.getAdminProfile();
            const merged = { ...current, ...updatedData };
            localStorage.setItem(AUTH_CONFIG.STORAGE_CREDS_KEY, JSON.stringify(merged));

            // Also update current active session if any
            const session = this.getCurrentUser();
            if (session) {
                const updatedSession = { ...session, ...updatedData };
                if (session.rememberMe) {
                    localStorage.setItem(AUTH_CONFIG.STORAGE_AUTH_KEY, JSON.stringify(updatedSession));
                } else {
                    sessionStorage.setItem(AUTH_CONFIG.STORAGE_AUTH_KEY, JSON.stringify(updatedSession));
                }
            }
            return { success: true, message: 'Admin profile updated successfully!' };
        } catch (e) {
            return { success: false, message: 'Failed to update profile: ' + e.message };
        }
    }

    changePassword(currentPassword, newPassword) {
        const admin = this.getAdminProfile();
        if (admin.password !== currentPassword) {
            return { success: false, message: 'Current password does not match!' };
        }
        if (!newPassword || newPassword.length < 5) {
            return { success: false, message: 'New password must be at least 5 characters long.' };
        }

        admin.password = newPassword;
        localStorage.setItem(AUTH_CONFIG.STORAGE_CREDS_KEY, JSON.stringify(admin));
        return { success: true, message: 'Password updated successfully! Please use new password next time.' };
    }
}

window.LMSAuth = new AuthService();
