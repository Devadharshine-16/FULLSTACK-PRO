import { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import "./App.css";

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

// navbar component
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

// home component
function Home() {
  return <h2>Welcome to Courier Management System</h2>;
}

// register 
function Register() {
  const [form, setForm] = useState({ username: "", password: "" });

  async function handleSubmit(e) {
    e.preventDefault();

    const res = await fetch("http://localhost:3000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    alert(data.message);
  }

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Username"
          onChange={(e) => setForm({ ...form, username: e.target.value })} /><br />

        <input type="password" placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })} /><br />

        <button>Register</button>
      </form>
    </div>
  );
}

// login
function Login() {
  const [login, setLogin] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    const res = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(login),
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      alert("Login Successful");
      navigate("/add");
    } else {
      alert(data.message);
    }
  }

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Username"
          onChange={(e) => setLogin({ ...login, username: e.target.value })} /><br />

        <input type="password" placeholder="Password"
          onChange={(e) => setLogin({ ...login, password: e.target.value })} /><br />

        <button>Login</button>
      </form>
    </div>
  );
}

// add edit delete
function AddParcel() {
  const [parcel, setParcel] = useState({
    senderName: "",
    receiverName: "",
    origin: "",
    destination: "",
  });

  const [parcels, setParcels] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const API = "http://localhost:3000/api/parcel";

  //load
  async function loadParcels() {
      const token = localStorage.getItem("token");
      const res = await fetch(API, {
        headers: { Authorization: "Bearer " + token },
      });
      const data = await res.json();
      console.log('Loaded parcels:', data);
      setParcels(data);
  }

  useEffect(() => {
    loadParcels();
  }, []);

  // Add or update parcel
  async function handleSubmit(e) {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      if (editingId) {
        // UPDATE
        const response = await fetch(`${API}/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify(parcel),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          console.error('Update error:', data);
          throw new Error(data.message || 'Failed to update parcel');
        }
        
        alert('Parcel updated successfully');
      } else {
        // CREATE
        const response = await fetch(API, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify(parcel),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          console.error('Create error:', data);
          throw new Error(data.message || 'Failed to add parcel');
        }
        
        alert('Parcel added successfully');
      }

      // Reset form and reload parcels
      setParcel({ senderName: "", receiverName: "", origin: "", destination: "" });
      setEditingId(null);
      await loadParcels();
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'An error occurred');
    }
  }

  // Delete parcel
  async function deleteParcel(trackingId) {
    if (!window.confirm('Are you sure you want to delete this parcel?')) return;
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API}/${trackingId}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete parcel');
      }
      
      alert('Parcel deleted successfully');
      await loadParcels();
    } catch (error) {
      console.error('Error deleting parcel:', error);
      alert('Failed to delete parcel: ' + error.message);
    }
  }

  // Edit parcel
  function editParcel(p) {
    console.log('Editing parcel:', p);
    setParcel({
      senderName: p.senderName,
      receiverName: p.receiverName,
      origin: p.origin,
      destination: p.destination,
    });
    // Use the same ID that's used in the URL (trackingId)
    setEditingId(p.trackingId);
    console.log('Set editing ID to:', p.trackingId);
  }

  return (
    <div>
      <h2>{editingId ? "Edit Parcel" : "Add Parcel"}</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Sender Name"
          value={parcel.senderName}
          onChange={(e) =>
            setParcel({ ...parcel, senderName: e.target.value })
          }
        /><br />

        <input
          placeholder="Receiver Name"
          value={parcel.receiverName}
          onChange={(e) =>
            setParcel({ ...parcel, receiverName: e.target.value })
          }
        /><br />

        <input
          placeholder="Origin"
          value={parcel.origin}
          onChange={(e) =>
            setParcel({ ...parcel, origin: e.target.value })
          }
        /><br />

        <input
          placeholder="Destination"
          value={parcel.destination}
          onChange={(e) =>
            setParcel({ ...parcel, destination: e.target.value })
          }
        /><br />

        <button>{editingId ? "Update Parcel" : "Add Parcel"}</button>
      </form>

      <hr />

      <h3>Your Parcels</h3>

      {parcels.map((p) => (
        <div key={p.trackingId} style={{ marginBottom: "10px" }}>
          <b>{p.senderName}</b> → {p.receiverName} (ID: {p.trackingId})
          <br />
          {p.origin} ➝ {p.destination}
          <br />
          <button onClick={() => editParcel(p)}>Edit</button>
          <button onClick={() => deleteParcel(p.trackingId)} style={{ marginLeft: 10 }}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
