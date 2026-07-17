import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Entry from "./App";

const container = document.getElementById("app");
if (container) {
  createRoot(container).render(
    <StrictMode>
      <Entry />
    </StrictMode>,
  );
}
