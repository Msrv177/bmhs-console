import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from './jsx/Login' 
import Home from "./jsx/Home";
import About from "./jsx/About";

function App() {
  const [mail, setMail] = useState(null);
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage setMail={setMail} />} />
        <Route path="/About" element={<About />} />
        <Route path="/Login" element={<LoginPage setMail={setMail} />} />
        <Route path="/Home" element={<Home mail={mail} />} />

      </Routes>
    </Router>
  );
}

export default App;
