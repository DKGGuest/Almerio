// Vercel serverless function that wraps the Express app
// This file is used by Vercel to deploy the backend as a serverless function

// Import the Express app from server/server.js
// Note: We need to use dynamic import since server.js uses ES modules
import('../server/server.js').then(module => {
  // The Express app is exported as default
  const app = module.default || module;

  // Export for Vercel
  if (typeof module.exports !== 'undefined') {
    module.exports = app;
  }
}).catch(err => {
  console.error('Failed to load server:', err);
});

// For ES module compatibility
export default async (req, res) => {
  const { default: app } = await import('../server/server.js');
  return app(req, res);
};
