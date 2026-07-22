import { useState, useEffect } from "react";
import axios from "axios";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";
import "./App.css";

function initials(name) {
  if (!name) return "?";
  return name.trim().slice(0, 2).toUpperCase();
}

function AuthHero() {
  return (
    <div className="auth-hero">
      <div className="auth-hero-mark">
        <span className="auth-hero-dot" />
        Chatly
      </div>
      <h1 className="auth-hero-title">
        Baat karo,
        <br />
        bina ruke.
      </h1>
      <p className="auth-hero-copy">
        Ek jagah jahan messages turant pahunchte hain — real-time chat,
        file sharing, aur typing indicators ke saath.
      </p>
      <div className="auth-hero-blobs" aria-hidden="true">
        <svg viewBox="0 0 200 200" className="blob blob-1">
          <path
            fill="currentColor"
            d="M45.3,-58.1C58.6,-49.6,69.2,-35.5,73.7,-19.6C78.1,-3.7,76.4,14,68.9,28.4C61.4,42.8,48.1,53.9,33.2,61.5C18.3,69.1,1.8,73.2,-14.9,71.4C-31.6,69.6,-48.5,61.9,-59.8,48.9C-71.1,35.9,-76.8,17.9,-75.9,0.6C-75,-16.8,-67.5,-33.6,-55.7,-42.6C-43.9,-51.6,-27.9,-52.9,-12.1,-56.6C3.6,-60.3,29.9,-66.6,45.3,-58.1Z"
            transform="translate(100 100)"
          />
        </svg>
        <svg viewBox="0 0 200 200" className="blob blob-2">
          <path
            fill="currentColor"
            d="M39.9,-51.6C51.4,-42.1,59.7,-28.7,63.6,-13.7C67.5,1.3,67,17.9,59.6,30.9C52.2,43.9,37.9,53.3,22.3,59.2C6.7,65.1,-10.2,67.5,-25.6,63C-41,58.5,-54.9,47.1,-62.6,32.3C-70.3,17.5,-71.8,-0.7,-66.7,-16.4C-61.6,-32.1,-49.9,-45.3,-36.1,-54.7C-22.3,-64.1,-11.2,-69.7,1.8,-72C14.7,-74.3,29.4,-61.1,39.9,-51.6Z"
            transform="translate(100 100)"
          />
        </svg>
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [receiver, setReceiver] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (user) {
      const API_URL = process.env.REACT_APP_API_URL;
      axios.get(`${API_URL}/auth/users`).then((res) => {
        setUsers(res.data.filter((u) => u._id !== user.id));
      });
    }
  }, [user]);

  if (!user) {
    return (
      <div className="auth-screen">
        <AuthHero />
        <div className="auth-panel">
          {showRegister ? (
            <>
              <Register onRegisterSuccess={() => setShowRegister(false)} />
              <p className="auth-switch">
                Pehle se account hai?{" "}
                <button onClick={() => setShowRegister(false)}>Login karo</button>
              </p>
            </>
          ) : (
            <>
              <Login onLogin={setUser} />
              <p className="auth-switch">
                Naye ho?{" "}
                <button onClick={() => setShowRegister(true)}>Register karo</button>
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  if (!receiver) {
    return (
      <div className="contacts-screen">
        <div className="contacts-header">
          <div className="contacts-header-user">
            <div className="avatar avatar-lg">{initials(user.username)}</div>
            <div>
              <p className="contacts-eyebrow">Welcome back</p>
              <h2>{user.username}</h2>
            </div>
          </div>
        </div>

        <div className="contacts-list">
          <p className="contacts-hint">Chat karne ke liye ek contact select karo</p>
          {users.length === 0 && (
            <div className="contacts-empty">
              Koi aur user register nahi hai abhi tak. Kisi aur ko app share karo!
            </div>
          )}
          {users.map((u) => (
            <button
              key={u._id}
              className="contact-card"
              onClick={() => setReceiver({ id: u._id, username: u.username })}
            >
              <div className="avatar">{initials(u.username)}</div>
              <span className="contact-name">{u.username}</span>
              <span className="contact-arrow">→</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="chat-screen">
      <button className="back-button" onClick={() => setReceiver(null)}>
        ← Contacts
      </button>
      <Chat user={user} receiver={receiver} />
    </div>
  );
}

export default App;
