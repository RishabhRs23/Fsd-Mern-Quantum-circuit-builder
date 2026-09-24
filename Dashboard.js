import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Dashboard = () => {
  const [circuits, setCircuits] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    const { data } = await api.get('/circuits');
    setCircuits(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    if (!window.confirm('Delete this circuit?')) return;
    await api.delete(`/circuits/${id}`);
    load();
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>My Circuits</h2>
        <button className="btn-primary" onClick={() => navigate('/builder')}>
          + New Circuit
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : circuits.length === 0 ? (
        <p>No circuits yet. Create one, or start from a fundamental algorithm template.</p>
      ) : (
        <div className="circuit-grid-list">
          {circuits.map((c) => (
            <div className="circuit-card" key={c._id}>
              <h3>{c.name}</h3>
              <p>{c.numQubits} qubits · {c.gates.length} gates</p>
              {c.algorithmTemplate && <span className="badge">{c.algorithmTemplate}</span>}
              <div className="circuit-card-actions">
                <Link to={`/builder/${c._id}`} className="btn-secondary">Open</Link>
                <button className="btn-danger" onClick={() => remove(c._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
