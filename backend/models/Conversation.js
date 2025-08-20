import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    // for quick list display
    lastMessageAt: { type: Date, default: null },
    lastMessageText: { type: String, default: "" }
  },
  { timestamps: true }
);

// one-on-one uniqueness: same two members only one conversation
conversationSchema.index({ members: 1 }, { unique: false });

export default mongoose.model("Conversation", conversationSchema);
