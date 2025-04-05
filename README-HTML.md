# College Election System (HTML/CSS/JS Version)

A simple voting platform for college elections, built with HTML, CSS, and JavaScript.

## Features

- College email verification (@college.edu)
- Simple voting mechanism
- Real-time vote tracking
- Three predefined candidates: ARVIND MEEENA, RUDRA PRATAP, and IVAN SHARMA
- Persistent vote counts that don't reset on page refresh

## Prerequisites

- A modern web browser

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd college-election-system
```

2. Open the application:
   - Simply open `index.html` in your web browser
   - Or use a local server (e.g., Live Server extension in VS Code)

## Usage

1. Register with your college email (@college.edu)
2. Cast your vote for one of the three candidates
3. View live results in real-time
4. Vote counts will persist even if you refresh the page

## Project Structure

```
college-election-system/
├── index.html
├── styles.css
├── app.js
└── README-HTML.md
```

## How It Works

- The system verifies college email addresses
- Each user can only vote once (tracked via localStorage)
- Vote counts are stored in localStorage and persist across page refreshes
- Results are displayed with progress bars showing vote percentages

## Security Considerations

- The system verifies college email addresses
- Each user can only vote once per session
- Vote counts are visible to all users
- Vote data is stored locally in the browser

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 