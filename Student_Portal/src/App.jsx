import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HeroPage from "./HeroPage";
import "./style.css";
import EventDashboard from "./assets/pages/EventDashboard";
import EventDetails from "./assets/pages/EventDetails";
import ContextProvider from "./assets/Context/ContextProvider";
import ScrollTop from "./assets/pages/ScrollTop";
function App() {
  return (
    <>
      <BrowserRouter>
        <ContextProvider>
          <ScrollTop />
          <Routes>
            <Route path="/" element={<HeroPage />} />
            <Route path="/dashboard" element={<EventDashboard />} />
            <Route path="/event/:eventId" element={<EventDetails />} />
          </Routes>
        </ContextProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
