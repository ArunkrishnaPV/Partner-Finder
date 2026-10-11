import { supabase } from './supabase-config.js';

let currentSessionToken = null;
let currentTab = 'incoming';

supabase.auth.onAuthStateChange(async (event, session) => {
    if (session) {
        currentSessionToken = session.access_token;
        fetchRequests(currentTab);
    } else {
        window.location.href = 'login.html';
    }
});

const tabIncoming = document.getElementById('tab-incoming');
const tabOutgoing = document.getElementById('tab-outgoing');

tabIncoming?.addEventListener('click', () => {
    currentTab = 'incoming';
    tabIncoming.className = 'btn btn-primary';
    tabOutgoing.className = 'btn btn-secondary';
    fetchRequests('incoming');
});

tabOutgoing?.addEventListener('click', () => {
    currentTab = 'outgoing';
    tabOutgoing.className = 'btn btn-primary';
    tabIncoming.className = 'btn btn-secondary';
    fetchRequests('outgoing');
});

async function fetchRequests(type) {
    if(!currentSessionToken) return;
    
    const container = document.getElementById('requests-container');
    container.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-muted);">Loading requests...</div>';
    
    try {
        const response = await fetch(`http://127.0.0.1:5000/api/requests?type=${type}`, {
            headers: { 'Authorization': `Bearer ${currentSessionToken}` }
        });

        if (!response.ok) throw new Error("Failed to fetch requests");
        
        const data = await response.json();
        renderRequests(data, container, type);
    } catch (error) {
        container.innerHTML = `<div class="auth-error" style="display:block;">${error.message}</div>`;
    }
}

function renderRequests(requests, container, type) {
    if (!requests || requests.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--border-radius-lg);">
                <p style="color: var(--text-secondary); margin-top: 8px;">No ${type} requests found.</p>
            </div>
        `;
        return;
    }

    let html = '';
    requests.forEach(req => {
        html += `
            <div class="card" style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h3 style="margin-bottom: 4px;">${req.partnerName}</h3>
                    <p style="font-size: 14px; color: var(--text-secondary); margin-bottom: 0;">Status: <span style="font-weight:600; text-transform:capitalize;">${req.status}</span></p>
                </div>
                <div>
                    ${type === 'incoming' && req.status === 'pending' ? `
                        <button class="btn btn-primary" onclick="window.updateRequest('${req.id}', 'accepted')" style="margin-right: 8px; padding: 6px 12px; font-size: 12px;">Accept</button>
                        <button class="btn btn-secondary" onclick="window.updateRequest('${req.id}', 'rejected')" style="padding: 6px 12px; font-size: 12px;">Reject</button>
                    ` : ''}
                    ${type === 'outgoing' && req.status === 'pending' ? `
                        <button class="btn btn-secondary" onclick="window.updateRequest('${req.id}', 'withdrawn')" style="padding: 6px 12px; font-size: 12px;">Withdraw</button>
                    ` : ''}
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

window.updateRequest = async (id, status) => {
    try {
        const res = await fetch(`http://127.0.0.1:5000/api/requests/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentSessionToken}`
            },
            body: JSON.stringify({ status })
        });
        if(res.ok) fetchRequests(currentTab);
        else alert("Failed to update request");
    } catch(e) {
        console.error(e);
        alert(e.message);
    }
}
