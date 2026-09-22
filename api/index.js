let app;
let initError = null;

try {
  app = require('../backend/server');
} catch (e) {
  initError = e;
  console.error('Error requiring backend/server:', e);
}

module.exports = (req, res) => {
  if (!app) {
    try {
      app = require('../backend/server');
      initError = null;
    } catch (e) {
      initError = e;
      return res.status(500).json({
        error: 'Backend initialization failure',
        message: e.message,
        stack: e.stack
      });
    }
  }

  try {
    return app(req, res);
  } catch (err) {
    console.error('Unhandled request error:', err);
    return res.status(500).json({
      error: 'Internal server error',
      message: err.message
    });
  }
};
