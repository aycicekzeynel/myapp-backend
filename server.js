/**
 * Main Server File
 * Express.js ve Socket.io Konfigürasyonu
 */

// Env variables yükleme
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { createServer } = require('http');
const socketIO = require('socket.io');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const venueRoutes = require('./routes/venues');
const checkInRoutes = require('./routes/checkins');
const notificationRoutes = require('./routes/notifications');

// Custom middleware ve config
const { connectDB, checkDBHealth } = require('./config/database');
const { errorHandler, notFoundHandler, asyncHandler } = require('./middleware/errorHandler');
const { authenticate } = require('./middleware/auth');
const { generalLimiter, authLimiter } = require('./middleware/rateLimiter');
const { developmentLogger, productionLogger, requestIdMiddleware, skipLogs } = require('./middleware/requestLogger');
const { HTTP_STATUS, SUCCESS_MESSAGES } = require('./config/constants');

// ================================================
// SERVER INITIALIZATION
// ================================================

const app = express();
const httpServer = createServer(app);

// Socket.io Configuration
const io = socketIO(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// ================================================
// GLOBAL MIDDLEWARE
// ================================================

// Request ID Middleware
app.use(requestIdMiddleware);

// Security Middleware
app.use(helmet());

// CORS Configuration
const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [];
app.use(
  cors({
    origin: (origin, callback) => {
      // localhost her zaman izinli (Expo development)
      if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error('CORS: origin not allowed'));
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-API-Key'],
  })
);

// Body Parser Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Logger Middleware
const loggerMiddleware = process.env.NODE_ENV === 'production' ? productionLogger : developmentLogger;
app.use(loggerMiddleware);

// General Rate Limiter
app.use(generalLimiter);

// ================================================
// HEALTH CHECK ENDPOINT
// ================================================

app.get('/health', asyncHandler(async (req, res) => {
  const dbHealth = await checkDBHealth();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Server is running',
    status: {
      server: 'online',
      database: dbHealth ? 'connected' : 'disconnected',
      timestamp: new Date(),
    },
    version: '1.0.0',
  });
}));

// ================================================
// API ROUTES (Placeholder)
// ================================================
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/checkins', checkInRoutes);
app.use('/api/notifications', notificationRoutes);
// Test route
app.get('/api/test', (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: SUCCESS_MESSAGES.OPERATION_SUCCESS,
    data: {
      message: 'API test başarılı',
      timestamp: new Date(),
      requestId: req.id,
    },
  });
});

// ================================================
// 404 Handler
// ================================================

app.use(notFoundHandler);

// ================================================
// GLOBAL ERROR HANDLER
// ================================================

app.use(errorHandler);

// ================================================
// SOCKET.IO CONFIGURATION
// ================================================

// Socket.io middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (token) {
    // Token doğrulaması yapılabilir
    socket.userId = socket.handshake.auth.userId;
  }
  next();
});

// Socket.io connection handlers
io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  // Join room
  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`✅ ${socket.id} joined room: ${room}`);
  });

  // Leave room
  socket.on('leave_room', (room) => {
    socket.leave(room);
    console.log(`✅ ${socket.id} left room: ${room}`);
  });

  // Send message
  socket.on('send_message', (data) => {
    io.to(data.room).emit('receive_message', {
      id: socket.id,
      message: data.message,
      timestamp: new Date(),
    });
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`🔌 User disconnected: ${socket.id}`);
  });

  // Error handling
  socket.on('error', (error) => {
    console.error(`❌ Socket error: ${socket.id}`, error);
  });
});

// ================================================
// SERVER START
// ================================================

const PORT = process.env.PORT || 5001;
const HOST = process.env.HOST || '0.0.0.0';

// Açık bağlantıları takip et (force-close için)
const openConnections = new Set();
httpServer.on('connection', (socket) => {
  openConnections.add(socket);
  socket.on('close', () => openConnections.delete(socket));
});

const startServer = async () => {
  try {
    await connectDB();

    httpServer.listen(PORT, HOST, () => {
      console.log(`\n🚀 Server çalışıyor: http://${HOST}:${PORT}\n`);
    });

    // Port zaten kullanılıyorsa eski process'i öldür ve tekrar dene
    httpServer.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`⚠️  Port ${PORT} kullanımda — eski process kapatılıyor...`);
        const { execSync } = require('child_process');
        try {
          execSync(`lsof -ti:${PORT} | xargs kill -9`);
        } catch {}
        setTimeout(() => httpServer.listen(PORT, HOST), 1000);
      } else {
        console.error('❌ Server hatası:', err.message);
        process.exit(1);
      }
    });

    process.on('SIGTERM', shutdownServer);
    process.on('SIGINT', shutdownServer);
  } catch (error) {
    console.error('❌ Server başlatma hatası:', error.message);
    process.exit(1);
  }
};

// Graceful Shutdown — tüm bağlantıları force-close eder
const shutdownServer = async () => {
  console.log('\n🛑 Server kapatılıyor...');

  // Yeni bağlantı kabul etme
  httpServer.close(() => console.log('✅ HTTP server kapatıldı'));

  // Açık socket bağlantılarını hemen kapat (portu serbest bırak)
  for (const socket of openConnections) {
    socket.destroy();
  }
  openConnections.clear();

  try {
    await require('./config/database').disconnectDB();
  } catch {}

  console.log('✅ Tüm kaynaklar serbest bırakıldı');
  process.exit(0);
};

// Unhandled Promise Rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Uncaught Exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Server başlat
if (require.main === module) {
  startServer();
}

// Module export (testing için)
module.exports = { app, httpServer, io };
