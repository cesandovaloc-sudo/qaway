import React, { useEffect } from "react";
import "./dental-landing.css";
import { DentalLandingPage } from "./src/pages/DentalLandingPage";

export default function DentalPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="dental-landing">
      <DentalLandingPage />
    </div>
  );
}
