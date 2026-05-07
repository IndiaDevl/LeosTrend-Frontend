import React from "react";
import { FaStar } from "react-icons/fa";

const reviews = [
  {
    name: "Arjun M.",
    location: "Mumbai",
    rating: 5,
    text: "Absolutely premium quality. The oversized tee fits perfectly and the fabric is super heavyweight. Will order again!",
    initials: "AM",
    color: "#6366f1",
  },
  {
    name: "Priya K.",
    location: "Bengaluru",
    rating: 5,
    text: "Loved the packaging and the hoodie. Feels like a luxury brand at a fair price. Fast delivery too!",
    initials: "PK",
    color: "#ec4899",
  },
  {
    name: "Rahul S.",
    location: "Delhi",
    rating: 5,
    text: "The zip sweatshirt is insane quality. Stitching is perfect and the spiritual design is unique. Highly recommend.",
    initials: "RS",
    color: "#14b8a6",
  },
  {
    name: "Sneha V.",
    location: "Chennai",
    rating: 5,
    text: "Got two pieces as gifts. Both recipients were amazed by the quality. LeosTrend is now our go-to brand.",
    initials: "SV",
    color: "#f59e0b",
  },
];

function CustomerReviews() {
  return (
    <section className="reviews-section reviews-marquee-section">
      <div className="home-section-head text-center observe-reveal" style={{ marginBottom: "32px" }}>
        <p className="home-section-kicker">Customer Love</p>
        <h2 className="home-section-title">What People Say</h2>
        <p className="home-section-subtitle">Real orders. Real people. Real experiences.</p>
      </div>

      <div className="reviews-marquee-row">
        <div className="reviews-marquee-inner">
          {reviews.map((r, i) => (
            <article
              key={r.name + '-' + i}
              className="review-card observe-reveal"
              style={{ "--reveal-delay": `${i * 100}ms` }}
            >
              <div className="review-stars" aria-label={`${r.rating} out of 5 stars`}>
                {Array.from({ length: r.rating }).map((_, si) => (
                  <FaStar key={si} />
                ))}
              </div>
              <p className="review-text">&ldquo;{r.text}&rdquo;</p>
              <div className="review-author">
                <span
                  className="review-avatar"
                  style={{ background: r.color }}
                  aria-hidden="true"
                >
                  {r.initials}
                </span>
                <div>
                  <p className="review-name">{r.name}</p>
                  <p className="review-location">{r.location}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CustomerReviews;
