import { Provider } from "react-redux";
import { createAppStore } from "./state/store";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./style.css";

const initialError = new URLSearchParams(window.location.search).has("error")
  ? "Sign-in failed. Please use an account with a verified email and try again."
  : "";
const store = createAppStore(undefined, initialError);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
);
