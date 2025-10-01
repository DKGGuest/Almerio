// Vercel serverless function that wraps the Express app
// This file is used by Vercel to deploy the backend as a serverless function

// Import the Express app from server/server.js (CommonJS)
const app = require('../server/server.js');

// Export for Vercel serverless functions
module.exports = app;
