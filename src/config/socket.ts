import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { verifyAccessToken } from '../shared/utils/jwt';
import { ChatService } from '../shared/services/chatService';

let io: SocketIOServer | null = null;

export const initSocketServer = (httpServer: HttpServer) => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      credentials: true,
    },
  });

  // Website namespace: Cookie authentication
  const websiteNamespace = io.of('/ws/website');
  websiteNamespace.use((socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie;
      let token = socket.handshake.auth?.token;

      if (!token && cookieHeader) {
        const match = cookieHeader.match(/accessToken=([^;]+)/);
        if (match) token = match[1];
      }

      if (!token) return next(new Error('Authentication error: Missing token'));

      const payload = verifyAccessToken(token);
      if (payload.type !== 'user') return next(new Error('Forbidden: Not a website user'));

      socket.data.user = { id: BigInt(payload.id), type: 'user' };
      next();
    } catch (err) {
      console.error('[website auth] Raw error:', err);
      next(new Error('Authentication error'));
    }
  });

  websiteNamespace.on('connection', (socket) => {
    const user = socket.data.user;
    socket.join(`user:${user.id}`);

    socket.on('conversation:join', (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on('message:send', async (data: { conversationId: string; messageText?: string; imageAttachment?: string }) => {
      try {
        const convId = BigInt(data.conversationId);
        const message = await ChatService.saveMessage({
          conversationId: convId,
          senderType: 'user',
          senderId: user.id,
          messageText: data.messageText,
          imageAttachment: data.imageAttachment,
        });

        const room = `conversation:${data.conversationId}`;
        websiteNamespace.to(room).emit('message:new', message);
        io?.of('/ws/mobile').to(room).to('admins').emit('message:new', message);
      } catch (err) {
        console.error('Error sending website chat message:', err);
      }
    });
  });

  // Mobile namespace: Bearer token authentication in handshake
  const mobileNamespace = io.of('/ws/mobile');
  mobileNamespace.use((socket, next) => {
    try {
      const authHeader = socket.handshake.headers.authorization || socket.handshake.auth?.token;
      if (!authHeader) return next(new Error('Authentication error: Missing Bearer token'));

      const token = authHeader.replace(/^Bearer\s+/, '');
      const payload = verifyAccessToken(token);
      if (payload.type !== 'admin') return next(new Error('Forbidden: Not an admin'));

      socket.data.admin = { id: BigInt(payload.id), type: 'admin', role: payload.role };
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  mobileNamespace.on('connection', (socket) => {
    const admin = socket.data.admin;
    socket.join(`admin:${admin.id}`);
    socket.join('admins');

    socket.on('conversation:join', (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on('message:send', async (data: { conversationId: string; messageText?: string; imageAttachment?: string }) => {
      try {
        const convId = BigInt(data.conversationId);
        const message = await ChatService.saveMessage({
          conversationId: convId,
          senderType: 'admin',
          senderId: admin.id,
          messageText: data.messageText,
          imageAttachment: data.imageAttachment,
        });

        const room = `conversation:${data.conversationId}`;
        mobileNamespace.to(room).to('admins').emit('message:new', message);
        io?.of('/ws/website').to(room).emit('message:new', message);
      } catch (err) {
        console.error('Error sending mobile chat message:', err);
      }
    });
  });

  return io;
};

export const getSocketServer = () => io;
