const mongoose = require('mongoose');

const gateSchema = new mongoose.Schema(
  {
    gate: { type: String, required: true },      // e.g. 'H', 'X', 'CNOT', 'RZ'
    qubit: { type: Number, required: true },      // target qubit index
    step: { type: Number, required: true },       // column / time step index
    control: { type: Number, default: null },     // control qubit index (for CNOT/CZ)
    control2: { type: Number, default: null },    // second control (for Toffoli)
    angle: { type: Number, default: null }        // rotation angle in radians (for RX/RY/RZ)
  },
  { _id: false }
);

const circuitSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    numQubits: { type: Number, required: true, min: 1, max: 8 },
    numSteps: { type: Number, required: true, min: 1, max: 20 },
    gates: [gateSchema],
    algorithmTemplate: { type: String, default: null },
    lastResult: {
      probabilities: [Number],
      stateVector: [{ re: Number, im: Number }],
      measuredAt: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Circuit', circuitSchema);
