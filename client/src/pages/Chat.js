 import { useEffect, useState } from "react";
import axios from "axios";
import { socket } from "../services/socket";
import "./Chat.css";

function Chat({ user, receiver }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUser, setTypingUser] = useState(null);

  const fetchMessages = async () => {
    if (!receiver) return;
    try {
      const res = await axios.get(
        "http://localhost:5000/api/messages/" + user.id + "/" + receiver.id
      );
      setMessages(res.data);
    } catch (err) {
      console.log("Fetch messages error:", err);
    }
  };

  useEffect(() => {
    socket.emit("register_user", user.id);

    socket.on("connect", () => {
      socket.emit("register_user", user.id);
      fetchMessages();
    });

    socket.on("receive_message", (data) => {
      const belongsHere =
        (data.sender === (receiver && receiver.id) && data.receiver === user.id) ||
        (data.sender === user.id && data.receiver === (receiver && receiver.id));
      if (belongsHere) {
        setMessages((prev) => [...prev, data]);
      }
    });

    socket.on("update_online_users", (users) => {
      setOnlineUsers(users);
    });

    socket.on("user_typing", (senderId) => {
      setTypingUser(senderId);
    });

    socket.on("user_stop_typing", () => {
      setTypingUser(null);
    });

    return () => {
      socket.off("connect");
      socket.off("receive_message");
      socket.off("update_online_users");
      socket.off("user_typing");
      socket.off("user_stop_typing");
    };
  }, [user, receiver]);

  useEffect(() => {
    fetchMessages();
  }, [receiver, user]);

  // Safety net: har 5 second me messages refresh karo
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMessages();
    }, 5000);
    return () => clearInterval(interval);
  }, [receiver, user]);

  const handleTyping = () => {
    socket.emit("typing", { sender: user.id, receiver: receiver.id });
    clearTimeout(window.typingTimeout);
    window.typingTimeout = setTimeout(() => {
      socket.emit("stop_typing", { sender: user.id, receiver: receiver.id });
    }, 1500);
  };

  const sendMessage = async () => {
    if (!text.trim()) return;
    const msg = { sender: user.id, receiver: receiver.id, text: text };
    socket.emit("send_message", msg);
    setMessages((prev) => [...prev, msg]);
    setText("");
    try {
      await axios.post("http://localhost:5000/api/messages", msg);
    } catch (err) {
      console.log("Save message error:", err);
    }
  };

  const handleFileUpload = async () => {
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await axios.post(
        "http://localhost:5000/api/messages/upload",
        formData
      );
      const fileUrl = uploadRes.data.fileUrl;

      const msg = { sender: user.id, receiver: receiver.id, fileUrl: fileUrl };
      socket.emit("send_message", msg);
      setMessages((prev) => [...prev, msg]);
      setFile(null);

      await axios.post("http://localhost:5000/api/messages", msg);
    } catch (err) {
      console.log("File upload error:", err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const openFile = (url) => {
    window.open("http://localhost:5000" + url, "_blank");
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>{receiver ? receiver.username : ""}</h3>
        <span>
          {onlineUsers.includes(receiver ? receiver.id : null) ? "Online" : "Offline"}
        </span>
      </div>

      <div className="messages">
        {messages.map((m, i) => {
          const isImage = m.fileUrl && m.fileUrl.match(/\.(jpg|jpeg|png|gif)$/i);
          return (
            <div key={i} className={m.sender === user.id ? "sent" : "received"}>
              {m.text ? <p>{m.text}</p> : null}
              {m.fileUrl && isImage ? (
                <img
                  src={"http://localhost:5000" + m.fileUrl}
                  alt="shared file"
                  width="180"
                />
              ) : null}
              {m.fileUrl && !isImage ? (
                <button onClick={() => openFile(m.fileUrl)}>
                  Download File
                </button>
              ) : null}
            </div>
          );
        })}
      </div>

      {typingUser === (receiver ? receiver.id : null) ? (
        <p className="typing-text">
          {receiver ? receiver.username : ""} is typing...
        </p>
      ) : null}

      <div className="chat-input">
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        {file ? <button onClick={handleFileUpload}>Send File</button> : null}
        <input
          type="text"
          value={text}
          placeholder="Type a message..."
          onChange={(e) => {
            setText(e.target.value);
            handleTyping();
          }}
          onKeyPress={handleKeyPress}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default Chat;