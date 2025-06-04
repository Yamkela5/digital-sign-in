// Login page JavaScript - Fixed version
// Uses global window.supabase object instead of ES6 imports

// ✅ 2. Toast Notification
function createToast({ title, description, variant = 'success' }) {
    const toast = document.createElement('div');
    toast.className = `toast-container ${variant === 'destructive' ? 'toast-error' : 'toast-success'}`;
    toast.innerHTML = `
        <div class="toast-title">${title}</div>
        <div class="toast-description">${description}</div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// ✅ 3. Login Handler
async function handleLogin(email, password, button, spinner, buttonText) {
    if (!email || !password) {
        createToast({
            title: "Error",
            description: "Please enter both email and password",
            variant: "destructive"
        });
        return;
    }

    button.disabled = true;
    spinner.style.display = 'inline-block';
    buttonText.textContent = 'Logging in...';

    try {
      // Use window.supabase instead of client
      const { data, error } = await window.supabase.auth.signInWithPassword({ 
          email, 
          password 
      });
      
      if (error) throw error;

      // Fetch complete user profile including name from candidates table
      const { data: profile, error: profileError } = await window.supabase
        .from('candidates')
        .select('*')  // Select all fields including full_name
        .eq('email', email)
        .single();

      if (profileError) throw profileError;
      
      // Store the complete user profile in sessionStorage for use across pages
      sessionStorage.setItem('userProfile', JSON.stringify(profile));

      // Check if user is admin based on email prefix or role column if available
      const isAdmin = email.startsWith('admin') || (profile.role && profile.role.toLowerCase() === 'admin');
      
      console.log('Logged in as:', isAdmin ? 'admin' : 'user');
      console.log('User profile:', profile);

      createToast({
          title: "Login Successful",
          description: `Welcome, ${profile.full_name || email}! Redirecting...`
      });

      setTimeout(() => {
          if (isAdmin) {
              window.location.href = 'AdminDashboard.html';
          } else {
              window.location.href = 'facial-capture.html';
          }
      }, 1500);

    } catch (err) {
        console.error('Login error:', err.message);
        createToast({
            title: "Login Failed",
            description: err.message,
            variant: "destructive"
        });
    } finally {
        button.disabled = false;
        spinner.style.display = 'none';
        buttonText.textContent = 'Login';
    }
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Login page loaded');
    
    // ✅ 4. Desktop Login Form
    document.getElementById('desktop-login-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        handleLogin(
            document.getElementById('email').value,
            document.getElementById('password').value,
            document.getElementById('desktop-login-button'),
            document.getElementById('desktop-spinner'),
            document.getElementById('desktop-button-text')
        );
    });

    // ✅ 5. Mobile Login Form
    document.getElementById('mobile-login-form-element')?.addEventListener('submit', (e) => {
        e.preventDefault();
        handleLogin(
            document.getElementById('mobileEmail').value,
            document.getElementById('mobilePassword').value,
            document.getElementById('mobile-submit-button'),
            document.getElementById('mobile-spinner'),
            document.getElementById('mobile-button-text')
        );
    });
    
    // Mobile view navigation
    document.getElementById('mobile-login-button')?.addEventListener('click', () => {
        document.getElementById('mobile-buttons').style.display = 'none';
        document.getElementById('mobile-login-form').style.display = 'block';
    });
    
    document.getElementById('mobile-scan-button')?.addEventListener('click', () => {
        document.getElementById('mobile-buttons').style.display = 'none';
        document.getElementById('scan-screen').style.display = 'block';
    });
    
    document.getElementById('back-from-login')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('mobile-login-form').style.display = 'none';
        document.getElementById('mobile-buttons').style.display = 'flex';
    });
    
    document.getElementById('back-from-scan')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('scan-screen').style.display = 'none';
        document.getElementById('mobile-buttons').style.display = 'flex';
    });
});
