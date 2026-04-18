import React,{useRef} from "react";

function ImageZoom({src}){

const imgRef = useRef();

function zoom(e){

const img = imgRef.current;
const rect = img.getBoundingClientRect();

const x = ((e.clientX-rect.left)/rect.width)*100;
const y = ((e.clientY-rect.top)/rect.height)*100;

img.style.transformOrigin = `${x}% ${y}%`;
img.style.transform = "scale(2)";

}

function reset(){
imgRef.current.style.transform = "scale(1)";
}

return(

<div
className="zoom-container"
onMouseMove={zoom}
onMouseLeave={reset}
>

<img ref={imgRef} src={src} alt=""/>

</div>

);

}

export default ImageZoom;