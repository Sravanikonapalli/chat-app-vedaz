import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

export function initSocket(io) {
  const onlineUsers = new Map(); // userId -> socket.id

  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error("No token"));
    try {
      const { id } = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(id);
      if (!user) return next(new Error("Invalid user"));
      socket.user = { id: user._id.toString(), name: user.name };
      return next();
    } catch (e) {
      return next(new Error("Auth error"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = socket.user.id;
    onlineUsers.set(userId, socket.id);

    await User.findByIdAndUpdate(userId, { online: true, lastSeenAt: new Date() });
    socket.join(`user:${userId}`);

    // presence broadcast
    io.emit("presence:update", { userId, online: true });

    // == MESSAGE SEND ==
    socket.on("message:send", async ({ to, text }, ack) => {
      try {
        if (!to || !text) return ack?.({ ok: false, error: "Invalid payload" });

        // find or create conversation
        let conv = await Conversation.findOne({ members: { $all: [userId, to], $size: 2 } });
        if (!conv) conv = await Conversation.create({ members: [userId, to] });

        // create message
        const msg = await Message.create({
          conversation: conv._id,
          sender: userId,
          recipient: to,
          text,
          status: "sent"
        });

        // update conversation quick fields
        await Conversation.findByIdAndUpdate(conv._id, {
          lastMessageText: text,
          lastMessageAt: new Date()
        });

        // deliver to recipient if online
        const recipientSocketId = onlineUsers.get(to);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit("message:new", {
            _id: msg._id,
            conversation: conv._id,
            sender: userId,
            recipient: to,
            text,
            status: "delivered",
            createdAt: msg.createdAt
          });
          await Message.findByIdAndUpdate(msg._id, { status: "delivered", deliveredAt: new Date() });
        }

        // echo to sender with status (sent/delivered)
        io.to(socket.id).emit("message:new", {
          _id: msg._id,
          conversation: conv._id,
          sender: userId,
          recipient: to,
          text,
          status: onlineUsers.get(to) ? "delivered" : "sent",
          createdAt: msg.createdAt
        });

        ack?.({ ok: true, messageId: msg._id, conversationId: conv._id });
      } catch (e) {
        ack?.({ ok: false, error: e.message });
      }
    });

    // == TYPING ==
    socket.on("typing:start", async ({ to }) => {
      const sid = onlineUsers.get(to);
      if (sid) io.to(sid).emit("typing:start", { from: userId });
    });

    socket.on("typing:stop", async ({ to }) => {
      const sid = onlineUsers.get(to);
      if (sid) io.to(sid).emit("typing:stop", { from: userId });
    });

    //== MESSAGE READ ==
    socket.on("message:read", async ({ conversationId, messageIds }) => {
      if (!conversationId) return;

      const filter = {
        conversation: conversationId,
        recipient: userId, // only update messages that current user received
        status: { $in: ["sent", "delivered"] }
      };
      if (Array.isArray(messageIds) && messageIds.length) {
        filter._id = { $in: messageIds };
      }

      await Message.updateMany(filter, { status: "read", readAt: new Date() });

      // find other member of conversation
      const conv = await Conversation.findById(conversationId).lean();
      const other = conv?.members?.find(id => id.toString() !== userId);

      // notify other user (the sender) that their messages were read
      if (other) {
        const sid = onlineUsers.get(other.toString());
        if (sid) {
          io.to(sid).emit("message:read", { conversationId, by: userId, messageIds: messageIds || null });
        }
      }

      // also notify the reader’s own client to update local state
      io.to(socket.id).emit("message:read", { conversationId, by: userId, messageIds: messageIds || null });
    });

    //=== DISCONNECT ===
    socket.on("disconnect", async () => {
      onlineUsers.delete(userId);
      await User.findByIdAndUpdate(userId, { online: false, lastSeenAt: new Date() });
      io.emit("presence:update", { userId, online: false });
    });
  });
}
