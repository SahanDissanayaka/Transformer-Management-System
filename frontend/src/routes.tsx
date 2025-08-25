import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import TransformersPage from "./pages/Transformers";
import UploadImagesPage from "./pages/UploadImages";
import BaselineGalleryPage from "./pages/BaseLineGallery";
import TransformerDetailPage from "./pages/TransformerDetail"; // ✅ Add this import
import App from "./App";
import InspectionDetailPage from "./pages/InspectionDetailPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "transformers", element: <TransformersPage /> },
      { path: "upload", element: <UploadImagesPage /> },
      { path: "baseline", element: <BaselineGalleryPage /> },
      { path: "transformers/:transformerNo", element: <TransformerDetailPage /> },
      { path: "transformers/:transformerNo/inspections/:inspectionNo", element: <InspectionDetailPage /> },
    ],
  },
]);
