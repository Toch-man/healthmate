import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import prisma from "./db.ts";

export const init_socket = (http_server: HttpServer) => {
  const io = new Server(http_server, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  // auth middleware for socket
  io.use((socket, next) => {
    const token =
      socket.handshake.auth.token ||
      socket.handshake.headers.cookie
        ?.split(";")
        .find((c: string) => c.trim().startsWith("access_token="))
        ?.split("=")[1];

    if (!token) return next(new Error("Unauthorized"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        user_id: string;
        role: string;
      };
      socket.data.user_id = decoded.user_id;
      socket.data.role = decoded.role;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.data.user_id}`);

    // join personal room so we can send direct messages
    socket.join(`user:${socket.data.user_id}`);

    // join appointment chat room
    socket.on("join_chat", async ({ appointment_id }) => {
      // verify user is part of this appointment
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointment_id },
        include: {
          patient: { select: { user_id: true } },
          doctor: { select: { user_id: true } },
        },
      });

      if (!appointment) return;

      const is_patient = appointment.patient.user_id === socket.data.user_id;
      const is_doctor = appointment.doctor.user_id === socket.data.user_id;

      if (!is_patient && !is_doctor) return;

      socket.join(`chat:${appointment_id}`);
      console.log(`${socket.data.user_id} joined chat:${appointment_id}`);
    });

    // send message
    socket.on("send_message", async ({ appointment_id, content }) => {
      if (!content?.trim()) return;

      // save to DB
      const message = await prisma.message.create({
        data: {
          appointment_id,
          sender_id: socket.data.user_id,
          content: content.trim(),
        },
      });

      // broadcast to everyone in the chat room
      io.to(`chat:${appointment_id}`).emit("new_message", {
        id: message.id,
        sender_id: message.sender_id,
        content: message.content,
        createdAt: message.createdAt,
      });
    });

    // mark messages as read
    socket.on("mark_read", async ({ appointment_id }) => {
      await prisma.message.updateMany({
        where: {
          appointment_id,
          sender_id: { not: socket.data.user_id },
          read: false,
        },
        data: { read: true },
      });
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.data.user_id}`);
    });
  });

  return io;
};
