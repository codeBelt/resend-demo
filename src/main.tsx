import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { BrowserRouter } from "react-router-dom";
import { HerouiProvider } from "./lib/heroui/HerouiProvider";
import "./index.css";
import App from "./App.tsx";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConvexAuthProvider client={convex}>
      <BrowserRouter>
        <HerouiProvider>
          <App />
        </HerouiProvider>
      </BrowserRouter>
    </ConvexAuthProvider>
  </StrictMode>,
);
