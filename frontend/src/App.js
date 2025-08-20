import React, { useEffect, useState } from "react";

// API helper
import { getMe } from "./api";

// Components
import Login from "./components/Login";
import Signup from "./components/Signup";
import Home from "./components/Home";
import Chat from "./components/Chat";

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("login"); 
  const [activeChatUser, setActiveChatUser] = useState(null);

  useEffect(() => {
    async function fetchMe() {
      const me = await getMe();
      if (me) {
        setUser(me);
        setView("home");
      }
    }
    fetchMe();
  }, []);

  if (!user) {
    return (
      <div className="app-root">
        {view === "login" && (
          <Login
            onAuth={(u) => {
              setUser(u);
              setView("home");
            }}
            onSwitch={() => setView("signup")}
          />
        )}
        {view === "signup" && (
          <Signup
            onAuth={(u) => {
              setUser(u);
              setView("home");
            }}
            onSwitch={() => setView("login")}
          />
        )}
      </div>
    );
  }

  return (
    <div className="app-root">
      {view === "home" && (
        <Home
          me={user}
          onOpenChat={(other) => {
            setActiveChatUser(other);
            setView("chat");
          }}
          onLogout={() => {
            localStorage.removeItem("token");
            setUser(null);
            setView("login");
          }}
        />
      )}
      {view === "chat" && (
        <Chat me={user} other={activeChatUser} onBack={() => setView("home")} />
      )}
    </div>
  );
}
