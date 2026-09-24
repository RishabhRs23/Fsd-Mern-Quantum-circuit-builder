import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import GatePalette from './GatePalette';
import CircuitGrid from './CircuitGrid';
import ResultsPanel from './ResultsPanel';
import AlgorithmSelector from './AlgorithmSelector';

const emptyCircuit = { name: 'Untitled Circuit', numQubits: 3, numSteps: 6, gates: [], algorithmTemplate: null };

const CircuitBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [circuit, setCircuit] = useState(emptyCircuit);
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      api.get(`/circuits/${id}`).then(({ data }) => setCircuit(data));
    } else {
      setCircuit(emptyCircuit);
    }
  }, [id]);

  const updateField = (field, value) => setCircuit((c) => ({ ...c, [field]: value }));

  const onDropGate = useCallback((def, qubit, step) => {
    setCircuit((c) => {
      const filtered = c.gates.filter((g) => !(g.qubit === qubit && g.step === step));
      const newGate = {
        gate: def.gate,
        displayLabel: def.displayLabel,
        qubit,
        step,
        control: def.twoQubit ? (qubit + 1) % c.numQubits : null,
        control2: null,
        angle: def.rotation ? Math.PI / 2 : null
      };
      return { ...c, gates: [...filtered, newGate] };
    });
  }, []);

  const onRemoveGate = (gateToRemove) => {
    setCircuit((c) => ({
      ...c,
      gates: c.gates.filter((g) => !(g.qubit === gateToRemove.qubit && g.step === gateToRemove.step))
    }));
  };

  const onChangeControl = (gateToChange, newControl) => {
    setCircuit((c) => ({
      ...c,
      gates: c.gates.map((g) =>
        g.qubit === gateToChange.qubit && g.step === gateToChange.step ? { ...g, control: newControl } : g
      )
    }));
  };

  const onChangeAngle = (gateToChange, newAngle) => {
    setCircuit((c) => ({
      ...c,
      gates: c.gates.map((g) =>
        g.qubit === gateToChange.qubit && g.step === gateToChange.step ? { ...g, angle: newAngle } : g
      )
    }));
  };

  const loadTemplate = (template, key) => {
    setCircuit((c) => ({
      ...c,
      name: template.name,
      numQubits: template.numQubits,
      numSteps: template.numSteps,
      gates: template.gates.map((g) => ({ ...g, displayLabel: g.gate === 'X' && g.control !== null ? 'CNOT' : g.gate })),
      algorithmTemplate: key
    }));
    setResult(null);
  };

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      if (id) {
        await api.put(`/circuits/${id}`, circuit);
      } else {
        const { data } = await api.post('/circuits', circuit);
        navigate(`/builder/${data._id}`, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const runSimulation = async () => {
    setError('');
    try {
      const { data } = await api.post('/circuits/simulate', {
        numQubits: circuit.numQubits,
        gates: circuit.gates,
        shots: 1024
      });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Simulation failed');
    }
  };

  return (
    <div className="builder-page">
      <div className="builder-toolbar">
        <input
          className="circuit-name-input"
          value={circuit.name}
          onChange={(e) => updateField('name', e.target.value)}
        />
        <label>
          Qubits:
          <input
            type="number"
            min={1}
            max={8}
            value={circuit.numQubits}
            onChange={(e) => updateField('numQubits', Number(e.target.value))}
          />
        </label>
        <label>
          Steps:
          <input
            type="number"
            min={1}
            max={20}
            value={circuit.numSteps}
            onChange={(e) => updateField('numSteps', Number(e.target.value))}
          />
        </label>
        <button className="btn-secondary" onClick={save} disabled={saving}>
          {saving ? 'Saving...' : 'Save Circuit'}
        </button>
        <button className="btn-primary" onClick={runSimulation}>Simulate</button>
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="builder-layout">
        <div className="builder-sidebar">
          <GatePalette />
          <AlgorithmSelector onLoadTemplate={loadTemplate} />
        </div>

        <div className="builder-main">
          <CircuitGrid
            numQubits={circuit.numQubits}
            numSteps={circuit.numSteps}
            gates={circuit.gates}
            onDropGate={onDropGate}
            onRemoveGate={onRemoveGate}
            onChangeControl={onChangeControl}
            onChangeAngle={onChangeAngle}
          />
          <ResultsPanel result={result} numQubits={circuit.numQubits} />
        </div>
      </div>
    </div>
  );
};

export default CircuitBuilder;
