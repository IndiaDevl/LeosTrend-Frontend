import React, { useRef } from "react";

function ProductTilt({ children }) {

const ref = useRef(null);

function handleMove(e){

const card = ref.current;
const rect = card.getBoundingClientRect();

const x = e.clientX - rect.left;
const y = e.clientY - rect.top;

const centerX = rect.width / 2;
const centerY = rect.height / 2;

const rotateX = -(y - centerY) / 15;
const rotateY = (x - centerX) / 15;

card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

}

function reset(){
ref.current.style.transform = "rotateX(0deg) rotateY(0deg)";
}

return(

<div
ref={ref}
className="tilt-card w-full"
onMouseMove={handleMove}
onMouseLeave={reset}
style={{cursor:"pointer"}}
>

{children}

</div>

);

}

export default ProductTilt;