import React, { useEffect, useState } from 'react';
import api from '../services/api';

const AlgorithmSelector = ({ onLoadTemplate }) => {
  const [templates, setTemplates] = useState([]);
  const [selected, setSelected] = useState('');

  useEffect(() => {
    api.get('/circuits/templates/list').then(({ data }) => setTemplates(data));
  }, []);

  const load = async () => {
    if (!selected) return;
    const { data } = await api.get(`/circuits/templates/${selected}`);
    onLoadTemplate(data, selected);
  };

  return (
    <div className="algorithm-selector">
      <h4>Fundamental Algorithms</h4>
      <p className="muted">Load a ready-made circuit for a well-known quantum algorithm, then edit it further.</p>
      <select value={selected} onChange={(e) => setSelected(e.target.value)}>
        <option value="">-- choose an algorithm --</option>
        {templates.map((t) => (
          <option key={t.key} value={t.key}>{t.name}</option>
        ))}
      </select>
      <button className="btn-secondary" onClick={load} disabled={!selected}>Load into builder</button>
      {selected && templates.find((t) => t.key === selected) && (
        <p className="template-desc">{templates.find((t) => t.key === selected).description}</p>
      )}
    </div>
  );
};

export default AlgorithmSelector;
