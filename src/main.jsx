import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App.jsx";
import CategoryPage from "./CategoryPage.jsx";
import WebcamPage from "./WebcamPage.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Main homepage */}
        <Route path="/" element={<App />} />

        {/* Existing category pages */}
        <Route
          path="/serios"
          element={
            <CategoryPage
              variant="serious"
              title="Serious Dating Sites"
              subtitle="Carefully selected platforms focused on long-term, meaningful relationships."
            />
          }
        />
        <Route
          path="/international"
          element={
            <CategoryPage
              variant="international"
              title="International Dating Sites"
              subtitle="Top-rated platforms to meet singles from different countries and cultures."
            />
          }
        />
        <Route
          path="/casual"
          element={
            <CategoryPage
              variant="casual"
              title="Casual Dating & Social Apps"
              subtitle="Relaxed, low-pressure dating apps ideal for casual connections and flirting."
            />
          }
        />
        <Route
          path="/general"
          element={
            <CategoryPage
              variant="general"
              title="All Dating Offers"
              subtitle="A complete overview of all dating offers listed on MatchFinderGuide."
            />
          }
        />

        {/* Hidden webcam routes */}
        <Route path="/webcam" element={<WebcamPage />} />
        <Route path="/webcam-offers" element={<WebcamPage />} />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);