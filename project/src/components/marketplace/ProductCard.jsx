import { Link } from 'react-router-dom';
import { products, nearbyBuyers } from '../../data/products';

export default function ProductCard({ product, preview = true, onView }) {
  return (
    <article className="product-card">
      <div className="product-card__image-wrap">
        <img src={product.image} alt={product.name} className="product-card__image" />
        <span className="product-card__category">{product.category}</span>
      </div>
      <div className="product-card__body">
        <h3 className="product-card__name">{product.name}</h3>
        <p className="product-card__price">
          {product.price}
          {product.unit && <span className="product-card__unit">{product.unit}</span>}
        </p>
        <p className="product-card__meta">{product.location} &middot; {product.farmer}</p>
        {preview ? (
          <button type="button" className="product-card__btn" onClick={() => onView?.(product)}>
            View Details
          </button>
        ) : (
          <Link to="/register" className="product-card__btn">
            Sign Up to Order
          </Link>
        )}
      </div>
    </article>
  );
}

export function BuyersNearby() {
  return (
    <aside className="buyers-nearby">
      <h3 className="buyers-nearby__title">New Buyers Nearby</h3>
      <div className="buyers-nearby__count">
        <strong>{nearbyBuyers.count}</strong>
        <span>{nearbyBuyers.label}</span>
      </div>
      <div className="buyers-nearby__avatars">
        {nearbyBuyers.avatars.map((avatar, i) => (
          <img key={i} src={avatar} alt="" className="buyers-nearby__avatar" />
        ))}
        <span className="buyers-nearby__extra">+{nearbyBuyers.extra}</span>
      </div>
    </aside>
  );
}

export function MarketplacePreviewSection({ onViewProduct }) {
  const previewProducts = products.slice(0, 4);

  return (
    <section className="marketplace-preview" id="marketplace">
      <div className="marketplace-preview__inner">
        <div className="section-header section-header--row">
          <div>
            <h2 className="section-header__title">Marketplace Preview</h2>
            <p className="section-header__subtitle">
              Browse fresh produce and livestock — no account needed to explore
            </p>
          </div>
          <Link to="/marketplace" className="btn btn--outline">
            View All Products
          </Link>
        </div>

        <div className="marketplace-preview__grid">
          <div className="marketplace-preview__products">
            {previewProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onView={onViewProduct}
              />
            ))}
          </div>
          <BuyersNearby />
        </div>
      </div>
    </section>
  );
}
