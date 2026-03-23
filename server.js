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
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:3000',
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

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';

const startServer = async () => {
  try {
    // MongoDB bağlantısı
    await connectDB();

    // Server başla
    httpServer.listen(PORT, HOST, () => {
      console.log(`
╔════════════════════════════════════════╗
║     🚀 Server Started Successfully     ║
╠════════════════════════════════════════╣
║ Environment: ${process.env.NODE_ENV || 'development'.padEnd(24)} ║
║ Host: http://${HOST}:${PORT}                 ║
║ WebSocket: ws://${HOST}:${PORT}                ║
╚════════════════════════════════════════╝
      `);
    });

    // Graceful shutdown
    process.on('SIGTERM', shutdownServer);
    process.on('SIGINT', shutdownServer);
  } catch (error) {
    console.error('❌ Server başlatma hatası:', error.message);
    process.exit(1);
  }
};

// Graceful Shutdown
const shutdownServer = async () => {
  console.log('\n🛑 Server kapatılıyor...');

  try {
    httpServer.close(() => {
      console.log('✅ HTTP server kapatıldı');
    });

    // MongoDB bağlantısını kapat
    await require('./config/database').disconnectDB();

    console.log('✅ Tüm kaynaklar serbest bırakıldı');
    process.exit(0);
  } catch (error) {
    console.error('❌ Kapanış hatası:', error.message);
    process.exit(1);
  }
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
