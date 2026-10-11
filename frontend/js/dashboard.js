import { supabase } from './supabase-config.js';

const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.href = 'login.html';
    });
}

supabase.auth.onAuthStateChange(async (event, session) => {
    if (session) {
        document.getElementById('user-greeting').textContent = `Hello, ${session.user.user_metadata.name || 'Student'}`;
        loadDashboardData(session.access_token);
    } else {
        window.location.href = 'login.html';
    }
});

async function loadDashboardData(token) {
    try {
        const profileRes = await fetch('http://127.0.0.1:5000/api/profile/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (profileRes.ok) {
            const data = await profileRes.json();
            const pct = data.profileComplete || 0;
            document.getElementById('profile-pct').textContent = `${pct}%`;
            document.getElementById('profile-progress').style.width = `${pct}%`;
        }

        const matchesContainer = document.getElementById('top-matches');
        matchesContainer.innerHTML = '<p class="text-muted" style="font-size:14px;">Use Find Partners to discover your matches.</p>';

        import('./notifications.js').then(module => {
            module.fetchNotifications(token);
        });
        
        document.getElementById('recent-connections').innerHTML = '<p class="text-muted" style="font-size:14px;">No connections yet.</p>';
        
    } catch (e) {
        console.error("Error loading dashboard", e);
    }
}
