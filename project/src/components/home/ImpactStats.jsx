const stats = [
  {
    value: '10,000+',
    label: 'Farmers Connected',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="9" cy="8" r="3" fill="currentColor" />
        <circle cx="16" cy="10" r="2.5" fill="currentColor" opacity="0.7" />
        <path d="M4 20C4 16.7 6.2 14 9 14C11.8 14 14 16.7 14 20" fill="currentColor" />
      </svg>
    ),
  },
  {
    value: '5,000+',
    label: 'Verified Buyers',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 6H20L18 14H8L6 6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="10" cy="18" r="1.5" fill="currentColor" />
        <circle cx="17" cy="18" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    value: 'KES 50M+',
    label: 'Trade Facilitated',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <ellipse cx="12" cy="14" rx="8" ry="3" stroke="currentColor" strokeWidth="2" />
        <ellipse cx="12" cy="10" rx="8" ry="3" stroke="currentColor" strokeWidth="2" />
        <ellipse cx="12" cy="6" rx="8" ry="3" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  {
    value: '95%',
    label: 'User Satisfaction',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 2L14.5 8.5L21.5 9.3L16.5 14L18 21L12 17.5L6 21L7.5 14L2.5 9.3L9.5 8.5L12 2Z" fill="currentColor" />
      </svg>
    ),
  },
];

export default function ImpactStats() {
  return (
    <section className="impact-stats" aria-label="Platform impact">
      <div className="impact-stats__inner">
        {stats.map((stat) => (
          <div key={stat.label} className="impact-stats__item">
            <span className="impact-stats__icon">{stat.icon}</span>
            <strong className="impact-stats__value">{stat.value}</strong>
            <span className="impact-stats__label">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
