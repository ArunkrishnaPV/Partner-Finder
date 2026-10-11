import { supabase } from './supabase-config.js';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const times = ['morning', 'afternoon', 'evening'];

const grid = document.getElementById('availability-grid');
if (grid) {
    days.forEach(day => {
        const rowLabel = document.createElement('div');
        rowLabel.className = 'avail-row-label';
        rowLabel.textContent = day;
        grid.appendChild(rowLabel);

        times.forEach(time => {
            const cell = document.createElement('div');
            cell.className = 'avail-cell';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `avail-${day.toLowerCase()}-${time}`;
            checkbox.name = 'availability';
            checkbox.value = `${day.toLowerCase()}-${time}`;
            cell.appendChild(checkbox);
            grid.appendChild(cell);
        });
    });
}

const form = document.getElementById('profile-form');
const messageDiv = document.getElementById('form-message');

function showMessage(msg, isError = false) {
    if(!messageDiv) return;
    messageDiv.textContent = msg;
    messageDiv.style.display = 'block';
    messageDiv.style.backgroundColor = isError ? 'rgba(211, 47, 47, 0.1)' : 'rgba(56, 142, 60, 0.1)';
    messageDiv.style.color = isError ? 'var(--error-color)' : 'var(--success-color)';
}

let currentSession = null;

supabase.auth.onAuthStateChange(async (event, session) => {
    if (session) {
        currentSession = session;
        try {
            const res = await fetch('http://127.0.0.1:5000/api/profile/me', {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            if (res.ok) {
                const data = await res.json();
                populateForm(data);
            }
        } catch (e) {
            console.log("Could not load profile", e);
        }
    } else {
        window.location.href = 'login.html';
    }
});

function populateForm(data) {
    if(!data) return;
    document.getElementById('college').value = data.college || '';
    document.getElementById('department').value = data.department || '';
    document.getElementById('year').value = data.year || '';
    document.getElementById('partnerType').value = data.partnerType || '';
    
    document.getElementById('subjects').value = (data.subjects || []).join(', ');
    document.getElementById('skills').value = (data.skills || []).join(', ');
    document.getElementById('interests').value = (data.interests || []).join(', ');

    if (data.availability) {
        for (const [day, slots] of Object.entries(data.availability)) {
            slots.forEach(slot => {
                const el = document.getElementById(`avail-${day}-${slot}`);
                if (el) el.checked = true;
            });
        }
    }
}

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentSession) return;

        const subjects = document.getElementById('subjects').value.split(',').map(s => s.trim()).filter(Boolean);
        const skills = document.getElementById('skills').value.split(',').map(s => s.trim()).filter(Boolean);
        const interests = document.getElementById('interests').value.split(',').map(s => s.trim()).filter(Boolean);

        const availability = {};
        days.forEach(day => {
            const dayLower = day.toLowerCase();
            availability[dayLower] = [];
            times.forEach(time => {
                const el = document.getElementById(`avail-${dayLower}-${time}`);
                if (el && el.checked) {
                    availability[dayLower].push(time);
                }
            });
        });

        const profileData = {
            college: document.getElementById('college').value,
            department: document.getElementById('department').value,
            year: document.getElementById('year').value,
            partnerType: document.getElementById('partnerType').value,
            subjects,
            skills,
            interests,
            availability
        };

        try {
            const res = await fetch('http://127.0.0.1:5000/api/profile/me', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentSession.access_token}`
                },
                body: JSON.stringify(profileData)
            });

            if (res.ok) {
                showMessage("Profile updated successfully!");
                setTimeout(() => window.location.href = 'dashboard.html', 1500);
            } else {
                const err = await res.json();
                showMessage(err.error || "Failed to update profile", true);
            }
        } catch (error) {
            showMessage(error.message, true);
        }
    });
}
