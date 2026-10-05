import { Link } from 'react-router-dom';

export default function ProductModal({ product, onClose }) {
  if (!product) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="product-modal-title"
      >
        <button type="button" className="modal__close" onClick={onClose} aria-label="Close">
          &times;
        </button>
        <div className="modal__grid">
          <img src={product.image} alt={product.name} className="modal__image" />
          <div className="modal__body">
            <span className="modal__category">{product.category}</span>
            <h2 id="product-modal-title" className="modal__title">{product.name}</h2>
            <p className="modal__price">
              {product.price}
              {product.unit && <span>{product.unit}</span>}
            </p>
            <p className="modal__desc">{product.description}</p>
            <ul className="modal__details">
              <li><strong>Farmer:</strong> {product.farmer}</li>
              <li><strong>Location:</strong> {product.location}</li>
              <li><strong>Available:</strong> {product.quantity}</li>
            </ul>
            <div className="modal__actions">
              <Link to="/register" className="btn btn--primary">
                Sign Up to Order
              </Link>
              <button type="button" className="btn btn--outline" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
