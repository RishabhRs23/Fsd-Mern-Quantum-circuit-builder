# Fsd-Mern-Quantum-circuit-builder

A full MERN (MongoDB, Express, React, Node.js) application for visually
building quantum circuits with drag-and-drop, saving/loading them per user
account, and simulating them with a **pure JavaScript** quantum state-vector
engine (no external quantum SDKs, no Python — everything runs in Node/React).

## Features
- User registration/login with JWT auth (bcrypt-hashed passwords)
- Drag-and-drop circuit builder (H, X, Y, Z, S, T, RX, RY, RZ, CNOT, CZ, SWAP)
- Save / load / delete circuits per logged-in user (MongoDB)
- Quantum simulation engine written from scratch in `backend/utils/quantumEngine.js`
  (complex-number math, tensor-style single/multi-qubit gate application,
  probability calculation, and randomized shot-based measurement sampling)
- Ready-made **fundamental algorithm templates** users can load and extend:
  Bell state, GHZ state, Superdense Coding, Deutsch-Jozsa, Grover's Search
  (2-qubit), Quantum Teleportation (simplified), 2-qubit QFT
- Results panel showing measurement probabilities, sampled shot counts, and
  raw state-vector amplitudes

## Folder Structure
```
quantum-circuit-builder/
  backend/     -> Node.js + Express + Mongoose API
  frontend/    -> React app (Create React App)
```

## Setup

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env     # then edit MONGO_URI / JWT_SECRET as needed
npm run dev               # or: npm start
```
Runs on http://localhost:5000 by default. Requires a running MongoDB instance
(local `mongod`, or a MongoDB Atlas connection string in `.env`).

### 2. Frontend
```bash
cd frontend
npm install
cp .env.example .env     # REACT_APP_API_URL should point at the backend
npm start
```
Runs on http://localhost:3000 by default and talks to the backend API.

## How to use
1. Register an account, then log in.
2. Click "New Circuit" from the dashboard.
3. Drag gates from the palette onto the qubit wires, or pick a fundamental
   algorithm template from the sidebar to load a preset circuit.
4. For CNOT/CZ/SWAP, use the small dropdown inside the placed gate box to
   choose its control/paired qubit. For RX/RY/RZ, set the rotation angle
   (in units of π) using the inline input.
5. Click "Simulate" to compute the resulting state vector, measurement
   probabilities, and sampled 1024-shot counts.
6. Click "Save Circuit" to persist it to your account in MongoDB.

## Notes on the simulator
- Supports up to 8 qubits (2^8 = 256 amplitudes) to keep computation fast
  in plain JavaScript without native numeric libraries.
- Gate matrices and multi-qubit application logic are implemented manually
  (see `backend/utils/quantumEngine.js`) — no Qiskit, Cirq, or other
  external quantum libraries are used, per the MERN-only requirement.
