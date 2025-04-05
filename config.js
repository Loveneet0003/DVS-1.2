// API Configuration
const config = {
    // Set this to true when deploying to production
    isProduction: false,
    
    // API URLs
    apiUrl: {
        development: 'http://localhost:5000/api',
        production: 'https://college-election-backend.onrender.com/api' // Replace with your actual Render URL after deployment
    },
    
    // Get the current API URL based on environment
    getApiUrl: function() {
        return this.isProduction ? this.apiUrl.production : this.apiUrl.development;
    }
};

// Export the configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = config;
} else {
    window.config = config;
} 