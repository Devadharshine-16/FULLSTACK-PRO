import { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import "./App.css";

const BASE_URL = "https://fullstack-pro-1d3y.onrender.com/api";

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

// Navbar component
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

// Home component
function Home() {
  return <h2>Welcome to Courier Management System</h2>;
}

// Register component
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

// Login component
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

      const data = await res.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
        alert("Login Successful");
        navigate("/add"); // Redirect to Add Parcel page after login
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

// Add / Edit / Delete Parcel component
function AddParcel() {
  const [parcel, setParcel] = useState({
    senderName: "",
    receiverName: "",
    origin: "",
    destination: "",
  });

  const [parcels, setParcels] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const API = `${BASE_URL}/parcel`;

  const token = localStorage.getItem("token");

  // Load parcels
  async function loadParcels() {
    try {
      const res = await fetch(API, {
        headers: { Authorization: "Bearer " + token },
      });
      const data = await res.json();
      setParcels(data);
    } catch (error) {
      console.error("Failed to load parcels:", error);
    }
  }

  useEffect(() => {
    if (token) loadParcels();
  }, [token]);

  // Add or update parcel
  async function handleSubmit(e) {
    e.preventDefault();

    try {
      let res;
      if (editingId) {
        // UPDATE
        res = await fetch(`${API}/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify(parcel),
        });
      } else {
        // CREATE
        res = await fetch(API, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify(parcel),
        });
      }

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Operation failed");

      alert(editingId ? "Parcel updated successfully" : "Parcel added successfully");
      setParcel({ senderName: "", receiverName: "", origin: "", destination: "" });
      setEditingId(null);
      await loadParcels();
    } catch (error) {
      alert(error.message);
    }
  }

  // Delete parcel
  async function deleteParcel(trackingId) {
    if (!window.confirm("Are you sure you want to delete this parcel?")) return;

    try {
      const res = await fetch(`${API}/${trackingId}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete parcel");

      alert("Parcel deleted successfully");
      await loadParcels();
    } catch (error) {
      alert(error.message);
    }
  }

  // Edit parcel
  function editParcel(p) {
    setParcel({
      senderName: p.senderName,
      receiverName: p.receiverName,
      origin: p.origin,
      destination: p.destination,
    });
    setEditingId(p.trackingId);
  }

  return (
    <div>
      <h2>{editingId ? "Edit Parcel" : "Add Parcel"}</h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Sender Name"
          value={parcel.senderName}
          onChange={(e) => setParcel({ ...parcel, senderName: e.target.value })}
        /><br />
        <input
          placeholder="Receiver Name"
          value={parcel.receiverName}
          onChange={(e) => setParcel({ ...parcel, receiverName: e.target.value })}
        /><br />
        <input
          placeholder="Origin"
          value={parcel.origin}
          onChange={(e) => setParcel({ ...parcel, origin: e.target.value })}
        /><br />
        <input
          placeholder="Destination"
          value={parcel.destination}
          onChange={(e) => setParcel({ ...parcel, destination: e.target.value })}
        /><br />
        <button>{editingId ? "Update Parcel" : "Add Parcel"}</button>
      </form>

      <hr />

      <h3>Your Parcels</h3>
      {parcels.length === 0 && <p>No parcels found.</p>}
      {parcels.map((p) => (
        <div key={p.trackingId} style={{ marginBottom: "10px" }}>
          <b>{p.senderName}</b> → {p.receiverName} (ID: {p.trackingId})<br />
          {p.origin} ➝ {p.destination}<br />
          <button onClick={() => editParcel(p)}>Edit</button>
          <button onClick={() => deleteParcel(p.trackingId)} style={{ marginLeft: 10 }}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
