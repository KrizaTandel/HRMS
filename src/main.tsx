import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import "./index.css";

import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";

import { AuthProvider } from "@/contexts/auth-context";
import { DataProvider } from "@/contexts/data-context";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element '#root' not found.");
}

createRoot(rootElement).render(
  <StrictMode>
    <TooltipProvider>
      <AuthProvider>
        <DataProvider>
          <App />
          <Toaster
            position="top-right"
            richColors
            closeButton
          />
        </DataProvider>
      </AuthProvider>
    </TooltipProvider>
  </StrictMode>
);