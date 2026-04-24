import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        
        <Navbar />

        <div style={{ padding: "20px", flex: 1, overflowY: "auto", backgroundColor: "#f3f4f6" }}>
          <Outlet /> 
        </div>

      </div>
    </div>
  );
};

export default MainLayout;