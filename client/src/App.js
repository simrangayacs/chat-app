 import { useState, useEffect } from "react";
import axios from "axios";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";

function App() {
  const [user, setUser] = useState(null);
  const [receiver, setReceiver] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (user) {
      axios.get("http://localhost:5000/api/auth/users").then((res) => {
        setUsers(res.data.filter((u) => u._id !== user.id));
      });
    }
  }, [user]);

  return (
    <div className="App">
      {!user ? (
        showRegister ? (
          <div>
            <Register onRegisterSuccess={() => setShowRegister(false)} />
            <p style={{ textAlign: "center" }}>
              Already have an account?{" "}
              <button onClick={() => setShowRegister(false)}>Login</button>
            </p>
          </div>
        ) : (
          <div>
            <Login onLogin={setUser} />
            <p style={{ textAlign: "center" }}>
              New user?{" "}
              <button onClick={() => setShowRegister(true)}>Register</button>
            </p>
          </div>
        )
      ) : !receiver ? (
        <div style={{ padding: "20px" }}>
          <h3>Welcome, {user.username}!</h3>
          <p>Chat karne ke liye user select karo:</p>
          {users.length === 0 && <p>Koi aur user register nahi hai abhi tak.</p>}
          {users.map((u) => (
            <div key={u._id} style={{ marginBottom: "8px" }}>
              <button onClick={() => setReceiver({ id: u._id, username: u.username })}>
                💬 {u.username}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <button onClick={() => setReceiver(null)} style={{ margin: "10px" }}>
            ⬅ Back to Users List
          </button>
          <Chat user={user} receiver={receiver} />
        </div>
      )}
    </div>
  );
}

export default App;