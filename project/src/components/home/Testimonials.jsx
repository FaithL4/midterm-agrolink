const testimonials = [
  {
    name: 'James Kamau',
    role: 'Maize Farmer, Nakuru',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
    quote: 'AgroLink helped me find buyers directly without middlemen. My maize sales increased by 40% in one season.',
    rating: 5,
  },
  {
    name: 'Sarah Wanjiru',
    role: 'Vegetable Buyer, Nairobi',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
    quote: 'I can browse fresh produce, compare prices, and chat with farmers before ordering. It saves me time and money.',
    rating: 5,
  },
  {
    name: 'Peter Ochieng',
    role: 'Tomato Farmer, Kirinyaga',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
    quote: 'The AI price predictions tell me the best time to sell. I no longer lose money selling too early or too late.',
    rating: 5,
  },
];

function StarRating({ count }) {
  return (
    <div className="testimonial-card__stars" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#F59E0B" aria-hidden="true">
          <path d="M12 2L14.5 8.5L21.5 9.3L16.5 14L18 21L12 17.5L6 21L7.5 14L2.5 9.3L9.5 8.5L12 2Z" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="testimonials" id="testimonials">
      <div className="testimonials__inner">
        <div className="section-header">
          <h2 className="section-header__title">What Our Users Say</h2>
          <p className="section-header__subtitle">
            Trusted by thousands of farmers and buyers across Kenya
          </p>
        </div>

        <div className="testimonials__grid">
          {testimonials.map((item) => (
            <article key={item.name} className="testimonial-card">
              <StarRating count={item.rating} />
              <blockquote className="testimonial-card__quote">
                &ldquo;{item.quote}&rdquo;
              </blockquote>
              <div className="testimonial-card__author">
                <img src={item.avatar} alt={item.name} className="testimonial-card__avatar" />
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.role}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
