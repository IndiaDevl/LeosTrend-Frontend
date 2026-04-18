import React from "react";
import { useNavigate } from "react-router-dom";
import { FaLeaf, FaShippingFast, FaMedal, FaHandsHelping } from "react-icons/fa";
import "./About.css";

function About(){

const navigate=useNavigate();

const highlights = [
{
title:"Premium Fabric",
desc:"Heavyweight breathable cotton crafted for all-day comfort.",
icon:<FaMedal/>
},
{
title:"Spiritual Identity",
desc:"Design language inspired by Indian symbolism and modern minimalism.",
icon:<FaLeaf/>
},
{
title:"Trusted Delivery",
desc:"Fast dispatch with careful packaging across India.",
icon:<FaShippingFast/>
},
{
title:"Community Driven",
desc:"Built for people who wear culture with confidence.",
icon:<FaHandsHelping/>
}
];

return(

<div className="about-premium container">

<div className="page-nav premium-nav">

<button onClick={()=>navigate(-1)}>⬅ Back</button>

<button onClick={()=>navigate("/")}>🏠 Home</button>

</div>

<section className="about-hero-card">

<div className="hero-copy">

<p className="about-kicker">Crafted Streetwear</p>

<h1 className="about-title">About LeosTrend</h1>

<p className="about-lead">
LeosTrend blends spirituality with contemporary streetwear.
We build premium everyday pieces rooted in Indian culture,
minimal design, and strong craftsmanship.
</p>

<div className="about-metrics">
<div>
<strong>10K+</strong>
<span>Happy Customers</span>
</div>

<div>
<strong>4.8/5</strong>
<span>Average Ratings</span>
</div>

<div>
<strong>48h</strong>
<span>Fast Dispatch</span>
</div>

</div>

</div>

<div className="about-visual-wrap">
<img src="/dragon-embroidered.webp" alt="LeosTrend premium apparel" className="about-visual"/>
</div>

</section>

<section className="about-values">

<h2>Why People Choose LeosTrend</h2>

<div className="about-grid">

{highlights.map((item)=>(

<article key={item.title} className="about-card">
<div className="about-icon">{item.icon}</div>
<h3>{item.title}</h3>
<p>{item.desc}</p>
</article>

))}

</div>

</section>

<section className="about-signature">

<p>
Every drop follows one promise: keep it premium, keep it meaningful,
and keep it wearable every day.
</p>

</section>

</div>

);

}

export default About;