import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx";
import CropperPage from "./pages/CropperPage.jsx";
import ConfigPage from "./pages/ConfigPage.jsx";

const App = () => {
  return (
    <Router>
      <Header />
        <Routes>
          <Route path="/" element={<CropperPage />} />
          <Route path="/config" element={<ConfigPage />} />
        </Routes>
    </Router>
  );
};

export default App;
