import { Outlet } from "react-router-dom";
import NavBar from "./components/NavBar";
import AnimatedBackground from "./components/AnimatedBackground";
import LightBackground from "./components/LightBackground";
import { useTheme } from "./context/ThemeContext";

export default function App() {
  const { theme } = useTheme();

  return (
    <>
      {theme === 'dark' ? <AnimatedBackground /> : <LightBackground />}
      <div className="container">
        <NavBar />
        <Outlet />
      </div>
    </>
  );
}
