import React from 'react';

// Fundamental gates a user can drag onto the circuit grid.
const GATE_DEFS = [
  { gate: 'H', label: 'H', desc: 'Hadamard - creates superposition', twoQubit: false },
  { gate: 'X', label: 'X', desc: 'Pauli-X (NOT)', twoQubit: false },
  { gate: 'Y', label: 'Y', desc: 'Pauli-Y', twoQubit: false },
  { gate: 'Z', label: 'Z', desc: 'Pauli-Z (phase flip)', twoQubit: false },
  { gate: 'S', label: 'S', desc: 'Phase gate (90°)', twoQubit: false },
  { gate: 'T', label: 'T', desc: 'π/8 phase gate', twoQubit: false },
  { gate: 'RX', label: 'RX', desc: 'Rotation about X axis', twoQubit: false, rotation: true },
  { gate: 'RY', label: 'RY', desc: 'Rotation about Y axis', twoQubit: false, rotation: true },
  { gate: 'RZ', label: 'RZ', desc: 'Rotation about Z axis', twoQubit: false, rotation: true },
  { gate: 'X', label: 'CNOT', desc: 'Controlled-NOT (needs a control qubit)', twoQubit: true },
  { gate: 'Z', label: 'CZ', desc: 'Controlled-Z (needs a control qubit)', twoQubit: true },
  { gate: 'SWAP', label: 'SWAP', desc: 'Swap two qubits', twoQubit: true }
];

const GatePalette = () => {
  const onDragStart = (e, def) => {
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({ gate: def.gate, displayLabel: def.label, twoQubit: def.twoQubit, rotation: !!def.rotation })
    );
  };

  return (
    <div className="gate-palette">
      <h4>Gates (drag onto grid)</h4>
      <div className="gate-list">
        {GATE_DEFS.map((def) => (
          <div
            key={def.label}
            className="gate-chip"
            draggable
            onDragStart={(e) => onDragStart(e, def)}
            title={def.desc}
          >
            {def.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GatePalette;
