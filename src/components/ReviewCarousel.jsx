import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

const reviews = [
  {
    name: "Arjun M.",
    location: "Mumbai",
    review: "Absolutely premium quality. The oversized tee fits perfectly and the fabric is super heavyweight. Will order again!",
    rating: 5,
    initials: "AM"
  },
  // Add more review objects here
];

const ReviewCard = ({ review }) => (
  <div className="review-card" style={{background:'#fff',borderRadius:16,padding:24,boxShadow:'0 2px 8px rgba(0,0,0,0.08)',maxWidth:350}}>
    <div style={{ color: '#FFA500', fontSize: '1.2em', marginBottom: 8 }}>
      {'★'.repeat(review.rating)}
    </div>
    <p style={{fontSize:16,marginBottom:16}}>“{review.review}”</p>
    <div style={{ display: 'flex', alignItems: 'center', marginTop: 10 }}>
      <div style={{
        background: '#6C63FF',
        color: '#fff',
        borderRadius: '50%',
        width: 40,
        height: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        marginRight: 10
      }}>{review.initials}</div>
      <div>
        <div style={{ fontWeight: 'bold' }}>{review.name}</div>
        <div style={{ color: '#888' }}>{review.location}</div>
      </div>
    </div>
  </div>
);

export default function ReviewCarousel() {
  return (
    <Swiper
      spaceBetween={30}
      slidesPerView={1}
      autoplay={{ delay: 3000 }}
      loop={true}
    >
      {reviews.map((r, i) => (
        <SwiperSlide key={i}>
          <ReviewCard review={r} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
