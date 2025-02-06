import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

// Basic health check endpoint
app.get('/.netlify/functions/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Add your API routes here
app.get('/.netlify/functions/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

export const handler = serverless(app);
