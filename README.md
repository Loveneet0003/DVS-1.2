# College Election Backend

This is the backend server for the College Election System. It provides APIs for candidate management and voting functionality.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- Render account (for deployment)

## Local Development Setup

1. Clone the repository:
   ```bash
   git clone <your-repository-url>
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following content:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_atlas_connection_string
   ```

4. Start the server:
   ```bash
   node server.js
   ```

## Deployment to Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure the following settings:
   - Name: college-election-backend
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Add environment variables:
     - `PORT`: 5000
     - `MONGODB_URI`: your_mongodb_atlas_connection_string

## API Endpoints

- `GET /api/candidates` - Get all candidates
- `POST /api/vote` - Cast a vote
- `GET /api/check-init` - Check initialization status
- `POST /api/reset-candidates` - Reset candidates (for testing)

## Environment Variables

- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB Atlas connection string

## Important Notes

1. Make sure to add your MongoDB Atlas connection string to Render's environment variables
2. The MongoDB Atlas cluster should have network access configured to allow connections from Render
3. The free tier of Render may have cold starts - the first request after inactivity might be slow

## Database Initialization

The server automatically:
- Creates the database if it doesn't exist
- Initializes the default candidates if none exist
- Verifies and updates candidate information on startup

Default candidates:
1. ARVIND MEEENA
2. RUDRA PRATAP
3. IVAN SHARMA

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