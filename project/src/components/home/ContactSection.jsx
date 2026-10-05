import { useState } from 'react';

export default function ContactSection() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section className="contact" id="contact">
      <div className="contact__inner">
        <div className="contact__info">
          <h2 className="section-header__title">Get In Touch</h2>
          <p className="contact__desc">
            Have questions about AgroLink? Reach out to our team and we&apos;ll
            get back to you within 24 hours.
          </p>

          <div className="contact__details">
            <div className="contact__detail">
              <span className="contact__icon">📧</span>
              <div>
                <strong>Email</strong>
                <p>info@agrolink.co.ke</p>
              </div>
            </div>
            <div className="contact__detail">
              <span className="contact__icon">📞</span>
              <div>
                <strong>Phone</strong>
                <p>+254 700 123 456</p>
              </div>
            </div>
            <div className="contact__detail">
              <span className="contact__icon">📍</span>
              <div>
                <strong>Location</strong>
                <p>Nairobi, Kenya</p>
              </div>
            </div>
          </div>
        </div>

        <form className="contact__form" onSubmit={handleSubmit}>
          {submitted ? (
            <div className="contact__success">
              <h3>Thank you!</h3>
              <p>We&apos;ve received your message and will respond soon.</p>
            </div>
          ) : (
            <>
              <div className="contact__row">
                <label>
                  Full Name
                  <input type="text" name="name" required placeholder="Your name" />
                </label>
                <label>
                  Email
                  <input type="email" name="email" required placeholder="you@email.com" />
                </label>
              </div>
              <label>
                Subject
                <input type="text" name="subject" required placeholder="How can we help?" />
              </label>
              <label>
                Message
                <textarea name="message" rows="5" required placeholder="Your message..." />
              </label>
              <button type="submit" className="btn btn--primary btn--lg">
                Send Message
              </button>
            </>
          )}
        </form>
      </div>
    </section>
  );
}
