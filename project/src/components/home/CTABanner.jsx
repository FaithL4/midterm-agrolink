import { Link } from 'react-router-dom';

export default function CTABanner() {
  return (
    <section className="cta-banner">
      <div className="cta-banner__inner">
        <div className="cta-banner__image">
          <img
            src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&q=80"
            alt="Farmer holding fresh vegetables"
          />
        </div>
        <div className="cta-banner__content">
          <h2 className="cta-banner__title">Grow More. Earn More.</h2>
          <p className="cta-banner__text">
            AgroLink gives you the tools, connections, and insights to take your
            farming business to the next level.
          </p>
        </div>
        <Link to="/register" className="cta-banner__btn">
          Join AgroLink Today &rarr;
        </Link>
      </div>
    </section>
  );
}
