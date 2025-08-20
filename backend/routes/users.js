import express from "express";
import { auth } from "../middleware/auth.js";
import User from "../models/User.js";
import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";

const router = express.Router();

/**
 * GET /users
 * returns all users except self, with last message preview if exists
 */
router.get("/", auth, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select("_id name email online lastSeenAt")
      .lean();

    // last message snippet per user (optional for MVP; here we fetch by conversations)
    const convos = await Conversation.find({ members: req.user._id }).lean();
    const lastByUser = {};
    convos.forEach(c => {
      lastByUser[c.members.find(id => id.toString() !== req.user._id.toString())] = {
        text: c.lastMessageText || "",
        at: c.lastMessageAt || null
      };
    });

    const data = users.map(u => ({
      ...u,
      lastMessageText: lastByUser[u._id]?.text || "",
      lastMessageAt: lastByUser[u._id]?.at || null
    }));

    res.json(data);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;
