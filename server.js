const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Configure CORS
app.use(cors({
    origin: '*', // Allow all origins for testing
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Add a health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// MongoDB connection
if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI environment variable is not set!');
    process.exit(1);
}

const uri = process.env.MONGODB_URI;
console.log('MongoDB URI format check:', {
    hasProtocol: uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://'),
    hasUsername: uri.includes('@'),
    hasHostname: uri.includes('.mongodb.net'),
    length: uri.length
});

// Validate URI format
if (!uri.includes('.mongodb.net')) {
    console.error('Invalid MongoDB URI format. Must include hostname, domain name, and TLD');
    console.error('Expected format: mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority');
    process.exit(1);
}

console.log('Attempting to connect to MongoDB...');
mongoose.connect(uri, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000 // Timeout after 5s instead of 30s
}).then(() => {
    console.log('Successfully connected to MongoDB.');
}).catch(err => {
    console.error('MongoDB connection error details:', {
        name: err.name,
        message: err.message,
        code: err.code,
        uri: uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') // Hide credentials in logs
    });
    process.exit(1);
});

const connection = mongoose.connection;
connection.once('open', () => {
    console.log("MongoDB database connection established successfully");
});

// Define Vote Schema
const voteSchema = new mongoose.Schema({
    candidateId: { type: Number, required: true },
    voterEmail: { type: String, required: true },
    deviceId: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

// Create a compound index to ensure one vote per email and device
voteSchema.index({ voterEmail: 1, deviceId: 1 }, { unique: true });

const Vote = mongoose.model('Vote', voteSchema);

// Define Candidate Schema
const candidateSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    voteCount: { type: Number, default: 0 }
});

const Candidate = mongoose.model('Candidate', candidateSchema);

// Initialize candidates if they don't exist
async function initializeCandidates() {
    const candidates = [
        { id: 1, name: "ARVIND MEEENA", voteCount: 0 },
        { id: 2, name: "RUDRA PRATAP", voteCount: 0 },
        { id: 3, name: "IVAN SHARMA", voteCount: 0 }
    ];

    try {
        // First, check if candidates exist
        const existingCandidates = await Candidate.find({});
        console.log('Existing candidates:', existingCandidates);
        
        if (existingCandidates.length === 0) {
            console.log('No candidates found, creating new ones...');
            // If no candidates exist, create them
            for (const candidate of candidates) {
                const newCandidate = await Candidate.create(candidate);
                console.log('Created candidate:', newCandidate);
            }
            console.log('Candidates initialized successfully');
        } else {
            console.log('Candidates already exist in database');
        }
    } catch (error) {
        console.error('Error initializing candidates:', error);
    }
}

// Call initializeCandidates when the server starts
initializeCandidates().then(() => {
    console.log('Candidate initialization completed');
}).catch(err => {
    console.error('Error during initialization:', err);
});

// Add a route to check initialization status
app.get('/api/check-init', async (req, res) => {
    try {
        const candidates = await Candidate.find({});
        console.log('Checking initialization status. Found candidates:', candidates);
        res.json({
            initialized: candidates.length > 0,
            candidates: candidates
        });
    } catch (error) {
        console.error('Error checking initialization:', error);
        res.status(500).json({ message: error.message });
    }
});

// Routes
app.get('/api/candidates', async (req, res) => {
    try {
        console.log('API: Fetching candidates');
        const candidates = await Candidate.find({});
        console.log('API: Found candidates:', candidates);
        
        if (!candidates || candidates.length === 0) {
            console.log('API: No candidates found, initializing...');
            await initializeCandidates();
            const newCandidates = await Candidate.find({});
            console.log('API: After initialization, found candidates:', newCandidates);
            return res.json(newCandidates);
        }
        
        res.json(candidates);
    } catch (error) {
        console.error('API Error fetching candidates:', error);
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/vote', async (req, res) => {
    const { candidateId, voterEmail, deviceId } = req.body;
    console.log('Received vote request:', { candidateId, voterEmail, deviceId });

    try {
        // Check if user has already voted from this device
        const existingVote = await Vote.findOne({ voterEmail, deviceId });
        if (existingVote) {
            console.log('User has already voted from this device:', { voterEmail, deviceId });
            return res.status(400).json({ message: 'You have already cast your vote from this device!' });
        }

        // Create new vote
        const vote = new Vote({ candidateId, voterEmail, deviceId });
        await vote.save();
        console.log('Vote saved:', vote);

        // Update candidate vote count
        const updatedCandidate = await Candidate.findOneAndUpdate(
            { id: candidateId },
            { $inc: { voteCount: 1 } },
            { new: true }
        );
        console.log('Updated candidate:', updatedCandidate);

        res.json({ message: 'Vote cast successfully!' });
    } catch (error) {
        console.error('Error processing vote:', error);
        if (error.code === 11000) {
            // Duplicate key error (unique index violation)
            res.status(400).json({ message: 'You have already cast your vote from this device!' });
        } else {
            res.status(500).json({ message: error.message });
        }
    }
});

// Add a route to reset candidates (for testing)
app.post('/api/reset-candidates', async (req, res) => {
    try {
        await Candidate.deleteMany({});
        await initializeCandidates();
        res.json({ message: 'Candidates reset successfully' });
    } catch (error) {
        console.error('Error resetting candidates:', error);
        res.status(500).json({ message: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
}); 