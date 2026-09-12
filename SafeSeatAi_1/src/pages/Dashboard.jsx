import {
  Users,
  Bus,
  Route,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";

function Dashboard() {
  const user = JSON.parse(
    localStorage.getItem("safeSeatUser")
  );

  return (
    <div className="dashboard-layout">

      <Sidebar />

      <main className="dashboard-main">

        {/* HEADER */}
        <header className="dashboard-header">
          <div>
            <h1>Safety Dashboard</h1>

            <p>
              Monitor school transportation and child
              safety in real time.
            </p>
          </div>

          <div className="user-info">
            <div className="avatar">
              {user?.name?.charAt(0) ||
                user?.email?.charAt(0) ||
                "A"}
            </div>

            <div>
              <strong>
                {user?.name || "Administrator"}
              </strong>

              <span>
                {user?.role || "Administrator"}
              </span>
            </div>
          </div>
        </header>


        {/* STAT CARDS */}
        <section className="stat-grid">

          <StatCard
            title="Total Students"
            value="1"
            icon={<Users size={25} />}
            description="Registered students"
          />

          <StatCard
            title="Active Buses"
            value="1"
            icon={<Bus size={25} />}
            description="Currently monitored"
          />

          <StatCard
            title="Active Journeys"
            value="1"
            icon={<Route size={25} />}
            description="Journey in progress"
          />

          <StatCard
            title="Safety Alerts"
            value="0"
            icon={<AlertTriangle size={25} />}
            description="No active alerts"
          />

        </section>


        {/* MONITORING */}
        <section className="dashboard-grid">

          {/* LIVE BUS */}
          <div className="panel">

            <div className="panel-header">

              <div>
                <h2>Live Bus Monitoring</h2>

                <p>
                  Current transportation status
                </p>
              </div>

              <span className="status-live">
                ● LIVE
              </span>

            </div>


            <div className="bus-monitor">

              <div className="bus-icon">
                <Bus size={35} />
              </div>


              <div className="bus-details">

                <h3>School Bus 01</h3>

                <p>
                  <MapPin size={15} />
                  Route: Main Campus → School
                </p>

                <p>
                  <Users size={15} />
                  Students onboard: 24
                </p>

              </div>


              <div className="bus-status">

                <CheckCircle size={20} />

                <span>Safe</span>

              </div>

            </div>

          </div>


          {/* SAFETY STATUS */}
          <div className="panel">

            <div className="panel-header">

              <div>
                <h2>Safety Status</h2>

                <p>
                  System health
                </p>
              </div>

              <CheckCircle size={25} />

            </div>


            <div className="safety-status">

              <div>
                <span>GPS Tracking</span>
                <strong>Online</strong>
              </div>

              <div>
                <span>Child Detection</span>
                <strong>Active</strong>
              </div>

              <div>
                <span>Alert System</span>
                <strong>Ready</strong>
              </div>

              <div>
                <span>Network</span>
                <strong>Connected</strong>
              </div>

            </div>

          </div>

        </section>


        {/* RECENT ALERTS */}
        <section className="panel recent-alerts">

          <div className="panel-header">

            <div>
              <h2>Recent Safety Alerts</h2>

              <p>
                Latest safety events
              </p>
            </div>

            <Clock size={22} />

          </div>


          <div className="empty-alert">

            <CheckCircle size={45} />

            <h3>
              No Active Safety Alerts
            </h3>

            <p>
              All monitored journeys are currently safe.
            </p>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Dashboard;