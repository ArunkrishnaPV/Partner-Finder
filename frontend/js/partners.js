import { supabase } from './supabase-config.js';

let currentSessionToken = null;

supabase.auth.onAuthStateChange(async (event, session) => {
    if (session) {
        currentSessionToken = session.access_token;
        fetchMatches();
    } else {
        window.location.href = 'login.html';
    }
});

const applyBtn = document.getElementById('apply-filters');
const searchBtn = document.getElementById('search-btn');

applyBtn?.addEventListener('click', fetchMatches);
searchBtn?.addEventListener('click', fetchMatches);

async function fetchMatches() {
    if(!currentSessionToken) return;
    
    const container = document.getElementById('results-container');
    const countEl = document.getElementById('results-count');
    
    container.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-muted);">Finding compatible partners...</div>';
    
    const dept = document.getElementById('filter-dept').value;
    const year = document.getElementById('filter-year').value;
    const type = document.getElementById('filter-type').value;
    const q = document.getElementById('search-query').value;

    let url = new URL('http://127.0.0.1:5000/api/partners');
    if (dept) url.searchParams.append('dept', dept);
    if (year) url.searchParams.append('year', year);
    if (type) url.searchParams.append('type', type);
    if (q) url.searchParams.append('q', q);

    try {
        const response = await fetch(url.toString(), {
            headers: { 'Authorization': `Bearer ${currentSessionToken}` }
        });

        if (!response.ok) throw new Error("Failed to fetch matches");
        
        const data = await response.json();
        renderMatches(data, container, countEl);
    } catch (error) {
        container.innerHTML = `<div class="auth-error" style="display:block;">${error.message}</div>`;
        countEl.textContent = '';
    }
}

function renderMatches(matches, container, countEl) {
    if (!matches || matches.length === 0) {
        countEl.textContent = '0 results';
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--border-radius-lg);">
                <h4>No partners found</h4>
                <p style="color: var(--text-secondary); margin-top: 8px;">Try adjusting your filters or expanding your search.</p>
            </div>
        `;
        return;
    }

    countEl.textContent = `${matches.length} result${matches.length !== 1 ? 's' : ''}`;
    
    let html = '';
    matches.forEach(m => {
        let scoreClass = 'score-low';
        if (m.score >= 80) scoreClass = 'score-excellent';
        else if (m.score >= 60) scoreClass = 'score-good';
        else if (m.score >= 40) scoreClass = 'score-moderate';

        const subjectTags = (m.commonSubjects || []).map(s => `<span class="tag">${s}</span>`).join('');
        const skillTags = (m.commonSkills || []).map(s => `<span class="tag">${s}</span>`).join('');

        html += `
            <div class="match-card">
                <div class="match-details">
                    <h3 style="margin-bottom: 4px; font-size: 18px;">${m.name}</h3>
                    <p style="font-size: 14px; margin-bottom: 12px; font-weight: 500;">${m.department || 'Unknown Dept'} • Year ${m.year || '?'}</p>
                    
                    <div style="margin-bottom: 8px;">
                        <span style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Shared Subjects:</span>
                        ${subjectTags || '<span style="font-size: 13px; color: var(--text-secondary);">None</span>'}
                    </div>
                    
                    <div>
                        <span style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Shared Skills:</span>
                        ${skillTags || '<span style="font-size: 13px; color: var(--text-secondary);">None</span>'}
                    </div>
                    
                    <div style="margin-top: 16px;">
                        <a href="partner-profile.html?id=${m.uid}" class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px;">View Profile</a>
                        <button class="btn btn-primary" style="padding: 6px 12px; font-size: 12px; margin-left: 8px;">Send Request</button>
                    </div>
                </div>
                
                <div class="match-score">
                    <span class="score-badge ${scoreClass}">${m.score}% ${m.label}</span>
                    <p style="font-size: 12px; color: var(--text-muted); margin-top: 8px; text-align: right; max-width: 150px;">
                        ${m.explanation || 'Matches based on your profile.'}
                    </p>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}
