import './App.css';
import Login from "./views/login"
import Register from "./views/register"
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
function App() {
  return (
    <>
      <Router>
        <Routes>

          <Route path="/" element={<Login />} />

          <Route path="/register" element={<Register />} />

        </Routes>
      </Router>
    </>
  );
}

export default App;
