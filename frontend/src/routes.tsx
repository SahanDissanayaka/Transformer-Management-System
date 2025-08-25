import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import TransformersPage from "./pages/Transformers";
import TransformerDetailPage from "./pages/TransformerDetail"; 
import App from "./App";
import InspectionDetailPage from "./pages/InspectionDetailPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "transformers", element: <TransformersPage /> },
      { path: "transformers/:transformerNo", element: <TransformerDetailPage /> },
      { path: "transformers/:transformerNo/inspections/:inspectionNo", element: <InspectionDetailPage /> },
    ],
  },
]);
