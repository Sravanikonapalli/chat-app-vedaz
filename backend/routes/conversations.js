import express from "express";
import { auth } from "../middleware/auth.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import mongoose from "mongoose";

const router = express.Router();

/**
 * Helper: find or create a one-on-one conversation between two users
 */
async function getOrCreateConversation(userId, otherId) {
  const existing = await Conversation.findOne({
    members: { $all: [userId, otherId], $size: 2 }
  });
  if (existing) return existing;

  const created = await Conversation.create({ members: [userId, otherId] });
  return created;
}

/**
 * GET /conversations/:otherUserId/messages
 * Query params: page, limit
 */
router.get("/:otherUserId/messages", auth, async (req, res) => {
  try {
    const otherId = req.params.otherUserId;
    const conv = await getOrCreateConversation(req.user._id, otherId);

    const page = parseInt(req.query.page || "1", 10);
    const limit = parseInt(req.query.limit || "50", 10);
    const skip = (page - 1) * limit;

    const messages = await Message.find({ conversation: conv._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({ conversationId: conv._id, messages: messages.reverse() });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;
