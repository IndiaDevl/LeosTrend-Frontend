
import React, { useEffect, useRef } from "react";
import "./ReviewCarousel.css";

const reviews = [
  { name: "Arjun M.", location: "Mumbai", review: "Premium quality!", rating: 5, initials: "AM" },
  { name: "Sneha V.", location: "Chennai", review: "Amazing experience!", rating: 5, initials: "SV" },
  { name: "Rahul K.", location: "Delhi", review: "Luxury feel.", rating: 5, initials: "RK" },
  { name: "Priya S.", location: "Hyderabad", review: "Worth it!", rating: 5, initials: "PS" }
];


// Dynamically duplicate reviews so the track is at least 3x viewport width
function getLoopData(cardWidth = 280, minTrackWidth = 3) {
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const cardsPerView = Math.ceil(vw / cardWidth);
  const minCards = Math.max(reviews.length * minTrackWidth, cardsPerView * minTrackWidth);
  const repeat = Math.ceil(minCards / reviews.length);
  let arr = [];
  for (let i = 0; i < repeat; ++i) arr = arr.concat(reviews);
  return arr;
}

export default function ReviewCarousel() {
  // For mobile, use a CSS marquee effect for seamless loop
  const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 768 : false;
  // Duplicate reviews at least 3x for smoothness
  const marqueeRepeats = 3;
  const marqueeData = isMobile
    ? Array(marqueeRepeats).fill(null).flatMap(() => reviews)
    : reviews;

  return (
    <div className="reviews-wrapper">
      <div className={isMobile ? "reviews-track marquee" : "reviews-track"}>
        {marqueeData.map((r, i) => (
          <div className="review-card" key={i}>
            <div className="stars">{'★'.repeat(r.rating)}</div>
            <p className="review-text">“{r.review}”</p>
            <div className="user">
              <div className="avatar">{r.initials}</div>
              <div>
                <div className="name">{r.name}</div>
                <div className="location">{r.location}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}