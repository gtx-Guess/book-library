import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import dotenv from 'dotenv';
import booksRouter from './routes/books';
import goalsRouter from './routes/goals';
import statsRouter from './routes/stats';
import dnfRouter from './routes/dnf';
import wantToReadRouter from './routes/wantToRead';
import authRouter from './routes/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy - trust only the first proxy (nginx proxy manager)
app.set('trust proxy', 1);

const allowedOrigins = [
  'http://localhost:4000',
  'http://192.168.0.86:4000',
  'https://book.tdnet.xyz',
  'https://dev.book.tdnet.xyz',
  'http://dev.book.tdnet.xyz',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, mobile apps)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
}));
app.use(express.json());

// Request logging (dev only)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// General API rate limit — 200 requests per minute per IP
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please slow down' },
});

// Auth rate limit — 30 attempts per 15 minutes per IP (brute force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts, please try again later' },
});

// Search rate limit — 30 requests per minute per IP (protects Google Books quota)
const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many search requests, please slow down' },
});

app.use('/api', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/webauthn/authenticate', authLimiter);
app.use('/api/books/search', searchLimiter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api/books', booksRouter);
app.use('/api/goals', goalsRouter);
app.use('/api/stats', statsRouter);
app.use('/api/dnf', dnfRouter);
app.use('/api/want-to-read', wantToReadRouter);

app.listen(PORT, () => {
  console.log(`✅ Backend server running on port ${PORT}`);
});
