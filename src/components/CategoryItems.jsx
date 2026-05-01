import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./CategoryItems.css";

const categoryItems = [
  { key: "oversized", title: "Oversized", image: "https://res.cloudinary.com/dzb32pohu/image/upload/v1777570621/WhatsApp_Image_2026-04-30_at_11.04.02_PM_v6emxj.jpg" },
  { key: "sweatshirts", title: "Sweatshirts", image: "https://res.cloudinary.com/dzb32pohu/image/upload/v1777560139/ChatGPT_Image_Apr_28_2026_10_01_30_PM_mga6ky.png" },
  { key: "zip", title: "Zip", image: "https://res.cloudinary.com/dzb32pohu/image/upload/v1777560186/ChatGPT_Image_Apr_28_2026_10_05_17_PM_bqjydm.png" },
  { key: "hoodies", title: "Hoodies", image: "https://res.cloudinary.com/dzb32pohu/image/upload/v1777657279/WhatsApp_Image_2026-05-01_at_11.08.51_PM_qqdw8u.jpg" },
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
