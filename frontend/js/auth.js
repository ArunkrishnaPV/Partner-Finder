import { supabase } from './supabase-config.js';

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const forgotPasswordBtn = document.getElementById('forgot-password');
const errorDiv = document.getElementById('auth-error');

function showError(message) {
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    } else {
        alert(message);
    }
}

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (supabase.supabaseUrl === "YOUR_SUPABASE_URL") {
            showError("Authentication is running in stub mode. Please configure Supabase credentials.");
            return;
        }

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { name }
                }
            });
            if (error) throw error;
            
            // Check if session was returned immediately (happens when email confirmation is disabled)
            const token = data?.session?.access_token;
            if (!token) {
                // If email confirmation is required or session is not active yet, prompt login
                window.location.href = 'login.html';
                return;
            }

            const response = await fetch('http://127.0.0.1:5000/api/profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, email })
            });
            
            if (response.ok || response.status === 400) {
                // 400 means profile already exists, proceed to profile setup
                window.location.href = 'profile.html';
            } else {
                const errData = await response.json().catch(() => ({}));
                showError(errData.error || "Account created, but backend failed to initialize profile.");
            }
        } catch (error) {
            showError(error.message);
        }
    });
}

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (supabase.supabaseUrl === "YOUR_SUPABASE_URL") {
            showError("Authentication is running in stub mode. Please configure Supabase credentials.");
            return;
        }

        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;

            // Ensure profile exists in database
            if (data?.session?.access_token) {
                await fetch('http://127.0.0.1:5000/api/profile', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${data.session.access_token}`
                    },
                    body: JSON.stringify({
                        name: data.user.user_metadata?.name || email.split('@')[0],
                        email: email
                    })
                }).catch(() => {});
            }

            window.location.href = 'dashboard.html';
        } catch (error) {
            showError(error.message);
        }
    });
}

if (forgotPasswordBtn) {
    forgotPasswordBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        if (!email) {
            showError("Please enter your email to reset password.");
            return;
        }
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email);
            if(error) throw error;
            alert("Password reset email sent!");
        } catch (error) {
            showError(error.message);
        }
    });
}
