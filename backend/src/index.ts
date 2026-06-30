import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { cvRouter } from './routes/cv.routes';
import { tailorRouter } from './routes/tailor.routes';
import { prewarmScorerModel } from './services/scorer.service';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({ 
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true 
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routing API routes
app.use('/api/cv', cvRouter);
app.use('/api/tailor', tailorRouter);

// Keep-alive for Render free tier (prevents 15-min spin-down)
// UptimeRobot will ping /health every 14 minutes
// This just ensures the endpoint responds fast
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString() 
  });
});

// Register error handler middleware
app.use(errorHandler);

// Startup pre-warm models and listen
async function startServer() {
  // Pre-warm ONNX sentence-transformer models before requests hit the server
  await prewarmScorerModel();

  app.listen(port, () => {
    console.log(`ResuMatch Pro Backend Server is listening on port ${port}`);
  });
}

startServer().catch(err => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
