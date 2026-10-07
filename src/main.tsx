import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { MenuProvider } from "./context/MenuContext";
import {AuthProvider} from "./context/AuthContext";
import {migrateStoredRecordIds} from "./utils/recordIds";

import "./index.css";

migrateStoredRecordIds();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
    <AuthProvider>
      <MenuProvider>
        <App />
      </MenuProvider>
    </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);