const steps = [
  {
    number: '01',
    title: 'Create Your Account',
    description: 'Sign up as a farmer, buyer, or transporter. Choose your role and complete your profile in minutes.',
  },
  {
    number: '02',
    title: 'List or Browse Products',
    description: 'Farmers post crops and livestock. Buyers search, filter, and preview products across Kenya.',
  },
  {
    number: '03',
    title: 'Connect & Transact',
    description: 'Chat directly, get AI price insights, and coordinate secure payments and delivery.',
  },
  {
    number: '04',
    title: 'Grow Your Business',
    description: 'Track orders, receive farming advice, and build trusted partnerships on AgroLink.',
  },
];

export default function HowItWorks() {
  return (
    <section className="how-it-works" id="how-it-works">
      <div className="how-it-works__inner">
        <div className="section-header">
          <h2 className="section-header__title">How It Works</h2>
          <p className="section-header__subtitle">
            From farm to market in four simple steps
          </p>
        </div>

        <div className="how-it-works__grid">
          {steps.map((step) => (
            <div key={step.number} className="how-it-works__step">
              <span className="how-it-works__number">{step.number}</span>
              <h3 className="how-it-works__title">{step.title}</h3>
              <p className="how-it-works__desc">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
