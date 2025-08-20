import React from "react";
import "../styles/styles.css";

export default function MessageBubble({ m, me }) {
  // compare both id and _id (backend sends string ids)
  const mine = m.sender === me.id || m.sender === me._id;

  return (
    <div className={`message-row ${mine ? "message-me" : ""}`}>
      <div className={`bubble ${mine ? "me" : ""}`}>
        <div>{m.text}</div>
        <div className="small" style={{ textAlign: "right", marginTop: 6 }}>
          {m.status}
          {m.status === "read"
            ? " ✓✓"
            : m.status === "delivered"
            ? " ✓"
            : ""}
        </div>
      </div>
    </div>
  );
}
