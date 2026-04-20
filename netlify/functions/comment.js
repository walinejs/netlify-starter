const http = require('http');
const Waline = require('@waline/vercel');
const serverless = require('serverless-http');

const walineApp = Waline({
  env: 'netlify',
  async postSave(comment) {
    // do what ever you want after save comment
  },
});

// The admin UI (@waline/admin) calls bare paths like /comment, /token, /user
// without the /api/ prefix. Waline's legacy routes for those return un-wrapped
// JSON (no `errno` key), which the admin UI treats as an error.
// Inject /api/ for known Waline endpoints so admin hits the wrapped response
// paths without needing a newer admin build.
const WALINE_ENDPOINTS = [
  '/comment',
  '/token',
  '/user',
  '/article',
  '/verification',
  '/db',
  '/oauth',
];
function isWalineEndpoint(path) {
  return WALINE_ENDPOINTS.some((p) => path === p || path.startsWith(p + '/'));
}

function handler(req, res) {
  const path = req.url.split('?')[0];
  if (!path.startsWith('/api/') && isWalineEndpoint(path)) {
    req.url = '/api' + req.url;
  }
  walineApp(req, res);
}

module.exports.handler = serverless(http.createServer(handler));
