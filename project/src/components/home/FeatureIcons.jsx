const features = [
  {
    label: 'Direct Marketplace',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M4 12L16 4L28 12V26C28 27.1 27.1 28 26 28H6C4.9 28 4 27.1 4 26V12Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M12 28V16H20V28" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'AI Price Prediction',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M4 24L12 16L18 22L28 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 8H28V14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'Smart Farming Advice',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M16 28C16 28 8 22 8 14C8 10.7 10.7 8 14 8C15.5 8 16.8 8.7 17.5 10C18.2 8.7 19.5 8 21 8C24.3 8 27 10.7 27 14C27 22 16 28 16 28Z" fill="currentColor" opacity="0.2" />
        <path d="M16 6V14M12 10L16 6L20 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 28V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Delivery Solutions',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect x="3" y="12" width="16" height="12" rx="1" stroke="currentColor" strokeWidth="2" />
        <path d="M19 16H25L29 22V24H19V16Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="9" cy="26" r="2.5" stroke="currentColor" strokeWidth="2" />
        <circle cx="25" cy="26" r="2.5" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
];

export default function FeatureIcons() {
  return (
    <section className="feature-icons" id="features">
      <div className="feature-icons__inner">
        {features.map((feature) => (
          <div key={feature.label} className="feature-icons__item">
            <div className="feature-icons__icon">{feature.icon}</div>
            <span className="feature-icons__label">{feature.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
