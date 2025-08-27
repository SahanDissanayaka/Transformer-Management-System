import { Outlet, Route, Routes } from "react-router-dom";
import NavBar from "./components/NavBar";
import TransformerDetailPage from "./pages/TransformerDetail";
import InspectionDetailPage from "./pages/InspectionDetailPage";

export default function App() {
  return (
    <div className="container">
      <NavBar />
      <Outlet />
      <Routes>
        <Route path="/transformer/:transformerNo" element={<TransformerDetailPage />} />
        <Route path="/inspection/:id" element={<InspectionDetailPage />} />
      </Routes>
    </div>
  );
}
