import http from 'http';
import app from './app';
import { env } from './config/env';
import { initSocketServer } from './config/socket';
import { startAutoCancelOrderJob } from './jobs/auto-cancel-order.job';

const server = http.createServer(app);

// Initialize Socket.io with website & mobile namespaces
initSocketServer(server);

// Start auto-cancel cron job for unpaid orders
startAutoCancelOrderJob();

const PORT = parseInt(env.PORT || '5000', 10);

server.listen(PORT, () => {
  console.log(`🚀 Vieguard Backend running on port ${PORT}`);
  console.log(`🌐 Website routes mounted at /api/v0/website`);
  console.log(`📱 Mobile routes mounted at /api/v0/mobile`);
  console.log(`🔔 Webhook routes mounted at /api/v0/webhooks`);
  console.log(`💬 Socket.io namespaces active: /ws/website & /ws/mobile`);
  console.log(`📚 Scalar API Reference (Dedoc style): http://localhost:${PORT}/docs`);
  console.log(`📖 Swagger UI Documentation: http://localhost:${PORT}/api-docs`);
});
