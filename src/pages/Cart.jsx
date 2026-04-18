import React from "react";
import { Link } from "react-router-dom";
import "./Cart.css";

function Cart({cart,removeFromCart,updateCartQuantity,calculateTotal}){

const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
const subtotal = calculateTotal();
const shipping = subtotal >= 999 ? 0 : 99;
const finalTotal = subtotal + shipping;

return(

<div className="cart-page container">

<div className="cart-atmosphere" />

<h1 className="section-title">Your Cart</h1>

<p className="cart-subtitle">Refined essentials, ready for your next fit.</p>

{cart.length===0?(
<p className="cart-empty">Your cart is empty</p>
):(

<div className="cart-container">

<div className="cart-items">

{cart.map(item=>(

<div key={item.cartKey} className="cart-item">

<img src={item.image} alt={item.name}/>

<div className="cart-info">

<h3>{item.name}</h3>

<p>Size: {item.size || "M"}</p>

<p>₹{item.price} × {item.quantity}</p>

<p className="item-subtotal">Subtotal: ₹{item.price * item.quantity}</p>

<div className="qty-controls">
<button
className="quick-btn"
onClick={()=>updateCartQuantity(item.cartKey,-1)}
aria-label={`Decrease quantity for ${item.name}`}
>
-
</button>

<span>{item.quantity}</span>

<button
className="quick-btn"
onClick={()=>updateCartQuantity(item.cartKey,1)}
aria-label={`Increase quantity for ${item.name}`}
>
+
</button>
</div>

</div>

<button
className="remove-btn"
onClick={()=>removeFromCart(item.cartKey)}
aria-label={`Remove ${item.name} from cart`}
>
Remove
</button>

</div>

))}

</div>

<div className="cart-summary">

<p className="summary-kicker">Order Summary</p>

<h3>Total</h3>

<div className="summary-row">
<span>Items ({itemCount})</span>
<span>₹{subtotal}</span>
</div>

<div className="summary-row">
<span>Shipping</span>
<span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
</div>

<div className="summary-row grand-total">
<span>Payable</span>
<span>₹{finalTotal}</span>
</div>

<h2>₹{finalTotal}</h2>

<Link to="/checkout" className="checkout-btn">
Proceed to Checkout
</Link>

<p className="secure-note">Secure checkout and quality-sealed packaging.</p>

</div>

</div>

)}

</div>

);

}

export default Cart;