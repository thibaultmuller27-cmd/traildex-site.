import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import { Legal, legalPageFromPath } from "./pages/Legal"
import "./fonts"
import "./index.css"

// The host serves index.html for every path; /cgv, /mentions-legales and
// /confidentialite show the legal pages, everything else the site.
const legal = legalPageFromPath(location.pathname)

ReactDOM.createRoot(document.getElementById("root")!).render(<React.StrictMode>{legal ? <Legal page={legal} /> : <App />}</React.StrictMode>)
