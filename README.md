# College Hostel Election Backend

This is the backend server for the College Hostel Election System. It provides APIs for candidate management, voting, and result tracking.

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)
- MongoDB Atlas account (free tier)

## Setup Instructions

1. Clone the repository:
```bash
git clone <your-repository-url>
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up MongoDB Atlas:
   - Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
   - Create a new cluster (choose the FREE tier)
   - Set up database access:
     - Go to Security → Database Access
     - Add a new database user
     - Remember the username and password
   - Set up network access:
     - Go to Security → Network Access
     - Add IP Address: 0.0.0.0/0 (allow access from anywhere)
   - Get your connection string:
     - Click "Connect" on your cluster
     - Choose "Connect your application"
     - Copy the connection string

4. Create a `.env` file:
   - Copy `.env.example` to `.env`
   - Replace `<username>`, `<password>`, and `<cluster-url>` in the MONGODB_URI with your MongoDB Atlas credentials
   - Example:
     ```
     MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/election?retryWrites=true&w=majority
     ```

5. Start the server:
```bash
npm start
```

The server will run on http://localhost:5000

## Database Initialization

The server automatically:
- Creates the database if it doesn't exist
- Initializes the default candidates if none exist
- Verifies and updates candidate information on startup

Default candidates:
1. ARVIND MEEENA
2. RUDRA PRATAP
3. IVAN SHARMA

## API Endpoints

- `GET /api/candidates` - Get all candidates
- `POST /api/vote` - Cast a vote
- `GET /api/check-init` - Check initialization status
- `POST /api/reset-candidates` - Reset candidates (for testing)

## Environment Variables

- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB Atlas connection string

## Development

To run the server in development mode with auto-reload:
```bash
npm run dev
```

## Troubleshooting

If candidates are not showing up:
1. Check your MongoDB Atlas connection string in `.env`
2. Verify your IP address is allowed in MongoDB Atlas
3. Check the server logs for any errors
4. Try accessing http://localhost:5000/api/candidates directly
5. If needed, use the reset endpoint: POST http://localhost:5000/api/reset-candidates

## Security Notes

- Never commit your `.env` file to version control
- Keep your MongoDB Atlas credentials secure
- For production, restrict IP access in MongoDB Atlas to your server's IP 