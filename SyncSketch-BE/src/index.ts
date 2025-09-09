import app from './server.ts';
import { connectDB } from './Config/database.ts';
import { config } from './Config/env.ts'; // ✅ import validated config

// Graceful shutdown handler
const gracefulShutdown = (signal: string) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  process.exit(0);
};

// Handle process termination
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    const startTime = Date.now();
    await connectDB();
    console.log('✅ Database connected successfully');

    // Start the server
    const server = app.listen(config.server.port, () => {
      console.log(`🚀 Server running on port ${config.server.port}`);
      console.log(`🌍 Environment: ${config.server.env}`);
      console.log(`📊 Health check: http://localhost:${config.server.port}/health`);
    });
    const endTime = Date.now();
    console.log(endTime - startTime, "TIME TAKEN IN MS");


    // Handle server errors
    server.on('error', (error: any) => {
      if (error.syscall !== 'listen') throw error;

      switch (error.code) {
        case 'EACCES':
          console.error(`Port ${config.server.port} requires elevated privileges`);
          process.exit(1);
        case 'EADDRINUSE':
          console.error(`Port ${config.server.port} is already in use`);
          process.exit(1);
        default:
          throw error;
      }
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Initialize the application
startServer();
