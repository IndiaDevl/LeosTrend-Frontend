import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TrendingNow.mobile.css";
import { buildTrendingGroups } from "../utils/trendingNow";
import { getOptimizedImageUrl } from "../utils/api";
import { navigateToPageStart } from "../utils/navigation";

const AUTO_ADVANCE_DELAY = 3600;
const AUTO_RESUME_DELAY = 1800;
const DRAG_RESUME_DELAY = 1100;

function TrendingNowMobileCarouselRow({ group, groupIndex, navigate, getImageUrl }) {
	const viewportRef = useRef(null);
	const cardRefs = useRef([]);
	const autoAdvanceRef = useRef(0);
	const pauseTimeoutRef = useRef(0);
	const settleTimeoutRef = useRef(0);
	const isAutoScrollingRef = useRef(false);
	const dragStateRef = useRef({ active: false, pointerId: null, startX: 0, startScrollLeft: 0, moved: false });
	const pageCount = Math.ceil(group.items.length / 2);
	const pageStartIndexes = useMemo(
		() => Array.from({ length: pageCount }, (_, pageIndex) => Math.min(pageIndex * 2, Math.max(0, group.items.length - 2))),
		[group.items.length, pageCount]
	);
	const [activePage, setActivePage] = useState(0);
	const activeStartIndex = pageStartIndexes[activePage] ?? 0;

	useEffect(() => {
		const viewport = viewportRef.current;
		if (!viewport || group.items.length === 0) return undefined;

		const getAlignedCardLeft = (card) => {
			if (!card) return viewport.scrollLeft;
			return card.offsetLeft;
		};

		const scrollToPage = (pageIndex, behavior = "smooth") => {
			const normalizedPage = ((pageIndex % pageCount) + pageCount) % pageCount;
			const targetCard = cardRefs.current[pageStartIndexes[normalizedPage]];
			if (!targetCard) return;
			isAutoScrollingRef.current = true;
			viewport.scrollTo({ left: getAlignedCardLeft(targetCard), behavior });
			setActivePage(normalizedPage);
		};

		const syncActivePage = () => {
			const nextPage = getClosestPage();
			setActivePage(nextPage);
			return nextPage;
		};

		const getClosestPage = () => {
			const viewportStart = viewport.scrollLeft;
			let closestPage = 0;
			let smallestDistance = Number.POSITIVE_INFINITY;
			for (let pageIndex = 0; pageIndex < pageStartIndexes.length; pageIndex += 1) {
				const card = cardRefs.current[pageStartIndexes[pageIndex]];
				if (!card) continue;
				const distance = Math.abs(card.offsetLeft - viewportStart);
				if (distance < smallestDistance) {
					smallestDistance = distance;
					closestPage = pageIndex;
				}
			}
			return closestPage;
		};

		const snapToNearest = (behavior = "smooth") => {
			const nearestPage = getClosestPage();
			const targetCard = cardRefs.current[pageStartIndexes[nearestPage]];
			if (!targetCard) return;
			isAutoScrollingRef.current = true;
			viewport.scrollTo({ left: getAlignedCardLeft(targetCard), behavior });
			setActivePage(nearestPage);
		};

		const pauseAuto = (duration = AUTO_RESUME_DELAY) => {
			window.clearTimeout(pauseTimeoutRef.current);
			pauseTimeoutRef.current = window.setTimeout(() => {
				pauseTimeoutRef.current = 0;
			}, duration);
		};

		const startAutoAdvance = () => {
			window.clearInterval(autoAdvanceRef.current);
			if (pageCount < 2) return;
			autoAdvanceRef.current = window.setInterval(() => {
				if (dragStateRef.current.active || pauseTimeoutRef.current !== 0) return;
				scrollToPage(activePage + 1);
			}, AUTO_ADVANCE_DELAY);
		};

		const handleScroll = () => {
			syncActivePage();
			window.clearTimeout(settleTimeoutRef.current);
			if (isAutoScrollingRef.current) {
				isAutoScrollingRef.current = false;
				return;
			}
			pauseAuto(AUTO_RESUME_DELAY);
			if (!dragStateRef.current.active) {
				settleTimeoutRef.current = window.setTimeout(() => {
					snapToNearest();
				}, 140);
			}
		};

		const handlePointerDown = (event) => {
			if (event.pointerType !== "mouse" || event.button !== 0) return;
			dragStateRef.current = {
				active: true,
				pointerId: event.pointerId,
				startX: event.clientX,
				startScrollLeft: viewport.scrollLeft,
				moved: false,
			};
			viewport.classList.add("is-dragging");
			viewport.setPointerCapture?.(event.pointerId);
			pauseAuto(2200);
		};

		const handlePointerMove = (event) => {
			const dragState = dragStateRef.current;
			if (!dragState.active || dragState.pointerId !== event.pointerId) return;
			const delta = event.clientX - dragState.startX;
			if (Math.abs(delta) > 4) {
				dragState.moved = true;
			}
			viewport.scrollLeft = dragState.startScrollLeft - delta;
			syncActivePage();
		};

		const releasePointer = (event) => {
			const dragState = dragStateRef.current;
			if (!dragState.active || dragState.pointerId !== event.pointerId) return;
			dragStateRef.current = { active: false, pointerId: null, startX: 0, startScrollLeft: 0, moved: false };
			viewport.classList.remove("is-dragging");
			viewport.releasePointerCapture?.(event.pointerId);
			snapToNearest();
			pauseAuto(DRAG_RESUME_DELAY);
		};

		const handleMouseEnter = () => pauseAuto(1000000);
		const handleMouseLeave = () => {
			window.clearTimeout(pauseTimeoutRef.current);
			pauseTimeoutRef.current = 0;
		};

		const handleTouchStart = () => pauseAuto(2200);
		const handleWheel = () => pauseAuto(1800);

		const resizeObserver = new ResizeObserver(() => {
			scrollToPage(activePage, "auto");
		});

		resizeObserver.observe(viewport);
		scrollToPage(activePage, "auto");
		syncActivePage();
		startAutoAdvance();
		viewport.addEventListener("scroll", handleScroll, { passive: true });
		viewport.addEventListener("pointerdown", handlePointerDown);
		viewport.addEventListener("pointermove", handlePointerMove);
		viewport.addEventListener("pointerup", releasePointer);
		viewport.addEventListener("pointercancel", releasePointer);
		viewport.addEventListener("mouseenter", handleMouseEnter);
		viewport.addEventListener("mouseleave", handleMouseLeave);
		viewport.addEventListener("touchstart", handleTouchStart, { passive: true });
		viewport.addEventListener("wheel", handleWheel, { passive: true });

		return () => {
			window.clearInterval(autoAdvanceRef.current);
			window.clearTimeout(pauseTimeoutRef.current);
			window.clearTimeout(settleTimeoutRef.current);
			resizeObserver.disconnect();
			viewport.removeEventListener("scroll", handleScroll);
			viewport.removeEventListener("pointerdown", handlePointerDown);
			viewport.removeEventListener("pointermove", handlePointerMove);
			viewport.removeEventListener("pointerup", releasePointer);
			viewport.removeEventListener("pointercancel", releasePointer);
			viewport.removeEventListener("mouseenter", handleMouseEnter);
			viewport.removeEventListener("mouseleave", handleMouseLeave);
			viewport.removeEventListener("touchstart", handleTouchStart);
			viewport.removeEventListener("wheel", handleWheel);
		};
	}, [activePage, group.items, pageCount, pageStartIndexes]);

	if (!group.items.length) return null;

	return (
		<div
			key={group.key}
			className="trending-now-group trending-now-mobile-group observe-reveal"
			style={{ "--reveal-delay": `${groupIndex * 90}ms` }}
		>
			<div className="trending-now-group-head trending-now-mobile-group-head">
				<div>
					<p className="trending-now-group-kicker">Category</p>
					<h3 className="trending-now-group-title">{group.title}</h3>
				</div>
			</div>

			<div className="trending-now-mobile-carousel-shell">
				<div className="trending-now-mobile-carousel-fade trending-now-mobile-carousel-fade-left" aria-hidden="true" />
				<div className="trending-now-mobile-carousel-fade trending-now-mobile-carousel-fade-right" aria-hidden="true" />
				<div
					ref={viewportRef}
					className="trending-now-mobile-viewport"
					aria-label={`${group.title} carousel`}
				>
					<div className="trending-now-mobile-track">
						{group.items.map((product, index) => {
							const hasDiscount = Number(product?.mrp) > Number(product?.price);
							let discount = hasDiscount
								? Math.round(((Number(product.mrp) - Number(product.price)) / Number(product.mrp)) * 100)
								: 0;
							if (discount >= 100) discount = 99;
							const isActiveCard = index === activeStartIndex || index === Math.min(activeStartIndex + 1, group.items.length - 1);

							return (
								<article
									key={product.id}
									ref={(element) => {
										cardRefs.current[index] = element;
									}}
									className={`trending-now-card trending-now-mobile-card${isActiveCard ? " is-active" : ""}`}
									role="button"
									tabIndex={0}
									onClick={() => navigateToPageStart(navigate, `/product/${encodeURIComponent(product.id)}`)}
									onKeyDown={(event) => {
										if (event.key === "Enter" || event.key === " ") {
											event.preventDefault();
											navigateToPageStart(navigate, `/product/${encodeURIComponent(product.id)}`);
										}
									}}
								>
									<div className="trending-now-image-wrap trending-now-mobile-image-wrap">
										<img
											src={getImageUrl(product.image)}
											alt={product.name}
											loading="eager"
											fetchPriority={groupIndex === 0 && index < 2 ? "high" : "auto"}
											decoding="async"
											draggable="false"
										/>
										{hasDiscount && discount > 0 && (
											<span className="trending-now-discount">{discount}% OFF</span>
										)}
									</div>

									<div className="trending-now-card-body trending-now-mobile-card-body">
										<p className="trending-now-card-category">{group.title}</p>
										<p className="trending-now-card-name">{product.name}</p>
										<div className="trending-now-card-footer">
											<div className="trending-now-prices">
												<span className="trending-now-price-main">₹{product.price}</span>
												{hasDiscount && <span className="trending-now-price-mrp">₹{product.mrp}</span>}
											</div>
										</div>
									</div>
								</article>
							);
						})}
					</div>
				</div>
			</div>

			<div className="trending-now-mobile-meta">
					<div className="trending-now-mobile-progress" aria-label={`${group.title} visible page`}>
					<div className="trending-now-mobile-progress-rail">
						<div
							className="trending-now-mobile-progress-fill"
								style={{ width: `${((activePage + 1) / pageCount) * 100}%` }}
						/>
					</div>
					<div className="trending-now-mobile-progress-stops">
							{Array.from({ length: pageCount }, (_, pageIndex) => (
							<button
									key={`${group.key}-page-${pageIndex}`}
								type="button"
									className={`trending-now-mobile-progress-stop${activePage === pageIndex ? " is-active" : ""}`}
								onClick={() => {
									const viewport = viewportRef.current;
										const targetCard = cardRefs.current[pageStartIndexes[pageIndex]];
									if (!viewport || !targetCard) return;
										viewport.scrollTo({ left: targetCard.offsetLeft, behavior: "smooth" });
								}}
									aria-label={`Show ${group.title} page ${pageIndex + 1}`}
									aria-pressed={activePage === pageIndex}
							/>
						))}
					</div>
				</div>
				<div className="trending-now-mobile-meta-copy">
						<p className="trending-now-mobile-position">{String(activePage + 1).padStart(2, "0")} / {String(pageCount).padStart(2, "0")}</p>
					<p className="trending-now-mobile-hint">Drag or swipe to explore</p>
				</div>
			</div>
		</div>
	);
}

export default function TrendingNowMobileAutoSlider({ products = [], onQuickView }) {
	const navigate = useNavigate();

	const groupedProducts = useMemo(() => buildTrendingGroups(products), [products]);

	const visibleGroups = groupedProducts.filter((group) => group.items.length > 0);

	const getImageUrl = (image) => getOptimizedImageUrl(image, { width: 560, height: 700 });

	return (

		<section className="trending-now-section trending-now-mobile-layout">

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

			<div className="trending-now-stack trending-now-mobile-stack">

				{visibleGroups.map((group, groupIndex) => (
					<TrendingNowMobileCarouselRow
						key={group.key}
						group={group}
						groupIndex={groupIndex}
						navigate={navigate}
						getImageUrl={getImageUrl}
					/>
				))}

			</div>

		</section>
	);
}