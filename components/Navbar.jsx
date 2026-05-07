import { Link } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";
import { useState } from "react";

function Navbar({ cartCount }) {

const [open,setOpen] = useState(false);

return (

<header className="navbar">

<div className="nav-container">

<Link to="/" className="brand">LeosTrend</Link>

<nav className="nav-links">

<Link to="/">Home</Link>

<div
className="mega-parent"
onMouseEnter={()=>setOpen(true)}
onMouseLeave={()=>setOpen(false)}
>

<span className="collection-link">Collection</span>

{open && (

<div className="mega-menu">

<div className="mega-column">

<h4>T-Shirts</h4>

<Link to="/collection/oversized">Oversized</Link>

<Link to="/collection/graphic">Graphic</Link>

</div>

<div className="mega-column">

<h4>Outerwear</h4>

<Link to="/collection/hoodies">Hoodies</Link>

<Link to="/collection/sweatshirts">Sweatshirts</Link>

<Link to="/collection/zip">Zip Jackets</Link>

</div>

</div>

)}

</div>

<Link to="/about">About</Link>
<Link to="/contact">Contact</Link>

</nav>

<Link to="/cart" className="cart">

<FaShoppingCart/>

<span>{cartCount}</span>

</Link>

</div>

</header>

);

}

export default Navbar;