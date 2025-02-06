import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';

const app = express();

// Middleware for logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Full URL:', req.originalUrl);
  next();
});

app.use(cors());
app.use(express.json());

// Mount all routes under /.netlify/functions/api
const router = express.Router();

// Root endpoint
router.get('/', (req, res) => {
  res.json({ message: 'Root endpoint working!' });
});

// Basic health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
});

// Test endpoint
router.get('/test', (req, res) => {
  res.json({
    message: 'API is working!',
    path: req.path,
    baseUrl: req.baseUrl,
    originalUrl: req.originalUrl
  });
});

// Mount the router
app.use('/.netlify/functions/api', router);

// Catch-all route for debugging
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    request: {
      method: req.method,
      path: req.path,
      baseUrl: req.baseUrl,
      originalUrl: req.originalUrl,
      headers: req.headers
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

// Create serverless handler with error handling
export const handler = async (event, context) => {
  console.log('Incoming request:', {
    path: event.path,
    httpMethod: event.httpMethod,
    headers: event.headers
  });

  try {
    const serverlessHandler = serverless(app);
    const result = await serverlessHandler(event, context);
    console.log('Response:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
