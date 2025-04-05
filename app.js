// API Configuration
const API_URL = config.getApiUrl();

// DOM Elements
const navLinks = document.querySelectorAll('.nav-links a');
const pages = document.querySelectorAll('.page');
const registerForm = document.getElementById('register-form');
const registerMessage = document.getElementById('register-message');
const voteMessage = document.getElementById('vote-message');
const candidatesContainer = document.getElementById('candidates-container');
const resultsContainer = document.getElementById('results-container');
const totalVotesElement = document.getElementById('total-votes');

// Candidates data
let candidates = [];

// Load candidates from the backend
async function loadCandidatesData() {
    try {
        console.log('Fetching candidates from API...');
        const response = await fetch(`${API_URL}/candidates`);
        if (!response.ok) {
            throw new Error(`Failed to fetch candidates: ${response.status}`);
        }
        const data = await response.json();
        console.log('Received candidates data:', data);
        
        // Ensure we have the correct candidate data
        if (!Array.isArray(data) || data.length === 0) {
            console.log('No candidates found, trying to initialize...');
            // If no candidates found, try to initialize them
            const initResponse = await fetch(`${API_URL}/check-init`);
            const initData = await initResponse.json();
            console.log('Initialization check response:', initData);
            
            if (initData.candidates && initData.candidates.length > 0) {
                console.log('Using initialized candidates');
                candidates = initData.candidates;
                return initData.candidates;
            }
            
            // If still no candidates, try to reset them
            console.log('Still no candidates, trying to reset...');
            const resetResponse = await fetch(`${API_URL}/reset-candidates`, {
                method: 'POST'
            });
            const resetData = await resetResponse.json();
            console.log('Reset response:', resetData);
            
            // Try one more time to get candidates
            const finalResponse = await fetch(`${API_URL}/candidates`);
            const finalData = await finalResponse.json();
            console.log('Final candidates data:', finalData);
            
            if (finalData && finalData.length > 0) {
                candidates = finalData;
                return finalData;
            }
            
            throw new Error('No candidates available after reset');
        }
        
        candidates = data;
        return data;
    } catch (error) {
        console.error('Error loading candidates:', error);
        showMessage(voteMessage, 'Error loading candidates. Please try again.', 'error');
        return [];
    }
}

// Navigation
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetPage = link.getAttribute('data-page');
        
        // Update active link
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        // Show target page
        pages.forEach(page => {
            if (page.id === targetPage) {
                page.classList.add('active');
            } else {
                page.classList.remove('active');
            }
        });
    });
});

// Feature buttons on home page
document.querySelectorAll('.btn[data-page]').forEach(button => {
    button.addEventListener('click', () => {
        const targetPage = button.getAttribute('data-page');
        const targetLink = document.querySelector(`.nav-links a[data-page="${targetPage}"]`);
        targetLink.click();
    });
});

// Registration Form
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    
    // Check if email contains @nith.ac.in
    if (email.includes('@nith.ac.in')) {
        // Store the verified email in localStorage
        localStorage.setItem('verifiedEmail', email);
        showMessage(registerMessage, 'Registration successful! You can now vote.', 'success');
    } else {
        showMessage(registerMessage, 'Please use a valid NIT Hamirpur email address (@nith.ac.in)', 'error');
    }
});

// Helper function to show messages
function showMessage(element, message, type) {
    element.textContent = message;
    element.className = `message ${type}`;
    
    // Hide message after 5 seconds
    setTimeout(() => {
        element.className = 'message';
    }, 5000);
}

// Check if user is registered
function checkRegistration() {
    const verifiedEmail = localStorage.getItem('verifiedEmail');
    if (!verifiedEmail) {
        showMessage(voteMessage, 'Please register first with your college email', 'error');
        return false;
    }
    return true;
}

// Load candidates
async function loadCandidates() {
    if (!checkRegistration()) return;
    
    try {
        const candidatesData = await loadCandidatesData();
        displayCandidates(candidatesData);
    } catch (error) {
        console.error('Error loading candidates:', error);
        showMessage(voteMessage, 'Error loading candidates. Please try again.', 'error');
    }
}

// Display candidates in the UI
function displayCandidates(candidates) {
    candidatesContainer.innerHTML = '';
    
    candidates.forEach(candidate => {
        const candidateCard = document.createElement('div');
        candidateCard.className = 'candidate-card';
        candidateCard.innerHTML = `
            <h3>${candidate.name}</h3>
            <p>Current Votes: ${candidate.voteCount}</p>
            <button class="btn primary" data-id="${candidate.id}">Vote</button>
        `;
        
        candidatesContainer.appendChild(candidateCard);
    });
    
    // Add event listeners to vote buttons
    document.querySelectorAll('.candidate-card button').forEach(button => {
        button.addEventListener('click', () => {
            const candidateId = parseInt(button.getAttribute('data-id'));
            castVote(candidateId);
        });
    });
}

// Cast vote function
async function castVote(candidateId) {
    const verifiedEmail = localStorage.getItem('verifiedEmail');
    if (!verifiedEmail) {
        showMessage(voteMessage, 'Please register first with your college email', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/vote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                candidateId,
                voterEmail: verifiedEmail
            }),
        });

        const data = await response.json();
        
        if (response.ok) {
            showMessage(voteMessage, data.message, 'success');
            // Reload candidates to update vote counts
            loadCandidates();
            // Update results if on results page
            if (document.getElementById('results').classList.contains('active')) {
                loadResults();
            }
        } else {
            showMessage(voteMessage, data.message, 'error');
        }
    } catch (error) {
        console.error('Error casting vote:', error);
        showMessage(voteMessage, 'Error casting vote. Please try again.', 'error');
    }
}

// Load and display results
async function loadResults() {
    try {
        const candidatesData = await loadCandidatesData();
        const total = candidatesData.reduce((sum, candidate) => sum + candidate.voteCount, 0);
        displayResults(candidatesData, total);
    } catch (error) {
        console.error('Error loading results:', error);
    }
}

// Display results in the UI
function displayResults(candidates, total) {
    resultsContainer.innerHTML = '';
    totalVotesElement.textContent = total;
    
    candidates.forEach(candidate => {
        const percentage = total > 0 ? (candidate.voteCount / total) * 100 : 0;
        const formattedPercentage = percentage.toFixed(1);
        
        const resultCard = document.createElement('div');
        resultCard.className = 'result-card';
        resultCard.innerHTML = `
            <h3>${candidate.name}</h3>
            <p>Votes: ${candidate.voteCount}</p>
            <div class="progress-container">
                <div class="progress-bar" data-candidate="${candidate.id}" style="width: ${percentage}%">
                    <span class="vote-percentage">${formattedPercentage}%</span>
                </div>
            </div>
        `;
        
        resultsContainer.appendChild(resultCard);
    });
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Load candidates when vote page is shown
    document.querySelector('a[data-page="vote"]').addEventListener('click', loadCandidates);
    
    // Load results when results page is shown
    document.querySelector('a[data-page="results"]').addEventListener('click', loadResults);
}); 