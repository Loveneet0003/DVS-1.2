import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Register from './components/Register';
import Vote from './components/Vote';
import LiveResults from './components/LiveResults';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/vote" element={<Vote />} />
            <Route path="/results" element={<LiveResults />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App; 