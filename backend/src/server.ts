import app from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/database.js';

const server = app.listen(env.PORT, env.HOST, () => {
  console.log(`🚀 Server running on http://${env.HOST}:${env.PORT}`);
  console.log(`📌 API Base Endpoint: http://${env.HOST}:${env.PORT}/api/v1`);
  console.log(`🌍 Environment: ${env.NODE_ENV}`);
});

// Graceful Shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`\n⚠️ Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    console.log('🔒 HTTP server closed.');
    await prisma.$disconnect();
    console.log('🐘 PostgreSQL connection disconnected.');
    process.exit(0);
  });

  // Force shutdown after 10s timeout
  setTimeout(() => {
    console.error('❌ Forced shutdown due to timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
