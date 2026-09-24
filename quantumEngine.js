/**
 * Pure JavaScript quantum state-vector simulator.
 * No external quantum computing libraries are used - this is the whole
 * math engine written from scratch for the MERN stack (Node.js backend).
 *
 * Complex numbers are represented as {re, im} objects.
 * A quantum state of n qubits is an array of 2^n complex amplitudes,
 * where basis state index i corresponds to the binary representation
 * of i (qubit 0 = least significant bit).
 */

const cAdd = (a, b) => ({ re: a.re + b.re, im: a.im + b.im });
const cMul = (a, b) => ({
  re: a.re * b.re - a.im * b.im,
  im: a.re * b.im + a.im * b.re
});
const cScale = (a, s) => ({ re: a.re * s, im: a.im * s });
const cAbs2 = (a) => a.re * a.re + a.im * a.im;
const C = (re = 0, im = 0) => ({ re, im });

const SQRT1_2 = 1 / Math.sqrt(2);

// Standard single-qubit gate matrices, each as [[a,b],[c,d]] of complex numbers.
const GATES = {
  I: [[C(1), C(0)], [C(0), C(1)]],
  X: [[C(0), C(1)], [C(1), C(0)]],
  Y: [[C(0), C(0, -1)], [C(0, 1), C(0)]],
  Z: [[C(1), C(0)], [C(0), C(-1)]],
  H: [[C(SQRT1_2), C(SQRT1_2)], [C(SQRT1_2), C(-SQRT1_2)]],
  S: [[C(1), C(0)], [C(0), C(0, 1)]],
  T: [[C(1), C(0)], [C(0), C(Math.cos(Math.PI / 4), Math.sin(Math.PI / 4))]]
};

function rotationGate(axis, theta) {
  const c = Math.cos(theta / 2);
  const s = Math.sin(theta / 2);
  if (axis === 'RX') {
    return [
      [C(c, 0), C(0, -s)],
      [C(0, -s), C(c, 0)]
    ];
  }
  if (axis === 'RY') {
    return [
      [C(c, 0), C(-s, 0)],
      [C(s, 0), C(c, 0)]
    ];
  }
  if (axis === 'RZ') {
    return [
      [C(Math.cos(-theta / 2), Math.sin(-theta / 2)), C(0)],
      [C(0), C(Math.cos(theta / 2), Math.sin(theta / 2))]
    ];
  }
  throw new Error(`Unknown rotation axis ${axis}`);
}

function createInitialState(numQubits) {
  const size = 1 << numQubits;
  const state = new Array(size).fill(null).map(() => C(0, 0));
  state[0] = C(1, 0); // |00...0>
  return state;
}

/** Apply a single-qubit 2x2 gate matrix to `qubit` of the state vector. */
function applySingleQubitGate(state, matrix, qubit) {
  const size = state.length;
  const newState = new Array(size).fill(null).map(() => C(0, 0));
  const bit = 1 << qubit;

  for (let i = 0; i < size; i++) {
    if ((i & bit) !== 0) continue; // process pairs once, using the |0> index of the pair
    const i0 = i;
    const i1 = i | bit;
    const a0 = state[i0];
    const a1 = state[i1];

    newState[i0] = cAdd(newState[i0], cAdd(cMul(matrix[0][0], a0), cMul(matrix[0][1], a1)));
    newState[i1] = cAdd(newState[i1], cAdd(cMul(matrix[1][0], a0), cMul(matrix[1][1], a1)));
  }
  return newState;
}

/**
 * Apply a single-qubit gate with one or two control qubits (CNOT, CZ, Toffoli, controlled-rotations).
 * The gate only acts on `target` when ALL control qubits are |1>.
 */
function applyControlledGate(state, matrix, target, controls) {
  const size = state.length;
  const newState = state.slice();
  const targetBit = 1 << target;

  for (let i = 0; i < size; i++) {
    if ((i & targetBit) !== 0) continue;
    const controlsActive = controls.every((c) => (i & (1 << c)) !== 0);
    if (!controlsActive) continue;

    const i0 = i;
    const i1 = i | targetBit;
    const a0 = state[i0];
    const a1 = state[i1];

    newState[i0] = cAdd(cMul(matrix[0][0], a0), cMul(matrix[0][1], a1));
    newState[i1] = cAdd(cMul(matrix[1][0], a0), cMul(matrix[1][1], a1));
  }
  return newState;
}

function applySwap(state, qubitA, qubitB) {
  const size = state.length;
  const newState = state.slice();
  const bitA = 1 << qubitA;
  const bitB = 1 << qubitB;

  for (let i = 0; i < size; i++) {
    const aSet = (i & bitA) !== 0;
    const bSet = (i & bitB) !== 0;
    if (aSet !== bSet) {
      const j = i ^ bitA ^ bitB;
      if (i < j) {
        newState[i] = state[j];
        newState[j] = state[i];
      }
    }
  }
  return newState;
}

/**
 * Run a full circuit.
 * circuit.gates: array of { gate, qubit, control, control2, angle, step }
 * Steps are applied in ascending `step` order; gates within the same step
 * are applied in array order (they should act on disjoint qubits).
 */
function runCircuit({ numQubits, gates }) {
  let state = createInitialState(numQubits);
  const sorted = [...gates].sort((a, b) => a.step - b.step);

  for (const g of sorted) {
    const name = g.gate.toUpperCase();

    if (name === 'SWAP') {
      state = applySwap(state, g.qubit, g.control);
      continue;
    }

    let matrix;
    if (['RX', 'RY', 'RZ'].includes(name)) {
      matrix = rotationGate(name, g.angle || 0);
    } else if (GATES[name]) {
      matrix = GATES[name];
    } else {
      throw new Error(`Unsupported gate: ${g.gate}`);
    }

    const controls = [];
    if (g.control !== null && g.control !== undefined) controls.push(g.control);
    if (g.control2 !== null && g.control2 !== undefined) controls.push(g.control2);

    if (controls.length > 0) {
      state = applyControlledGate(state, matrix, g.qubit, controls);
    } else {
      state = applySingleQubitGate(state, matrix, g.qubit);
    }
  }

  const probabilities = state.map((amp) => cAbs2(amp));
  return { stateVector: state, probabilities };
}

/** Simulate `shots` measurements sampled from the probability distribution. */
function simulateMeasurements(probabilities, shots = 1024) {
  const numQubits = Math.log2(probabilities.length);
  const counts = {};
  // cumulative distribution for sampling
  const cumulative = [];
  let running = 0;
  for (const p of probabilities) {
    running += p;
    cumulative.push(running);
  }

  for (let s = 0; s < shots; s++) {
    const r = Math.random() * running; // running should be ~1 but guard against fp drift
    let idx = cumulative.findIndex((c) => r <= c);
    if (idx === -1) idx = probabilities.length - 1;
    const bitstring = idx.toString(2).padStart(numQubits, '0');
    counts[bitstring] = (counts[bitstring] || 0) + 1;
  }
  return counts;
}

module.exports = {
  C,
  GATES,
  createInitialState,
  applySingleQubitGate,
  applyControlledGate,
  applySwap,
  rotationGate,
  runCircuit,
  simulateMeasurements
};
