import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import MessageBubble from "./MessageBubble";
import { getMessages } from "../api";
import "../styles/styles.css";

let socket;

function Chat({ me, other, onBack }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const messagesRef = useRef(null);
  const typingTimer = useRef(null);

  // connect socket when component mounts
  useEffect(() => {
    if (!other?._id) return;

    const token = localStorage.getItem("token");
    socket = io(process.env.REACT_APP_API_URL, {
      auth: { token }, 
    });

    // fetch old messages
    (async () => {
      const data = await getMessages(other._id);
      if (data?.messages) setMessages(data.messages);
    })();

    socket.on("message:new", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("message:read", ({ conversationId }) => {
      // optimistic: mark all as read
      setMessages((prev) => prev.map((m) => ({ ...m, status: "read" })));
    });

    socket.on("typing:start", ({ from }) => {
      if (from === other._id) setTyping(true);
    });

    socket.on("typing:stop", ({ from }) => {
      if (from === other._id) setTyping(false);
    });

    // cleanup on unmount
    return () => {
      socket.disconnect();
      socket = null;
    };
  }, [other, me]);

  // scroll to bottom when messages change
  useEffect(() => {
    messagesRef.current?.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  function send() {
    if (!text.trim() || !socket) return;
    socket.emit("message:send", { to: other._id, text }, (ack) => {
      if (ack?.ok) {
        // server will echo message back
      }
    });
    setText("");
    socket.emit("typing:stop", { to: other._id });
  }

  function onTextChange(e) {
    setText(e.target.value);
    if (!socket) return;
    socket.emit("typing:start", { to: other._id });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit("typing:stop", { to: other._id });
    }, 800);
  }

  return (
    <div>
      <div className="header chat-top">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="btn" onClick={onBack}>
            Back
          </button>
          <div style={{ fontWeight: 600 }}>{other?.name}</div>
        </div>
        <div className="small">{other?.online ? "Online" : "Offline"}</div>
      </div>

      <div className="container">
        <div className="sidebar">{/* empty left column */}</div>
        <div className="content">
          <div className="messages" ref={messagesRef}>
            {messages.map((m) => (
              <MessageBubble key={m._id || m.createdAt} m={m} me={me} />
            ))}
          </div>
          <div className="input-row">
            <input
              placeholder="Type a message"
              value={text}
              onChange={onTextChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") send();
              }}
            />
            <button className="btn primary" onClick={send}>
              Send
            </button>
          </div>
          {typing && (
            <div style={{ padding: "6px 12px" }} className="small">
              Typing...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Chat;
