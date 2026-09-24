import React from 'react';

/**
 * Renders the drag-and-drop circuit grid: rows = qubits, columns = time steps.
 * gates: array of { gate, qubit, step, control, control2, angle, displayLabel }
 */
const CircuitGrid = ({ numQubits, numSteps, gates, onDropGate, onRemoveGate, onChangeControl, onChangeAngle }) => {
  const findGate = (qubit, step) => gates.find((g) => g.qubit === qubit && g.step === step);
  const findControlMarker = (qubit, step) =>
    gates.find((g) => g.step === step && (g.control === qubit || g.control2 === qubit));

  const handleDrop = (e, qubit, step) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData('application/json');
    if (!raw) return;
    const def = JSON.parse(raw);
    onDropGate(def, qubit, step);
  };

  const otherQubits = (excludeQubit) =>
    Array.from({ length: numQubits }, (_, i) => i).filter((i) => i !== excludeQubit);

  return (
    <div className="circuit-grid">
      {Array.from({ length: numQubits }, (_, q) => (
        <div className="qubit-row" key={q}>
          <div className="qubit-label">q{q}: |0⟩</div>
          <div className="qubit-wire">
            {Array.from({ length: numSteps }, (_, step) => {
              const placed = findGate(q, step);
              const controlMark = findControlMarker(q, step);

              return (
                <div
                  className="grid-cell"
                  key={step}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, q, step)}
                >
                  {placed && (
                    <div className="gate-box" onClick={() => onRemoveGate(placed)} title="Click to remove">
                      <span className="gate-box-label">{placed.displayLabel || placed.gate}</span>

                      {placed.control !== null && placed.control !== undefined && (
                        <select
                          className="gate-control-select"
                          value={placed.control}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => onChangeControl(placed, Number(e.target.value))}
                        >
                          {otherQubits(placed.qubit).map((oq) => (
                            <option key={oq} value={oq}>ctrl q{oq}</option>
                          ))}
                        </select>
                      )}

                      {placed.angle !== null && placed.angle !== undefined && (
                        <input
                          className="gate-angle-input"
                          type="number"
                          step="0.1"
                          value={(placed.angle / Math.PI).toFixed(2)}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => onChangeAngle(placed, Number(e.target.value) * Math.PI)}
                          title="Angle in units of π"
                        />
                      )}
                    </div>
                  )}
                  {!placed && controlMark && <div className="control-dot" title={`control for q${controlMark.qubit}`}>●</div>}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CircuitGrid;
