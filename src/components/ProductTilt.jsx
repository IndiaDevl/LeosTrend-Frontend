import React, { useEffect, useRef, useState } from "react";

function ProductTilt({ children }) {
	const ref = useRef(null);
	const frameRef = useRef(null);
	const hoverableRef = useRef(false);
	const [isHoverable, setIsHoverable] = useState(false);

	useEffect(() => {
		if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
			return undefined;
		}

		const media = window.matchMedia("(hover: hover) and (pointer: fine)");
		const updateHoverability = () => {
			hoverableRef.current = media.matches;
			setIsHoverable(media.matches);
		};

		updateHoverability();

		if (typeof media.addEventListener === "function") {
			media.addEventListener("change", updateHoverability);
			return () => media.removeEventListener("change", updateHoverability);
		}

		media.addListener(updateHoverability);
		return () => media.removeListener(updateHoverability);
	}, []);

	useEffect(() => {
		return () => {
			if (frameRef.current) {
				cancelAnimationFrame(frameRef.current);
			}
		};
	}, []);

	function handleMove(event) {
		if (!hoverableRef.current) return;

		const card = ref.current;
		if (!card) return;

		if (frameRef.current) {
			cancelAnimationFrame(frameRef.current);
		}

		frameRef.current = requestAnimationFrame(() => {
			const rect = card.getBoundingClientRect();
			const x = event.clientX - rect.left;
			const y = event.clientY - rect.top;
			const centerX = rect.width / 2;
			const centerY = rect.height / 2;
			const rotateX = -(y - centerY) / 18;
			const rotateY = (x - centerX) / 18;

			card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
		});
	}

	function reset() {
		if (frameRef.current) {
			cancelAnimationFrame(frameRef.current);
			frameRef.current = null;
		}

		if (ref.current) {
			ref.current.style.transform = "rotateX(0deg) rotateY(0deg)";
		}
	}

	return (
		<div
			ref={ref}
			className="tilt-card w-full"
			onMouseMove={handleMove}
			onMouseLeave={reset}
			style={{ cursor: isHoverable ? "pointer" : "default", willChange: isHoverable ? "transform" : "auto" }}
		>
			{children}
		</div>
	);

}

export default ProductTilt;