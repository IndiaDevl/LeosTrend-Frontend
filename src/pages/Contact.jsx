import React from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock, FaPaperPlane } from "react-icons/fa";
import "./Contact.css";

function Contact(){

const navigate=useNavigate();

return(

<div className="contact-page container">

<div className="page-nav">

<button onClick={()=>navigate(-1)}>⬅ Back</button>

<button onClick={()=>navigate("/")}>🏠 Home</button>

</div>

<section className="contact-hero">

<p className="contact-kicker">Premium Support</p>

<h1 className="contact-title">Contact LeosTrend</h1>

<p className="contact-lead">
Need help with sizing, orders, or custom requests? Reach out and our team will respond quickly with a personalized solution.
</p>

</section>

<div className="contact-container">

<div className="contact-info">

<article className="contact-card">

<div className="contact-icon-wrap">
<FaEnvelope/>
</div>

<h3>Email</h3>

<p>support@leostrend.com</p>

</article>

<article className="contact-card">

<div className="contact-icon-wrap">
<FaPhone/>
</div>

<h3>Phone</h3>

<p>+91 9876543210</p>

</article>

<article className="contact-card">

<div className="contact-icon-wrap">
<FaMapMarkerAlt/>
</div>

<h3>Location</h3>

<p>Hyderabad, India</p>

</article>

<article className="contact-card contact-hours-card">

<div className="contact-icon-wrap">
<FaClock/>
</div>

<h3>Support Hours</h3>

<p>Mon - Sat, 10:00 AM to 7:00 PM</p>

</article>

</div>

<div className="contact-form-card">

<div className="contact-form-head">
<h2>Send Message</h2>
<p>Tell us what you need and we will get back within 24 hours.</p>
</div>

<form className="contact-form" onSubmit={e => { e.preventDefault(); }}>

<div className="input-row">
<div className="input-group">
<label>Your Name</label>
<input type="text" placeholder="Enter your full name"/>
</div>

<div className="input-group">
<label>Email Address</label>
<input type="email" placeholder="name@email.com"/>
</div>
</div>

<div className="input-group">
<label>Subject</label>
<input type="text" placeholder="Order issue, product question, collaboration"/>
</div>

<div className="input-group">
<label>Message</label>
<textarea placeholder="Write your message"></textarea>
</div>

<button className="contact-submit-btn">
<FaPaperPlane/>
Send Message
</button>

</form>

</div>

</div>

</div>

);

}

export default Contact;