import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "@outspeed/react/styles.css";

import { router } from "./router.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);
