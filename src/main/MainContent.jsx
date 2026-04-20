
import { useNavigate } from "react-router-dom";
import { NavbarScreen } from "../navbar/NavbarContent";
import LeftTab from "./SidebarTabContent";
import { useEffect } from "react";





function MainScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("userid");

    if (!userId) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div>
      <NavbarScreen />
      <LeftTab />
    </div>
  );
}



export default MainScreen;