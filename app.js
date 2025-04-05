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
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`Failed to fetch candidates: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Received candidates data:', data);
        
        if (!Array.isArray(data)) {
            console.error('Received non-array data:', data);
            throw new Error('Invalid data format received from server');
        }
        
        if (data.length === 0) {
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

// Show a specific page
function showPage(pageId) {
    console.log('Showing page:', pageId);
    
    // Hide all pages
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    // Show the target page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    } else {
        console.error('Page not found:', pageId);
    }
    
    // Update active link
    navLinks.forEach(link => {
        if (link.getAttribute('data-page') === pageId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Navigation
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetPage = link.getAttribute('data-page');
        
        if (targetPage) {
            showPage(targetPage);
        } else {
            console.error('No data-page attribute found on link:', link);
        }
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
    console.log('Displaying candidates:', candidates);
    
    if (!candidates || !Array.isArray(candidates) || candidates.length === 0) {
        console.error('Invalid candidates data:', candidates);
        candidatesContainer.innerHTML = '<p class="error">No candidates available. Please try again later.</p>';
        return;
    }
    
    candidatesContainer.innerHTML = '';
    
    // Calculate total votes for percentage
    const totalVotes = candidates.reduce((sum, candidate) => sum + (candidate.voteCount || 0), 0);
    console.log('Total votes:', totalVotes);
    totalVotesElement.textContent = totalVotes;
    
    candidates.forEach(candidate => {
        console.log('Creating card for candidate:', candidate);
        
        if (!candidate || typeof candidate !== 'object') {
            console.error('Invalid candidate data:', candidate);
            return;
        }
        
        // Calculate percentage
        const percentage = totalVotes > 0 ? ((candidate.voteCount || 0) / totalVotes * 100).toFixed(1) : 0;
        
        const candidateCard = document.createElement('div');
        candidateCard.className = 'candidate-card';
        candidateCard.innerHTML = `
            <div class="candidate-info">
                <h3>${candidate.name || 'Unknown Candidate'}</h3>
                <div class="vote-stats">
                    <span class="vote-count">${candidate.voteCount || 0} votes</span>
                    <span class="vote-percentage">${percentage}%</span>
                </div>
                <div class="progress-container">
                    <div class="progress-bar" style="width: ${percentage}%"></div>
                </div>
            </div>
            <button class="vote-button ${hasVoted() ? 'voted' : ''}" 
                    onclick="castVote(${candidate.id})" 
                    ${hasVoted() ? 'disabled' : ''}>
                <span class="button-text">${hasVoted() ? 'Already Voted' : 'Vote Now'}</span>
                <span class="button-icon">${hasVoted() ? '✓' : '→'}</span>
            </button>
        `;
        
        candidatesContainer.appendChild(candidateCard);
    });
}

// Update vote buttons when user has voted
function updateVoteButtons() {
    if (hasVoted()) {
        document.querySelectorAll('.vote-button').forEach(button => {
            button.disabled = true;
            button.classList.add('voted');
            const buttonText = button.querySelector('.button-text');
            const buttonIcon = button.querySelector('.button-icon');
            if (buttonText) buttonText.textContent = 'Already Voted';
            if (buttonIcon) buttonIcon.textContent = '✓';
        });
    }
}

// Cast vote function
async function castVote(candidateId) {
    const voterEmail = getVoterEmail();
    if (!voterEmail) {
        showMessage(voteMessage, 'Please register first with your college email', 'error');
        return;
    }
    
    // Check if user has already voted
    if (hasVoted()) {
        showMessage(voteMessage, 'You have already voted from this device!', 'error');
        return;
    }
    
    const deviceId = getDeviceId();
    console.log('Casting vote:', { candidateId, voterEmail, deviceId });

    try {
        const response = await fetch(`${API_URL}/vote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                candidateId,
                voterEmail,
                deviceId
            }),
        });

        const data = await response.json();
        console.log('Vote response:', data);
        
        if (response.ok) {
            showMessage(voteMessage, data.message, 'success');
            // Mark as voted
            markAsVoted(voterEmail);
            // Update vote buttons
            updateVoteButtons();
            // Reload candidates to update vote counts
            const updatedCandidates = await loadCandidatesData();
            displayCandidates(updatedCandidates);
        } else {
            showMessage(voteMessage, data.message || 'Error casting vote', 'error');
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

// Initialize app
async function initializeApp() {
    console.log('Initializing app...');
    try {
        // Load candidates data
        const candidates = await loadCandidatesData();
        if (candidates && candidates.length > 0) {
            displayCandidates(candidates);
        } else {
            console.error('No candidates data available');
            showMessage(voteMessage, 'No candidates available', 'error');
        }

        // Check if user has voted
        if (hasVoted()) {
            console.log('User has already voted');
            // Update vote buttons
            updateVoteButtons();
            // Show message
            showMessage(voteMessage, 'You have already voted from this device!', 'info');
        } else {
            console.log('User has not voted yet');
        }
    } catch (error) {
        console.error('Error initializing app:', error);
        showMessage(voteMessage, 'Error loading candidates. Please try again later.', 'error');
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing application...');
    
    // Set up navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPage = link.getAttribute('data-page');
            
            if (targetPage) {
                showPage(targetPage);
            } else {
                console.error('No data-page attribute found on link:', link);
            }
        });
    });
    
    // Set up vote form if it exists
    const voteForm = document.getElementById('vote-form');
    if (voteForm) {
        voteForm.addEventListener('submit', handleVoteSubmit);
    } else {
        console.log('Vote form not found - using direct button clicks instead');
    }
    
    // Initialize the application
    initializeApp();
}); 