import React, { useEffect, useRef } from "react";
import "./ReviewCarousel.css";

const reviews = [
  { name: "Arjun M.", location: "Mumbai", review: "Premium quality!", rating: 5, initials: "AM" },
  { name: "Sneha V.", location: "Chennai", review: "Amazing experience!", rating: 5, initials: "SV" },
  { name: "Rahul K.", location: "Delhi", review: "Luxury feel.", rating: 5, initials: "RK" },
  { name: "Priya S.", location: "Hyderabad", review: "Worth it!", rating: 5, initials: "PS" }
];

// duplicate for loop
const loopData = [...reviews, ...reviews];

export default function ReviewCarousel() {
  const trackRef = useRef(null);

 useEffect(() => {

  if (window.innerWidth > 768) return;

  const track = trackRef.current;

  if (!track) return;

  let position = 0;

  const speed = 0.35;

  let animationFrame;

  let isPaused = false;

  const animate = () => {

    if (!isPaused) {

      position -= speed;

      const loopWidth = track.scrollWidth / 2;

      if (Math.abs(position) >= loopWidth) {
        position = 0;
      }

      track.style.transform =
        `translate3d(${position}px, 0, 0)`;
    }

    animationFrame = requestAnimationFrame(animate);
  };

  const pause = () => {
    isPaused = true;
  };

  const resume = () => {
    isPaused = false;
  };

  track.addEventListener("touchstart", pause, { passive: true });

  track.addEventListener("touchend", resume, { passive: true });

  animationFrame = requestAnimationFrame(animate);

  return () => {

    cancelAnimationFrame(animationFrame);

    track.removeEventListener("touchstart", pause);

    track.removeEventListener("touchend", resume);
  };

}, []);
  return (
    <div className="reviews-wrapper">
      <div className="reviews-track" ref={trackRef}>
        {loopData.map((r, i) => (
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