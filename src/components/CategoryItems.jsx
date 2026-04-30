import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./CategoryItems.css";

const categoryItems = [
  { key: "oversized", title: "Oversized", image: "/TShirt-Yellow.webp" },
  { key: "sweatshirts", title: "Sweatshirts", image: "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=90&w=1600" },
  { key: "zip", title: "Zip", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=90&w=1600" },
  { key: "hoodies", title: "Hoodies", image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=90&w=1600" },
];

function CategoryItems() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const cards = sectionRef.current.querySelectorAll(".category-card");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal");
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="category" ref={sectionRef}>
      <div className="category-track">
        {categoryItems.map((cat, i) => (
          <Link
            key={cat.key}
            to={`/collection/${cat.key}`}
            className="category-card"
            style={{ transitionDelay: `${i * 80}ms` }}
          >
            <div className="category-img-wrap">
              <img src={cat.image} alt={cat.title} />
            </div>
            <div className="category-info">
              <span className="category-num">0{i + 1}</span>
              <h3>{cat.title}</h3>
              <span className="category-arrow">Explore →</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default CategoryItems;
