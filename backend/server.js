import "dotenv/config.js";
import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import convoRoutes from "./routes/conversations.js";
import { initSocket } from "./socket/index.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true
  }
});

initSocket(io);

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://chat-app-vedaz.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));
app.use(express.json());

app.get("/", (req, res) => res.send("Chat API running"));
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/conversations", convoRoutes);

const PORT = process.env.PORT || 5000;

(async () => {
  await connectDB(process.env.MONGO_URI);
  server.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
})();
