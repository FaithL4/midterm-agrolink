import { Link } from 'react-router-dom';
import { categories } from '../../data/products';

export default function HeroGallery() {
  return (
    <section className="hero-gallery" id="home">
      <div className="hero-gallery__inner">
        <div className="hero-gallery__main">
          <img
            src="https://images.unsplash.com/photo-1574323347407-fec386e38819?w=900&q=80"
            alt="Farmer using smartphone in a green maize field"
            className="hero-gallery__hero-img"
          />
        </div>

        <div className="hero-gallery__grid">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to="/marketplace"
              className="hero-gallery__cat"
            >
              <img src={cat.image} alt={cat.name} />
              <span>{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="hero-gallery__intro">
        <h1 className="hero-gallery__title">
          Empowering <span className="text-green">Farmers</span>.
          Connecting <span className="text-green">Markets</span>.
          Growing <span className="text-green">Prosperity</span>.
        </h1>
        <p className="hero-gallery__subtitle">
          AgroLink is your all-in-one platform to buy, sell, predict prices,
          get weather-based advice, and connect with trusted partners in agriculture.
        </p>
        <div className="hero-gallery__actions">
          <Link to="/marketplace" className="btn btn--primary btn--lg">
            Explore Marketplace
          </Link>
          <a href="#how-it-works" className="btn btn--outline btn--lg">
            Learn How It Works
          </a>
        </div>
      </div>
    </section>
  );
}
