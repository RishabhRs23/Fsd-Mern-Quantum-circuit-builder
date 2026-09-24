const Circuit = require('../models/Circuit');
const { runCircuit, simulateMeasurements } = require('../utils/quantumEngine');
const algorithmTemplates = require('../utils/algorithmTemplates');

// @route GET /api/circuits
const getCircuits = async (req, res) => {
  try {
    const circuits = await Circuit.find({ user: req.user._id }).sort({ updatedAt: -1 });
    res.json(circuits);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/circuits/:id
const getCircuitById = async (req, res) => {
  try {
    const circuit = await Circuit.findOne({ _id: req.params.id, user: req.user._id });
    if (!circuit) return res.status(404).json({ message: 'Circuit not found' });
    res.json(circuit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/circuits
const createCircuit = async (req, res) => {
  try {
    const { name, numQubits, numSteps, gates, algorithmTemplate } = req.body;
    if (!name || !numQubits || !numSteps) {
      return res.status(400).json({ message: 'name, numQubits and numSteps are required' });
    }
    const circuit = await Circuit.create({
      user: req.user._id,
      name,
      numQubits,
      numSteps,
      gates: gates || [],
      algorithmTemplate: algorithmTemplate || null
    });
    res.status(201).json(circuit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/circuits/:id
const updateCircuit = async (req, res) => {
  try {
    const circuit = await Circuit.findOne({ _id: req.params.id, user: req.user._id });
    if (!circuit) return res.status(404).json({ message: 'Circuit not found' });

    const { name, numQubits, numSteps, gates } = req.body;
    if (name !== undefined) circuit.name = name;
    if (numQubits !== undefined) circuit.numQubits = numQubits;
    if (numSteps !== undefined) circuit.numSteps = numSteps;
    if (gates !== undefined) circuit.gates = gates;

    await circuit.save();
    res.json(circuit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route DELETE /api/circuits/:id
const deleteCircuit = async (req, res) => {
  try {
    const circuit = await Circuit.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!circuit) return res.status(404).json({ message: 'Circuit not found' });
    res.json({ message: 'Circuit deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/circuits/simulate  (ad-hoc simulation, not necessarily saved)
const simulate = async (req, res) => {
  try {
    const { numQubits, gates, shots } = req.body;
    if (!numQubits || !gates) {
      return res.status(400).json({ message: 'numQubits and gates are required' });
    }
    if (numQubits > 8) {
      return res.status(400).json({ message: 'Maximum 8 qubits supported in this simulator' });
    }

    const { stateVector, probabilities } = runCircuit({ numQubits, gates });
    const counts = simulateMeasurements(probabilities, shots || 1024);

    res.json({ stateVector, probabilities, counts });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @route POST /api/circuits/:id/simulate (simulate + persist last result)
const simulateSaved = async (req, res) => {
  try {
    const circuit = await Circuit.findOne({ _id: req.params.id, user: req.user._id });
    if (!circuit) return res.status(404).json({ message: 'Circuit not found' });

    const { stateVector, probabilities } = runCircuit({
      numQubits: circuit.numQubits,
      gates: circuit.gates
    });
    const counts = simulateMeasurements(probabilities, req.body.shots || 1024);

    circuit.lastResult = { stateVector, probabilities, measuredAt: new Date() };
    await circuit.save();

    res.json({ stateVector, probabilities, counts });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @route GET /api/circuits/templates/list
const listTemplates = async (req, res) => {
  const list = Object.entries(algorithmTemplates).map(([key, t]) => ({
    key,
    name: t.name,
    description: t.description,
    numQubits: t.numQubits
  }));
  res.json(list);
};

// @route GET /api/circuits/templates/:key
const getTemplate = async (req, res) => {
  const template = algorithmTemplates[req.params.key];
  if (!template) return res.status(404).json({ message: 'Template not found' });
  res.json(template);
};

module.exports = {
  getCircuits,
  getCircuitById,
  createCircuit,
  updateCircuit,
  deleteCircuit,
  simulate,
  simulateSaved,
  listTemplates,
  getTemplate
};
