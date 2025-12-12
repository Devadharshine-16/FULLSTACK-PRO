import { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import "./App.css";

const BASE_URL = "https://fullstack-pro-1.onrender.com/api";

export default function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/add" element={<AddParcel />} />
      </Routes>
    </div>
  );
}

function Navbar() {
  return (
    <nav style={{ padding: "10px" }}>
      <Link to="/" style={{ marginRight: 15 }}>Home</Link>
      <Link to="/register" style={{ marginRight: 15 }}>Register</Link>
      <Link to="/login" style={{ marginRight: 15 }}>Login</Link>
      <Link to="/add">Add Parcel</Link>
    </nav>
  );
}

function Home() {
  return <h2>Welcome to Courier Management System</h2>;
}

function Register() {
  const [form, setForm] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      // check response content type
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Invalid response from server");
      }

      const data = await res.json();

      if (data.token) {
        alert("Registered successfully! Please login.");
        navigate("/login");
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Registration failed: " + error.message);
    }
  }

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        /><br />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        /><br />
        <button>Register</button>
      </form>
    </div>
  );
}

function Login() {
  const [login, setLogin] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(login),
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Invalid response from server");
      }

      const data = await res.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
        alert("Login Successful");
        navigate("/add");
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Login failed: " + error.message);
    }
  }

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          onChange={(e) => setLogin({ ...login, username: e.target.value })}
        /><br />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setLogin({ ...login, password: e.target.value })}
        /><br />
        <button>Login</button>
      </form>
    </div>
  );
}

function AddParcel() {
  const [parcel, setParcel] = useState({ senderName: "", receiverName: "", origin: "", destination: "" });
  const [parcels, setParcels] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const API = `${BASE_URL}/parcel`;

  async function loadParcels() {
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      const res = await fetch(API, { headers: { Authorization: "Bearer " + token } });
      if (!res.ok) throw new Error("Failed to fetch parcels");
      const data = await res.json();
      setParcels(data);
    } catch (err) {
      alert(err.message);
    }
  }

  useEffect(() => { loadParcels(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!token) { alert("Please login first"); navigate("/login"); return; }

    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `${API}/${editingId}` : API;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify(parcel)
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Operation failed");
      }
      alert(editingId ? "Parcel updated" : "Parcel added");
      setParcel({ senderName: "", receiverName: "", origin: "", destination: "" });
      setEditingId(null);
      await loadParcels();
    } catch (err) {
      alert(err.message);
    }
  }

  async function deleteParcel(id) {
    if (!window.confirm("Delete this parcel?")) return;
    if (!token) { alert("Please login first"); return; }
    try {
      const res = await fetch(`${API}/${id}`, { method: "DELETE", headers: { Authorization: "Bearer " + token } });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Delete failed");
      }
      alert("Parcel deleted");
      await loadParcels();
    } catch (err) { alert(err.message); }
  }

  function editParcel(p) {
    setParcel({ senderName: p.senderName, receiverName: p.receiverName, origin: p.origin, destination: p.destination });
    setEditingId(p._id);
  }

  return (
    <div>
      <h2>{editingId ? "Edit Parcel" : "Add Parcel"}</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Sender Name" value={parcel.senderName} onChange={e => setParcel({ ...parcel, senderName: e.target.value })} /><br />
        <input placeholder="Receiver Name" value={parcel.receiverName} onChange={e => setParcel({ ...parcel, receiverName: e.target.value })} /><br />
        <input placeholder="Origin" value={parcel.origin} onChange={e => setParcel({ ...parcel, origin: e.target.value })} /><br />
        <input placeholder="Destination" value={parcel.destination} onChange={e => setParcel({ ...parcel, destination: e.target.value })} /><br />
        <button>{editingId ? "Update Parcel" : "Add Parcel"}</button>
      </form>
      <hr />
      <h3>Your Parcels</h3>
      {parcels.length === 0 && <p>No parcels found.</p>}
      {parcels.map(p => (
        <div key={p._id} style={{ marginBottom: "10px" }}>
          <b>{p.senderName}</b> → {p.receiverName} (ID: {p.trackingId})<br />
          {p.origin} ➝ {p.destination}<br />
          <button onClick={() => editParcel(p)}>Edit</button>
          <button onClick={() => deleteParcel(p._id)} style={{ marginLeft: 10 }}>Delete</button>
        </div>
      ))}
    </div>
  );
}
