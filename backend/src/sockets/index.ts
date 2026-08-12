import { Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { env } from "../config/env";
import { isRedisEnabled, redisConnection } from "../config/redis";

let io: SocketIOServer | null = null;

export const initSocket = (server: Server): SocketIOServer => {
  io = new SocketIOServer(server, {
    cors: {
      origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN,
      credentials: true
    }
  });

  if (isRedisEnabled && redisConnection) {
    const pubClient = redisConnection;
    const subClient = pubClient.duplicate();
    io.adapter(createAdapter(pubClient, subClient));
  }

  io.on("connection", (socket) => {
    socket.on("join", (room: string) => {
      socket.join(room);
    });
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error("Socket is not initialized");
  }

  return io;
};
