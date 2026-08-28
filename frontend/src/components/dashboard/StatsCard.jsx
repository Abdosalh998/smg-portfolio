import './StatsCard.css';

const StatsCard = ({ title, value, icon: Icon, color = 'accent', trend, description }) => {
  const colorMap = {
    accent:  { bg: 'rgba(232, 93, 4, 0.12)',  border: 'rgba(232, 93, 4, 0.25)',  icon: '#E85D04' },
    success: { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.25)', icon: '#10B981' },
    danger:  { bg: 'rgba(239, 68, 68, 0.12)',  border: 'rgba(239, 68, 68, 0.25)',  icon: '#EF4444' },
    info:    { bg: 'rgba(59, 130, 246, 0.12)',  border: 'rgba(59, 130, 246, 0.25)', icon: '#3B82F6' },
    warning: { bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.25)', icon: '#F59E0B' },
    purple:  { bg: 'rgba(139, 92, 246, 0.12)', border: 'rgba(139, 92, 246, 0.25)', icon: '#8B5CF6' },
  };

  const colors = colorMap[color] || colorMap.accent;

  return (
    <div className="stats-card" style={{ '--card-bg': colors.bg, '--card-border': colors.border }}>
      <div className="stats-card-icon" style={{ background: colors.bg, border: `1px solid ${colors.border}` }}>
        {Icon && <Icon size={22} style={{ color: colors.icon }} />}
      </div>
      <div className="stats-card-body">
        <span className="stats-card-value">{value ?? <span className="skeleton" style={{ width: 60, height: 28, display: 'inline-block' }} />}</span>
        <span className="stats-card-title">{title}</span>
        {description && <span className="stats-card-desc">{description}</span>}
      </div>
    </div>
  );
};

export default StatsCard;
