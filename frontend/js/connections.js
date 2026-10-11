import { supabase } from './supabase-config.js';
import { API_BASE_URL } from './config.js';

let currentSessionToken = null;

supabase.auth.onAuthStateChange(async (event, session) => {
    if (session) {
        currentSessionToken = session.access_token;
        fetchConnections();
    } else {
        window.location.href = 'login.html';
    }
});

async function fetchConnections() {
    if (!currentSessionToken) return;
    const container = document.getElementById('connections-container');
    container.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-muted);">Loading connections...</div>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/connections`, {
            headers: { 'Authorization': `Bearer ${currentSessionToken}` }
        });

        if (!response.ok) throw new Error("Failed to fetch connections");
        
        const data = await response.json();
        renderConnections(data, container);
    } catch (error) {
        container.innerHTML = `<div class="auth-error" style="display:block;">${error.message}</div>`;
    }
}

function renderConnections(connections, container) {
    if (!connections || connections.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--border-radius-lg);">
                <p style="color: var(--text-secondary); margin-top: 8px;">You don't have any connections yet.</p>
                <a href="find-partners.html" class="btn btn-primary" style="margin-top: 16px;">Find Partners</a>
            </div>
        `;
        return;
    }

    let html = '';
    connections.forEach(conn => {
        html += `
            <div class="card" style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h3 style="margin-bottom: 4px;">${conn.partnerName}</h3>
                    <p style="font-size: 14px; color: var(--text-secondary); margin-bottom: 0;">Connected since ${new Date(conn.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                    <a href="partner-profile.html?id=${conn.partnerId}" class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px;">View Profile</a>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}
