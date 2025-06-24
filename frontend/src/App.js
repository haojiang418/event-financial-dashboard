// src/App.js
import React, { useState, useEffect } from "react";

function App() {
  const [events, setEvents] = useState([]);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/events")
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        setEvents(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setError("Failed to load events");
        setLoading(false);
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    const payload = { name, date };
    fetch("/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((newEvent) => {
        setEvents((prev) => [...prev, newEvent]);
        setName("");
        setDate("");
      })
      .catch((err) => {
        console.error("POST error:", err);
        setError("Failed to add event");
      });
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Financial Dashboard</h1>

      {/* Form to add a new event */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
        <div style={{ marginBottom: "0.5rem" }}>
          <label>
            Name:{" "}
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
        </div>
        <div style={{ marginBottom: "0.5rem" }}>
          <label>
            Date:{" "}
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </label>
        </div>
        <button type="submit">Add Event</button>
        {error && (
          <p style={{ color: "red", marginTop: "0.5rem" }}>{error}</p>
        )}
      </form>

      {/* Display loading, error, or event list */}
      {loading ? (
        <p>Loading events…</p>
      ) : error && events.length === 0 ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : events.length === 0 ? (
        <p>No events yet.</p>
      ) : (
        <ul>
          {events.map((evt) => (
            <li key={evt._id}>
              <strong>{evt.name}</strong> — {evt.date}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
