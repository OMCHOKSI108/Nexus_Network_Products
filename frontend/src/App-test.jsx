import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Simple test component
function TestHome() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1 style={{ color: 'blue' }}>NexusNetwork - Working!</h1>
      <p>The React app is loading correctly!</p>
      <div style={{ marginTop: '20px' }}>
        <button style={{ padding: '10px 20px', backgroundColor: 'blue', color: 'white', border: 'none', borderRadius: '5px' }}>
          Test Button
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TestHome />} />
        <Route path="*" element={<TestHome />} />
      </Routes>
    </Router>
  );
}

export default App;