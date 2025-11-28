import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Home from "./pages/Home";
import TransformersPage from "./pages/Transformers";
import TransformerDetailPage from "./pages/TransformerDetail";
import InspectionDetailPage from "./pages/InspectionDetailPage";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Home /> },
      { path: "transformers", element: <TransformersPage /> },
      {
        path: "transformers/:transformerNo",
        element: <TransformerDetailPage />,
      },
      {
        path: "transformers/:transformerNo/inspections/:inspectionNo",
        element: <InspectionDetailPage />,
      },
    ],
  },
]);
