import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MangaCreator from "./components/MangaCreator";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MangaCreator />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;