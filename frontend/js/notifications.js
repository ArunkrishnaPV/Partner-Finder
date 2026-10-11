import { supabase } from './supabase-config.js';
import { API_BASE_URL } from './config.js';

let sessionToken = null;

supabase.auth.onAuthStateChange((event, session) => {
    if(session) sessionToken = session.access_token;
});

export async function fetchNotifications(token = null) {
    const list = document.getElementById('notifications-list');
    if (!list) return;

    const currentToken = token || sessionToken;
    if (!currentToken) return;
    
    try {
        const res = await fetch(`${API_BASE_URL}/api/notifications`, {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });
        
        if (!res.ok) throw new Error("Failed");
        
        const notifications = await res.json();
        
        if (notifications.length === 0) {
            list.innerHTML = '<li class="item-row"><div class="item-info"><p>No new notifications</p></div></li>';
            return;
        }

        let html = '';
        notifications.forEach(n => {
            const isUnread = !n.read;
            const style = isUnread ? 'font-weight: 600; color: var(--text-primary);' : 'color: var(--text-secondary);';
            
            html += `
                <li class="item-row" style="cursor: pointer;" onclick="window.markNotificationRead('${n.id}')">
                    <div class="item-info">
                        <h4 style="${style}">${n.title} ${isUnread ? '<span style="color:var(--accent-primary); font-size: 20px;">•</span>' : ''}</h4>
                        <p>${n.message}</p>
                    </div>
                </li>
            `;
        });
        list.innerHTML = html;
    } catch(e) {
        list.innerHTML = '<li class="item-row"><div class="item-info"><p>Error loading notifications.</p></div></li>';
    }
}

window.markNotificationRead = async (id) => {
    if(!sessionToken) return;
    try {
        const res = await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${sessionToken}` }
        });
        if(res.ok) fetchNotifications();
    } catch(e) {
        console.error(e);
    }
}
