import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./TrendingNow.mobile.css";

const TRENDING_SECTIONS = [
	{ key: "oversized", title: "Oversized" },
	{ key: "sweatshirts", title: "Sweatshirts" },
	{ key: "zip", title: "Zip Sweatshirts" },
	{ key: "hoodies", title: "Hoodies" },
];

export default function TrendingNowMobileAutoSlider({ products = [], onQuickView }) {

	const navigate = useNavigate();

	const rowRefs = useRef([]);
	const autoScrollRefs = useRef([]);

	useEffect(() => {

	rowRefs.current.forEach((row) => {

		if (!row) return;

		let currentIndex = 0;
		let interval;

		const startSlider = () => {

			interval = setInterval(() => {

				const cards = row.children;

				if (!cards.length) return;

				currentIndex++;

				if (currentIndex >= cards.length) {
					currentIndex = 0;
				}

				row.scrollTo({
					left: cards[currentIndex].offsetLeft,
					behavior: "smooth"
				});

			}, 3500);
		};

		const stopSlider = () => {
			clearInterval(interval);
		};

		row.addEventListener("touchstart", stopSlider);

		row.addEventListener("touchend", () => {
			stopSlider();
			startSlider();
		});

		startSlider();

		autoScrollRefs.current.push(() => {
			stopSlider();
		});
	});

	return () => {
		autoScrollRefs.current.forEach((cleanup) => cleanup());
	};

}, []);

	const groupedProducts = TRENDING_SECTIONS.map((section) => {

		const categoryProducts = products.filter(
			(product) =>
				String(product?.category || "")
					.trim()
					.toLowerCase() === section.key
		);

		return {
			...section,
			items: categoryProducts.slice(0, 4),
		};
	});

	return (

		<section className="trending-now-section">

			<div className="home-section-head text-center observe-reveal">

				<p className="home-section-kicker">
					Editor Picks
				</p>

				<h2 className="home-section-title">
					Trending Now
				</h2>

				<p className="home-section-subtitle">
					Curated premium essentials from the latest drop
				</p>

			</div>

			<div className="trending-now-stack">

				{groupedProducts.map((group, groupIndex) => (

					<div
						key={group.key}
						className="trending-now-group observe-reveal"
					>

						<div className="trending-now-group-head">

							<p className="trending-now-group-kicker">
								Category
							</p>

							<h3 className="trending-now-group-title">
								{group.title}
							</h3>

						</div>

						{group.items.length === 0 ? (

							<p className="trending-now-empty">
								No products available in this category yet.
							</p>

						) : (

							<div
								className="trending-now-grid"
								ref={(el) => (rowRefs.current[groupIndex] = el)}
							>

								{group.items.map((product) => {

									const hasDiscount =
										Number(product?.mrp) >
										Number(product?.price);

									let discount = hasDiscount
										? Math.round(
												(
													(Number(product.mrp) -
														Number(product.price)) /
													Number(product.mrp)
												) * 100
										  )
										: 0;

									if (discount >= 100) discount = 99;

									return (

										<article
											key={product.id}
											className="trending-now-card"
											role="button"
											tabIndex={0}
											onClick={() =>
												navigate(
													`/product/${encodeURIComponent(product.id)}`
												)
											}
										>

											<div className="trending-now-image-wrap">

												<img
													src={product.image}
													alt={product.name}
													loading="lazy"
												/>

												{hasDiscount && discount > 0 && (

													<span className="trending-now-discount">
														{discount}% OFF
													</span>

												)}

											</div>

											<div className="trending-now-card-body">

												<p className="trending-now-card-category">
													{group.title}
												</p>

												<p className="trending-now-card-name">
													{product.name}
												</p>

												<div className="trending-now-card-footer">

													<div className="trending-now-prices">

														<span className="trending-now-price-main">
															₹{product.price}
														</span>

														{hasDiscount && (

															<span className="trending-now-price-mrp">
																₹{product.mrp}
															</span>

														)}

													</div>

												</div>

											</div>

										</article>
									);
								})}

							</div>
						)}

					</div>
				))}

			</div>

		</section>
	);
}