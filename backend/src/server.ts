import app from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/database.js';

const server = app.listen(env.PORT, env.HOST, () => {
  console.log(`🚀 Server running on http://${env.HOST}:${env.PORT}`);
  console.log(`📌 API Base Endpoint: http://${env.HOST}:${env.PORT}/api/v1`);
  console.log(`🌍 Environment: ${env.NODE_ENV}`);
  ensureDatabaseReady();
});

const ensureDatabaseReady = async () => {
  try {
    const rawTables: any = await prisma.$queryRaw`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `;
    const count = Array.isArray(rawTables) ? rawTables.length : 0;
    console.log(`📊 PostgreSQL database connected. Found ${count} public tables.`);
    if (count === 0) {
      console.log('⚡ No tables detected. Running automated database schema push & seed...');
      const { execSync } = await import('child_process');
      execSync('npx --yes prisma db push --schema=database/prisma/schema.prisma --accept-data-loss', { stdio: 'inherit' });
      execSync('npx --yes tsx database/prisma/seed.ts', { stdio: 'inherit' });
      console.log('🎉 Automated database initialization completed successfully.');
    }
  } catch (err) {
    console.error('⚠️ Database schema verification error:', err);
  }
};

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
