// Vercel serverless function that wraps the Express app
// Note: This approach may have issues with database connections
// Consider using individual API routes instead

const app = require('../server/server');

// Export the Express app as a serverless function
module.exports = app;
