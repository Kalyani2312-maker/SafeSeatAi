import {
  LayoutDashboard,
  Users,
  Bus,
  Route,
  Bell,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("safeSeatUser");
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon small">
          <ShieldCheck size={25} />
        </div>

        <div>
          <strong>SafeSeatAI</strong>
          <span>Safety Network</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard">
          <LayoutDashboard size={19} />
          Dashboard
        </NavLink>

        <NavLink to="/dashboard">
          <Users size={19} />
          Students
        </NavLink>

        <NavLink to="/dashboard">
          <Bus size={19} />
          Buses
        </NavLink>

        <NavLink to="/dashboard">
          <Route size={19} />
          Journeys
        </NavLink>

        <NavLink to="/dashboard">
          <Bell size={19} />
          Safety Alerts
        </NavLink>
      </nav>

      <button className="logout-btn" onClick={logout}>
        <LogOut size={19} />
        Logout
      </button>
    </aside>
  );
}

export default Sidebar;