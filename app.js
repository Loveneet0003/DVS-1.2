// API Configuration
const API_URL = config.getApiUrl();
console.log('Using API URL:', API_URL);

// DOM Elements
const navLinks = document.querySelectorAll('.nav-links a');
const pages = document.querySelectorAll('.page');
const registerForm = document.getElementById('register-form');
const registerMessage = document.getElementById('register-message');
const voteMessage = document.getElementById('vote-message');
const candidatesContainer = document.getElementById('candidates-container');
const resultsContainer = document.getElementById('results-container');
const totalVotesElement = document.getElementById('total-votes');

// Voting status tracking
const VOTED_KEY = 'hasVoted';
const VOTER_EMAIL_KEY = 'voterEmail';
const DEVICE_ID_KEY = 'deviceId';

// Generate a unique device ID
function generateDeviceId() {
    // Check if we already have a device ID
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    
    if (!deviceId) {
        // Generate a random device ID
        deviceId = 'device_' + Math.random().toString(36).substring(2, 15) + 
                  Math.random().toString(36).substring(2, 15);
        
        // Save it to localStorage
        localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    
    return deviceId;
}

// Get device ID
function getDeviceId() {
    return localStorage.getItem(DEVICE_ID_KEY) || generateDeviceId();
}

// Check if user has already voted
function hasVoted() {
    return localStorage.getItem(VOTED_KEY) === 'true';
}

// Save voting status
function markAsVoted(email) {
    localStorage.setItem(VOTED_KEY, 'true');
    localStorage.setItem(VOTER_EMAIL_KEY, email);
}

// Get voter email
function getVoterEmail() {
    return localStorage.getItem(VOTER_EMAIL_KEY);
}

// Candidates data
let candidates = [];

// Load candidates from the backend
async function loadCandidatesData() {
    try {
        console.log('Fetching candidates from API...');
        console.log('API URL:', `${API_URL}/candidates`);
        
        // Add timeout to fetch request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(`${API_URL}/candidates`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            signal: controller.signal
        }).catch(error => {
            console.error('Network error:', error);
            if (error.name === 'AbortError') {
                throw new Error('Request timed out. Please check your internet connection.');
            }
            throw new Error(`Network error: ${error.message}`);
        });
        
        clearTimeout(timeoutId);
        console.log('Response status:', response.status);
        
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
            console.log('Init response status:', initResponse.status);
            
            if (!initResponse.ok) {
                throw new Error(`Failed to check initialization: ${initResponse.status}`);
            }
            
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
            console.log('Reset response status:', resetResponse.status);
            
            if (!resetResponse.ok) {
                throw new Error(`Failed to reset candidates: ${resetResponse.status}`);
            }
            
            const resetData = await resetResponse.json();
            console.log('Reset response:', resetData);
            
            // Try one more time to get candidates
            const finalResponse = await fetch(`${API_URL}/candidates`);
            if (!finalResponse.ok) {
                throw new Error(`Failed to fetch candidates after reset: ${finalResponse.status}`);
            }
            
            const finalData = await finalResponse.json();
            console.log('Final candidates data:', finalData);
            
            if (Array.isArray(finalData) && finalData.length > 0) {
                candidates = finalData;
                return finalData;
            }
            
            throw new Error('Failed to initialize candidates after multiple attempts');
        }
        
        candidates = data;
        return data;
    } catch (error) {
        console.error('Error loading candidates:', error);
        showMessage(voteMessage, `Error loading candidates: ${error.message}`, 'error');
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
registerForm.addEventListener('submit', handleRegisterSubmit);

// Helper function to show messages
function showMessage(element, message, type) {
    element.textContent = message;
    element.className = `message ${type}`;
    
    // Hide message after 5 seconds
    setTimeout(() => {
        element.className = 'message';
    }, 5000);
}

// Handle registration form submission
async function handleRegisterSubmit(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    
    if (!email) {
        showMessage(registerMessage, 'Please enter your email address.', 'error');
        return;
    }
    
    // Check if user has already voted
    if (hasVoted()) {
        showMessage(registerMessage, 'You have already voted from this device!', 'error');
        return;
    }
    
    try {
        // Store email in localStorage
        localStorage.setItem(VOTER_EMAIL_KEY, email);
        showMessage(registerMessage, 'Registration successful! You can now vote.', 'success');
        
        // Switch to voting page
        showPage('vote');
    } catch (error) {
        console.error('Error during registration:', error);
        showMessage(registerMessage, 'Error during registration. Please try again.', 'error');
    }
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

// Check if user is registered
function checkRegistration() {
    const verifiedEmail = localStorage.getItem('verifiedEmail');
    if (!verifiedEmail) {
        showMessage(voteMessage, 'Please register first with your college email', 'error');
        return false;
    }
    return true;
}

// Handle vote submission
async function handleVoteSubmit(event) {
    event.preventDefault();
    
    // Check if user has already voted
    if (hasVoted()) {
        showMessage(voteMessage, 'You have already voted from this device!', 'error');
        return;
    }
    
    const selectedCandidate = document.querySelector('input[name="candidate"]:checked');
    if (!selectedCandidate) {
        showMessage(voteMessage, 'Please select a candidate to vote for.', 'error');
        return;
    }
    
    const candidateId = parseInt(selectedCandidate.value);
    const voterEmail = getVoterEmail();
    const deviceId = getDeviceId();
    
    if (!voterEmail) {
        showMessage(voteMessage, 'Please register with your email first.', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/vote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ candidateId, voterEmail, deviceId })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage(voteMessage, data.message, 'success');
            // Mark as voted in localStorage
            markAsVoted(voterEmail);
            // Update results
            updateResults();
        } else {
            showMessage(voteMessage, data.message, 'error');
        }
    } catch (error) {
        console.error('Error casting vote:', error);
        showMessage(voteMessage, 'Error casting vote. Please try again.', 'error');
    }
}

// Initialize the application
async function initializeApp() {
    try {
        // Load candidates data
        await loadCandidatesData();
        
        // Display candidates
        displayCandidates();
        
        // Update results
        updateResults();
        
        // Check if user has already voted
        if (hasVoted()) {
            // Disable voting form
            const voteForm = document.getElementById('vote-form');
            if (voteForm) {
                voteForm.style.opacity = '0.5';
                voteForm.style.pointerEvents = 'none';
                
                // Add a message
                const alreadyVotedMessage = document.createElement('div');
                alreadyVotedMessage.className = 'message error';
                alreadyVotedMessage.textContent = 'You have already voted from this device!';
                voteForm.parentNode.insertBefore(alreadyVotedMessage, voteForm);
            }
        }
    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Set up navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.target.getAttribute('href').substring(1);
            showPage(page);
        });
    });
    
    // Set up vote form
    const voteForm = document.getElementById('vote-form');
    if (voteForm) {
        voteForm.addEventListener('submit', handleVoteSubmit);
    }
    
    // Initialize the application
    initializeApp();
}); 