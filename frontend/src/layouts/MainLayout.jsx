import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        
        <Navbar />

        <div style={{ padding: "20px", flex: 1 }}>
          <Outlet /> 
        </div>

      </div>
    </div>
  );
};

export default MainLayout;