import React, { useEffect } from "react";
import "./saniclick-landing.css";
import App from "./src/App";

export default function SaniclickPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="saniclick-landing">
      <App />
    </div>
  );
}
