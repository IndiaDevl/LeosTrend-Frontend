import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { getOptimizedImageUrl } from "../utils/api";
import "./CategoryItems.css";

const categoryItems = [
  {
    key: "oversized",
    title: "TEST123",
    badge: "T-Shirts",
    image:
      "https://res.cloudinary.com/dppuhxbti/image/upload/v1782810854/ChatGPT_Image_Jun_30_2026_02_33_21_PM_v5swa7.png",
  },
  {
    key: "sweatshirts",
    title: "Sweatshirts",
    badge: "Graphic",
    image:
      "https://res.cloudinary.com/dzb32pohu/image/upload/f_auto,q_auto,dpr_auto,c_limit,w_760,h_950/v1777560140/ChatGPT_Image_Apr_28_2026_10_01_22_PM_vtihtm.png",
  },
  {
    key: "zip",
    title: "Zip",
    badge: "Tops",
    image:
      "https://res.cloudinary.com/dzb32pohu/image/upload/v1777574766/ChatGPT_Image_May_1_2026_12_12_28_AM_oh3zcm.png",
  },
  {
    key: "hoodies",
    title: "Hoodies",
    badge: "Essentials",
    image:
      "https://res.cloudinary.com/dzb32pohu/image/upload/v1777658981/WhatsApp_Image_2026-05-01_at_11.26.29_PM_xnj157.jpg",
  },
];

function CategoryItems() {
  const sectionRef = useRef(null);

  useEffect(() => {
    if (!sectionRef.current) return undefined;

    const cards = Array.from(sectionRef.current.querySelectorAll(".category-card"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -20px 0px" }
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="category" ref={sectionRef}>
      <div className="category-track">
        {categoryItems.map((category) => (
          <Link
            key={category.key}
            to={`/collection/${category.key}`}
            className="category-card"
            aria-label={`Shop ${category.title}`}
          >
            <div className="category-img-wrap">
              <span className="category-badge" aria-hidden="true">
                {category.badge}
              </span>
              <img
                src={getOptimizedImageUrl(category.image, { width: 900, height: 1100 })}
                alt={category.title}
                loading="lazy"
                draggable="false"
              />
            </div>

            <div className="category-info">
              <h3>{category.title}</h3>
              <span className="category-arrow">Explore</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default CategoryItems;