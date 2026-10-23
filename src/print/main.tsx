import React from "react"
import ReactDOM from "react-dom/client"
import { PrintTool } from "./PrintTool"
import "../fonts"
import "../index.css"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PrintTool />
  </React.StrictMode>,
)
