/**
 * Pre-built "fundamental algorithm" circuit templates.
 * Users can pick one of these from the frontend to load a ready-made
 * circuit into the builder, then edit/extend it and simulate.
 * Each template is expressed using the same gate schema stored in MongoDB.
 */

const templates = {
  bell_state: {
    name: 'Bell State (Entanglement)',
    description: 'Creates the entangled state (|00> + |11>)/sqrt(2) using H + CNOT.',
    numQubits: 2,
    numSteps: 2,
    gates: [
      { gate: 'H', qubit: 0, step: 0, control: null },
      { gate: 'X', qubit: 1, step: 1, control: 0 } // CNOT: control=0, target=1
    ]
  },

  ghz_state: {
    name: 'GHZ State (3-qubit entanglement)',
    description: 'Generalizes the Bell state to 3 qubits: (|000> + |111>)/sqrt(2).',
    numQubits: 3,
    numSteps: 3,
    gates: [
      { gate: 'H', qubit: 0, step: 0, control: null },
      { gate: 'X', qubit: 1, step: 1, control: 0 },
      { gate: 'X', qubit: 2, step: 2, control: 0 }
    ]
  },

  superdense_coding: {
    name: 'Superdense Coding',
    description:
      'Encodes 2 classical bits onto 1 qubit using a shared entangled pair, then decodes so the final measurement directly reveals the bits (example encodes bits "11").',
    numQubits: 2,
    numSteps: 6,
    gates: [
      { gate: 'H', qubit: 0, step: 0, control: null },
      { gate: 'X', qubit: 1, step: 1, control: 0 },
      { gate: 'Z', qubit: 0, step: 2, control: null },
      { gate: 'X', qubit: 0, step: 3, control: null },
      { gate: 'X', qubit: 1, step: 4, control: 0 },
      { gate: 'H', qubit: 0, step: 5, control: null }
    ]
  },

  deutsch_jozsa: {
    name: 'Deutsch-Jozsa Algorithm (2-qubit, balanced oracle example)',
    description:
      'Determines in one query whether a function is constant or balanced. This template wires a balanced-oracle (CNOT) example; qubit 1 is the ancilla output qubit.',
    numQubits: 2,
    numSteps: 4,
    gates: [
      { gate: 'X', qubit: 1, step: 0, control: null },
      { gate: 'H', qubit: 0, step: 1, control: null },
      { gate: 'H', qubit: 1, step: 1, control: null },
      { gate: 'X', qubit: 1, step: 2, control: 0 }, // oracle: balanced function f(x)=x
      { gate: 'H', qubit: 0, step: 3, control: null }
    ]
  },

  grover_2qubit: {
    name: "Grover's Search (2-qubit, marks |11>)",
    description:
      'Amplifies the amplitude of the marked state |11> using one Grover iteration (oracle + diffusion). One iteration is exact for N=4, so |11> is measured with probability 1.',
    numQubits: 2,
    numSteps: 7,
    gates: [
      { gate: 'H', qubit: 0, step: 0, control: null },
      { gate: 'H', qubit: 1, step: 0, control: null },
      // Oracle marks |11> via controlled-Z
      { gate: 'Z', qubit: 1, step: 1, control: 0 },
      // Diffusion operator: H.H -> X.X -> CZ -> X.X -> H.H
      { gate: 'H', qubit: 0, step: 2, control: null },
      { gate: 'H', qubit: 1, step: 2, control: null },
      { gate: 'X', qubit: 0, step: 3, control: null },
      { gate: 'X', qubit: 1, step: 3, control: null },
      { gate: 'Z', qubit: 1, step: 4, control: 0 },
      { gate: 'X', qubit: 0, step: 5, control: null },
      { gate: 'X', qubit: 1, step: 5, control: null },
      { gate: 'H', qubit: 0, step: 6, control: null },
      { gate: 'H', qubit: 1, step: 6, control: null }
    ]
  },

  quantum_teleportation: {
    name: 'Quantum Teleportation (simplified, no classical correction step)',
    description:
      'Teleports the state of qubit 0 to qubit 2 via an entangled pair (qubits 1 & 2). Simplified: shows the entangling + Bell-measurement circuit; classical-controlled corrections are omitted for visualization.',
    numQubits: 3,
    numSteps: 4,
    gates: [
      { gate: 'H', qubit: 1, step: 0, control: null },
      { gate: 'X', qubit: 2, step: 1, control: 1 },
      { gate: 'X', qubit: 1, step: 2, control: 0 },
      { gate: 'H', qubit: 0, step: 3, control: null }
    ]
  },

  quantum_fourier_transform_2q: {
    name: 'Quantum Fourier Transform (2-qubit)',
    description: 'Basic 2-qubit QFT circuit using H, controlled phase rotation, and SWAP.',
    numQubits: 2,
    numSteps: 3,
    gates: [
      { gate: 'H', qubit: 0, step: 0, control: null },
      { gate: 'RZ', qubit: 1, step: 1, control: 0, angle: Math.PI / 2 },
      { gate: 'H', qubit: 1, step: 1, control: null },
      { gate: 'SWAP', qubit: 0, step: 2, control: 1 }
    ]
  }
};

module.exports = templates;
