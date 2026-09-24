import React from 'react';

const formatComplex = (c) => {
  const re = c.re.toFixed(3);
  const im = c.im.toFixed(3);
  const sign = c.im >= 0 ? '+' : '-';
  return `${re} ${sign} ${Math.abs(c.im).toFixed(3)}i`;
};

const ResultsPanel = ({ result, numQubits }) => {
  if (!result) {
    return (
      <div className="results-panel">
        <h4>Simulation Results</h4>
        <p className="muted">Run a simulation to see the state vector and measurement probabilities.</p>
      </div>
    );
  }

  const { probabilities, stateVector, counts } = result;
  const maxProb = Math.max(...probabilities, 0.0001);

  return (
    <div className="results-panel">
      <h4>Measurement Probabilities</h4>
      <div className="prob-bars">
        {probabilities.map((p, i) => {
          const bitstring = i.toString(2).padStart(numQubits, '0');
          return (
            <div className="prob-bar-row" key={i}>
              <span className="prob-label">|{bitstring}⟩</span>
              <div className="prob-bar-track">
                <div className="prob-bar-fill" style={{ width: `${(p / maxProb) * 100}%` }} />
              </div>
              <span className="prob-value">{(p * 100).toFixed(1)}%</span>
            </div>
          );
        })}
      </div>

      {counts && (
        <>
          <h4>Simulated Measurement Counts (1024 shots)</h4>
          <div className="counts-list">
            {Object.entries(counts)
              .sort((a, b) => b[1] - a[1])
              .map(([bitstring, count]) => (
                <span key={bitstring} className="count-chip">
                  |{bitstring}⟩: {count}
                </span>
              ))}
          </div>
        </>
      )}

      <details className="state-vector-details">
        <summary>Raw state vector amplitudes</summary>
        <ul>
          {stateVector.map((c, i) => (
            <li key={i}>
              |{i.toString(2).padStart(numQubits, '0')}⟩: {formatComplex(c)}
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
};

export default ResultsPanel;
