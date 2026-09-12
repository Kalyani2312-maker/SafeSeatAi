function StatCard({ title, value, icon, description }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <div>
          <p>{title}</p>
          <h3>{value}</h3>
        </div>

        <div className="stat-icon">
          {icon}
        </div>
      </div>

      <span className="stat-description">
        {description}
      </span>
    </div>
  );
}

export default StatCard;