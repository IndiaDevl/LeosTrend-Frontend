import React, { useEffect, useRef } from "react";
import "./TrendingNow.mobile.css";

const TRENDING_SECTIONS = [
	{ key: "oversized", title: "Oversized" },
	{ key: "sweatshirts", title: "Sweatshirts" },
	{ key: "zip", title: "Zip Sweatshirts" },
	{ key: "hoodies", title: "Hoodies" },
];

export default function TrendingNowMobileAutoSlider({ products = [], onQuickView }) {
	const rowRefs = useRef([]);
	const intervalRefs = useRef([]);
	const touchStartX = useRef([]);
	const touchEndX = useRef([]);

	useEffect(() => {
		// Auto-scroll each row every 2.5 seconds
		TRENDING_SECTIONS.forEach((section, idx) => {
			const row = rowRefs.current[idx];
			if (!row) return;
			let scrollIndex = 0;
			intervalRefs.current[idx] = setInterval(() => {
				if (!row) return;
				scrollIndex = (scrollIndex + 1) % row.children.length;
				const card = row.children[scrollIndex];
				if (card) {
					row.scrollTo({ left: card.offsetLeft, behavior: "smooth" });
				}
			}, 2500);
		});
		return () => {
			intervalRefs.current.forEach((id) => clearInterval(id));
		};
	}, [products]);

	// Touch event handlers for swipe
	const handleTouchStart = (groupIndex) => (e) => {
		touchStartX.current[groupIndex] = e.touches[0].clientX;
		if (intervalRefs.current[groupIndex]) clearInterval(intervalRefs.current[groupIndex]);
	};

	const handleTouchMove = (groupIndex) => (e) => {
		touchEndX.current[groupIndex] = e.touches[0].clientX;
	};

	const handleTouchEnd = (groupIndex) => () => {
		const row = rowRefs.current[groupIndex];
		if (!row) return;
		const start = touchStartX.current[groupIndex];
		const end = touchEndX.current[groupIndex];
		if (start !== undefined && end !== undefined) {
			const diff = start - end;
			if (Math.abs(diff) > 40) {
				// Find current card index
				let currentIndex = 0;
				for (let i = 0; i < row.children.length; i++) {
					if (Math.abs(row.scrollLeft - row.children[i].offsetLeft) < 10) {
						currentIndex = i;
						break;
					}
				}
				if (diff > 0) {
					// Swipe left, next card
					const nextIndex = (currentIndex + 1) % row.children.length;
					row.scrollTo({ left: row.children[nextIndex].offsetLeft, behavior: "smooth" });
				} else {
					// Swipe right, previous card
					const prevIndex = (currentIndex - 1 + row.children.length) % row.children.length;
					row.scrollTo({ left: row.children[prevIndex].offsetLeft, behavior: "smooth" });
				}
			}
		}
		// Restart auto-scroll
		intervalRefs.current[groupIndex] = setInterval(() => {
			let scrollIndex = 0;
			if (row) {
				for (let i = 0; i < row.children.length; i++) {
					if (Math.abs(row.scrollLeft - row.children[i].offsetLeft) < 10) {
						scrollIndex = i;
						break;
					}
				}
				scrollIndex = (scrollIndex + 1) % row.children.length;
				const card = row.children[scrollIndex];
				if (card) {
					row.scrollTo({ left: card.offsetLeft, behavior: "smooth" });
				}
			}
		}, 2500);
		touchStartX.current[groupIndex] = undefined;
		touchEndX.current[groupIndex] = undefined;
	};

	const groupedProducts = TRENDING_SECTIONS.map((section) => {
		const categoryProducts = products.filter(
			(product) => String(product?.category || "").trim().toLowerCase() === section.key
		);
		return { ...section, items: categoryProducts.slice(0, 4) };
	});

	return (
		<section className="trending-now-section">
			<div className="home-section-head text-center observe-reveal">
				<p className="home-section-kicker">Editor Picks</p>
				<h2 className="home-section-title">Trending Now</h2>
				<p className="home-section-subtitle">
					Curated premium essentials from the latest drop
				</p>
			</div>
			<div className="trending-now-stack">
				{groupedProducts.map((group, groupIndex) => (
					<div key={group.key} className="trending-now-group observe-reveal">
						<div className="trending-now-group-head">
							<p className="trending-now-group-kicker">Category</p>
							<h3 className="trending-now-group-title">{group.title}</h3>
						</div>
						{group.items.length === 0 ? (
							<p className="trending-now-empty">No products available in this category yet.</p>
						) : (
							<div
								className="trending-now-grid"
								ref={(el) => (rowRefs.current[groupIndex] = el)}
								onTouchStart={handleTouchStart(groupIndex)}
								onTouchMove={handleTouchMove(groupIndex)}
								onTouchEnd={handleTouchEnd(groupIndex)}
							>
								{group.items.map((product) => {
									const hasDiscount = Number(product?.mrp) > Number(product?.price);
									let discount = hasDiscount
										? Math.round(
												((Number(product.mrp) - Number(product.price)) / Number(product.mrp)) * 100
											)
										: 0;
									if (discount >= 100) discount = 99;
									return (
										<article key={product.id} className="trending-now-card">
											<div
												className="trending-now-image-wrap"
												role="button"
												tabIndex={0}
												onClick={() => onQuickView?.(product)}
											>
												<img src={product.image} alt={product.name} loading="lazy" />
												{hasDiscount && discount > 0 && (
													<span className="trending-now-discount">{discount}% OFF</span>
												)}
											</div>
											<div className="trending-now-card-body">
												<p className="trending-now-card-category">{group.title}</p>
												<p className="trending-now-card-name">{product.name}</p>
												<div className="trending-now-card-footer">
													<div className="trending-now-prices">
														<span className="trending-now-price-main">₹{product.price}</span>
														{hasDiscount && (
															<span className="trending-now-price-mrp">₹{product.mrp}</span>
														)}
													</div>
													<button
														type="button"
														className="trending-now-view-btn"
														onClick={() => onQuickView?.(product)}
													>
														View
													</button>
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

