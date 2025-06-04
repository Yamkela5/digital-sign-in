// Global variables for charts and data

const elements = {
  // Header elements
  currentTime: document.getElementById('current-time'),
  headerUsername: document.getElementById('header-username'),
  headerAvatar: document.getElementById('header-avatar'),
  headerProfileImage: document.getElementById('header-profile-image'),
}
let chartData = {
    daily: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        present: [40, 45, 42, 40, 35],
        absent: [5, 7, 8, 10, 15],
        late: [10, 5, 10, 10, 10]
    },
    weekly: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        present: [200, 210, 190, 205],
        absent: [30, 25, 40, 35],
        late: [20, 15, 20, 10]
    },
    monthly: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        present: [800, 820, 810, 790, 805, 815],
        absent: [120, 110, 130, 140, 125, 115],
        late: [80, 70, 90, 85, 75, 70]
    }
};


let attendanceChart = null;
let currentChartPeriod = 'daily';

// Global modal functions
window.showAddCandidateModal = function() {
    console.log('showAddCandidateModal called globally');
    window.showModal('addCandidateModal');
};


window.showQRCode = function() {
    console.log('showQRCode called globally');
    window.showModal('qrModal');
};

window.refreshData = function() {
    console.log('refreshData called globally');
    window.showToast('Data refreshed successfully!', 'success');
    // In a real app, you would fetch fresh data from the server here
};

// Generic modal functions
window.showModal = function(modalId) {
    console.log('Showing modal:', modalId);
    const modal = document.getElementById(modalId);
    if (!modal) {
        console.error(`Modal with ID ${modalId} not found`);
        return;
    }
    console.log('Before removing hidden class:', modal.className);
    modal.classList.remove('hidden');
    console.log('After removing hidden class:', modal.className);
    document.body.classList.add('modal-open');
};

window.hideModal = function(modalId) {
    console.log('Hiding modal:', modalId);
    const modal = document.getElementById(modalId);
    if (!modal) {
        console.error(`Modal with ID ${modalId} not found`);
        return;
    }
    modal.classList.add('hidden');
    document.body.classList.remove('modal-open');
};

// Toast notification function
window.showToast = function(message, type = 'info') {
    console.log('Showing toast:', message, type);
    const toastContainer = document.querySelector('.toast-container') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <span>${message}</span>
        </div>
    `;
    toastContainer.appendChild(toast);
    
    // Auto-remove toast after 3 seconds
    setTimeout(() => {
        toast.classList.add('toast-hide');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

// Helper function to create toast container if it doesn't exist
function createToastContainer() {
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
}

// Handle adding a new candidate with automatic authentication user creation
async function handleAddCandidate(e) {
    e.preventDefault();
    
    // Get form values
    const nameInput = document.getElementById('candidateName');
    const cohortInput = document.getElementById('candidateCohort');
    const emailInput = document.getElementById('candidateEmail');
    const mobileInput = document.getElementById('candidateMobile');
    const passwordInput = document.getElementById('candidatePassword');
    
    if (!nameInput || !cohortInput || !emailInput || !mobileInput || !passwordInput) {
        console.error("Candidate form elements not found");
        window.showToast('Form elements not found. Please try again.', 'error');
        return;
    }
    
    const name = nameInput.value.trim();
    const cohort = cohortInput.value.trim();
    const email = emailInput.value.trim();
    const mobile = mobileInput.value.trim();
    const password = passwordInput.value.trim();
    
    // Validate inputs
    if (!name || !cohort || !email || !mobile || !password) {
        window.showToast('Please fill in all fields.', 'error');
        return;
    }

    try {
        // Check if supabase is available
        if (!window.supabase) {
            console.error("Supabase client not available");
            window.showToast('Database connection not available. Please try again later.', 'error');
            return;
        }
        
        // 1. First create the authentication user
        console.log('Creating authentication user for:', email);
        const { data: authData, error: authError } = await window.supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: name,
                    cohort: cohort
                }
            }
        });

        if (authError) {
            console.error('Auth error:', authError);
            window.showToast('Error creating user: ' + authError.message, 'error');
            return;
        }
        
        console.log('Authentication user created successfully:', authData.user.id);

        // 2. Then add the user to your candidates table
        const { data, error } = await window.supabase
            .from('candidates')
            .insert([{ 
                full_name: name, 
                cohort: cohort, 
                email: email, 
                mobile: mobile,
                auth_id: authData.user.id  // Link to the auth user
            }]);

        if (error) {
            console.error('Insert error:', error);
            window.showToast('Error adding candidate: ' + error.message, 'error');
            return;
        }

        // Success handling
        console.log('Candidate added successfully to database');
        window.showToast(`${name} added successfully`, 'success');
        document.getElementById('addCandidateForm').reset();
        window.hideModal('addCandidateModal');
        
    } catch (err) {
        console.error('Unexpected error:', err);
        window.showToast('Unexpected error adding candidate. Please try again.', 'error');
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded - initializing application');
    
    // Initialize Lucide icons
    if (window.lucide) {
        console.log('Lucide icons initialized');
        window.lucide.createIcons();
    } else {
        console.warn('Lucide library not found');
    }
    
    // Load admin profile
    loadAdminProfile();
    
    // Check if all required global functions are available
    console.log('Checking global functions availability:');
    console.log('showAddCandidateModal:', typeof window.showAddCandidateModal);
    console.log('showQRCode:', typeof window.showQRCode);
    console.log('refreshData:', typeof window.refreshData);
    console.log('showModal:', typeof window.showModal);
    console.log('hideModal:', typeof window.hideModal);
    console.log('showToast:', typeof window.showToast);
    
    // Initialize event listeners
    console.log('Initializing event listeners');
    initEventListeners();
    
    // Initialize charts
    console.log('Initializing charts');
    initCharts();
});

// Load admin profile from session storage
function loadAdminProfile() {
    try {
        const userProfileStr = sessionStorage.getItem('userProfile');
        if (userProfileStr) {
            const userProfile = JSON.parse(userProfileStr);
            const adminNameElement = document.getElementById('adminName');
            if (adminNameElement && userProfile.full_name) {
                adminNameElement.textContent = userProfile.full_name;
                console.log('Admin profile loaded:', userProfile.full_name);
            }
        }
    } catch (err) {
        console.error('Error loading admin profile:', err);
    }
}

// Initialize all event listeners
function initEventListeners() {
    // Sidebar navigation
    const navButtons = document.querySelectorAll('.sidebar-nav button');
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            console.log('Sidebar button clicked:', this.textContent);
            // In a real app, you would handle navigation here
        });
    });
    console.log('Sidebar navigation listeners attached');
    
    // Logout button
    const logoutButton = document.querySelector('button:contains("Log Out")');
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            console.log('Logout button clicked');
            sessionStorage.clear();
            window.location.href = 'Login-page.html';
        });
        console.log('Logout button listener attached');
    }
    
    // Add candidate button
    const addCandidateButton = document.querySelector('button:contains("Add Candidate")');
    if (addCandidateButton) {
        addCandidateButton.addEventListener('click', function() {
            console.log('Add candidate button clicked');
            window.showAddCandidateModal();
        });
        console.log('Add candidate button listener attached');
    }
    
    // Show QR code button
    const showQRButton = document.querySelector('button:contains("Show QR code")');
    if (showQRButton) {
        showQRButton.addEventListener('click', function() {
            console.log('Show QR button clicked');
            window.showQRCode();
        });
        console.log('Show QR button listener attached');
    }
    
    // Refresh data button
    const refreshButton = document.querySelector('button:contains("Refresh Data")');
    if (refreshButton) {
        refreshButton.addEventListener('click', function() {
            console.log('Refresh data button clicked');
            window.refreshData();
        });
        console.log('Refresh data button listener attached');
    }
    
    // Chart period tabs
    const chartTabs = document.querySelectorAll('.chart-tab');
    chartTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const period = this.getAttribute('data-period');
            if (period) {
                updateChart(period);
                
                // Update active tab
                chartTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
    
    // Modal close buttons
    document.querySelectorAll('.modal .close-button').forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                window.hideModal(modal.id);
            }
        });
    });
    
    // Add candidate form submission
    const addCandidateForm = document.getElementById('addCandidateForm');
    if (addCandidateForm) {
        addCandidateForm.addEventListener('submit', handleAddCandidate);
    }
    
    // Cancel buttons in modals
    document.querySelectorAll('.modal button:contains("Cancel")').forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                window.hideModal(modal.id);
            }
        });
    });
}

// Initialize charts
function initCharts() {
    const ctx = document.getElementById('attendanceChart');
    if (!ctx) {
        console.error('Chart canvas not found');
        return;
    }
    
    attendanceChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartData.daily.labels,
            datasets: [
                {
                    label: 'Present',
                    data: chartData.daily.present,
                    backgroundColor: '#10b981',
                    borderColor: '#10b981',
                    borderWidth: 1
                },
                {
                    label: 'Absent',
                    data: chartData.daily.absent,
                    backgroundColor: '#ef4444',
                    borderColor: '#ef4444',
                    borderWidth: 1
                },
                {
                    label: 'Late',
                    data: chartData.daily.late,
                    backgroundColor: '#f59e0b',
                    borderColor: '#f59e0b',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
    
    console.log('Attendance chart initialized');
}

// Update chart with new period data
function updateChart(period) {
    if (!attendanceChart || !chartData[period]) {
        console.error('Chart or data not available');
        return;
    }
    
    currentChartPeriod = period;
    
    attendanceChart.data.labels = chartData[period].labels;
    attendanceChart.data.datasets[0].data = chartData[period].present;
    attendanceChart.data.datasets[1].data = chartData[period].absent;
    attendanceChart.data.datasets[2].data = chartData[period].late;
    
    attendanceChart.update();
    console.log('Chart updated to', period);
}

// Helper function for querySelector with contains text
Document.prototype.querySelector = (function(querySelector) {
    return function(selector) {
        if (selector.includes(':contains(')) {
            const match = selector.match(/:contains\("([^"]+)"\)/);
            if (match) {
                const text = match[1];
                const baseSelector = selector.replace(/:contains\("[^"]+"\)/, '');
                const elements = Array.from(this.querySelectorAll(baseSelector));
                return elements.find(el => el.textContent.includes(text)) || null;
            }
        }
        return querySelector.call(this, selector);
    };
})(Document.prototype.querySelector);

// Helper function for querySelectorAll with contains text
Document.prototype.querySelectorAll = (function(querySelectorAll) {
    return function(selector) {
        if (selector.includes(':contains(')) {
            const match = selector.match(/:contains\("([^"]+)"\)/);
            if (match) {
                const text = match[1];
                const baseSelector = selector.replace(/:contains\("[^"]+"\)/, '');
                const elements = Array.from(querySelectorAll.call(this, baseSelector));
                return elements.filter(el => el.textContent.includes(text));
            }
        }
        return querySelectorAll.call(this, selector);
    };
})(Document.prototype.querySelectorAll);
