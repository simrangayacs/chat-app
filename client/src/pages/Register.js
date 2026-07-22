import { useState } from "react";
import axios from "axios";
import "./Auth.css";

function Register({ onRegisterSuccess }) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const API_URL = process.env.REACT_APP_API_URL;
      await axios.post(`${API_URL}/auth/register`, form);
      onRegisterSuccess();
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2 className="auth-form-title">Create account</h2>
      <p className="auth-form-subtitle">Chatly join karo, 1 minute lagega</p>

      {error && <div className="auth-error">{error}</div>}

      <label className="auth-field">
        <span>Username</span>
        <input
          placeholder="yourname"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
        />
      </label>

      <label className="auth-field">
        <span>Email</span>
        <input
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
      </label>

      <label className="auth-field">
        <span>Password</span>
        <input
          type="password"
          placeholder="••••••••"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
      </label>

      <button className="auth-submit" type="submit" disabled={loading}>
        {loading ? "Creating..." : "Register"}
      </button>
    </form>
  );
}

export default Register;
