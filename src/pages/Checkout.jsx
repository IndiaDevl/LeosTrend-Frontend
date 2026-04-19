import React, { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../utils/api";
import { useNavigate } from "react-router-dom";
import { useCheckout } from "../context/CheckoutContext";
import "./Checkout.css";

const STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa",
  "Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala",
  "Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland",
  "Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura",
  "Uttar Pradesh","Uttarakhand","West Bengal"
];

function Checkout({ cart = [], calculateTotal = () => 0 }) {
  const { order, setOrder, clearOrder } = useCheckout();

  const [step, setStep] = useState(2);
  const [loading, setLoading] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [paymentError, setPaymentError] = useState(null);

  const navigate = useNavigate();

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (document.getElementById("razorpay-script")) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.id = "razorpay-script";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);
    setPaymentError(null);
    setPaymentDetails(null);

    const scriptLoaded = await loadRazorpayScript();

    if (!scriptLoaded) {
      setPaymentError("Failed to load payment gateway.");
      setLoading(false);
      return;
    }

    const totalAmount = calculateTotal() * 100;

    let orderData;

    try {
      const res = await axios.post(
        `${API_BASE_URL}/razorpay/order`,
        {
          amount: totalAmount,
          currency: "INR",
          receipt: `order_rcptid_${Date.now()}`,
        }
      );

      orderData = res.data;
    } catch (error) {
      const serverMessage =
        error.response?.data?.details ||
        error.response?.data?.error ||
        error.message;

      setPaymentError(serverMessage || "Failed to create payment order.");
      setLoading(false);
      return;
    }

    const options = {
      key: orderData.key_id,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "Leos Trend",
      description: "Order Payment",
      order_id: orderData.id,

      handler: function (response) {
        setLoading(false);

        setPaymentDetails({
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
          signature: response.razorpay_signature,
          amount: orderData.amount / 100,
          currency: orderData.currency,
          status: "Success",
          date: new Date().toLocaleString(),
        });

        clearOrder();
      },

      modal: {
        ondismiss: function () {
          setLoading(false);
          setPaymentError(null);
        },
      },

      prefill: {
        name: order.customer,
        email: order.email,
        contact: order.phone,
      },

      notes: {
        address: order.shippingAddress,
      },

      theme: {
        color: "#3b82f6",
      },
    };

    const rzp = new window.Razorpay(options);

    rzp.on("payment.failed", function (response) {
      setLoading(false);

      setPaymentError(
        "Payment Failed: " +
          (response.error?.description || "Unknown error")
      );
    });

    rzp.open();
  };

  return (
    <div className="checkout-page">
      <div className="checkout-steps">
        <div className={step >= 2 ? "active" : ""}>Delivery</div>
        <div className={step >= 3 ? "active" : ""}>Payment</div>
      </div>

      <div className="checkout-container">
        {paymentDetails && (
          <div className="payment-details-premium glass">
            <h2>Payment Successful!</h2>

            <p>Amount: ₹{paymentDetails.amount}</p>
            <p>Payment ID: {paymentDetails.paymentId}</p>
            <p>Order ID: {paymentDetails.orderId}</p>
            <p>Status: {paymentDetails.status}</p>
            <p>Date: {paymentDetails.date}</p>

            <button onClick={() => navigate("/")}>
              Continue Shopping
            </button>
          </div>
        )}

        {paymentError && (
          <div className="payment-error glass">
            {paymentError}
          </div>
        )}

        {!paymentDetails && (
          <>
            <div className="checkout-form glass">
              {step === 2 && (
                <>
                  <h2>Delivery Details</h2>

                  <div className="input-grid">
                    <input
                      placeholder="Full Name"
                      value={order.customer}
                      onChange={(e) =>
                        setOrder({ ...order, customer: e.target.value })
                      }
                    />

                    <input
                      placeholder="Phone"
                      value={order.phone}
                      onChange={(e) =>
                        setOrder({ ...order, phone: e.target.value })
                      }
                    />

                    <input
                      placeholder="Email"
                      value={order.email}
                      onChange={(e) =>
                        setOrder({ ...order, email: e.target.value })
                      }
                    />

                    <input
                      placeholder="Address"
                      value={order.shippingAddress}
                      onChange={(e) =>
                        setOrder({
                          ...order,
                          shippingAddress: e.target.value,
                        })
                      }
                    />

                    <input
                      placeholder="City"
                      value={order.city}
                      onChange={(e) =>
                        setOrder({ ...order, city: e.target.value })
                      }
                    />

                    <select
                      value={order.stateVal}
                      onChange={(e) =>
                        setOrder({
                          ...order,
                          stateVal: e.target.value,
                        })
                      }
                    >
                      {STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>

                    <input
                      placeholder="PIN Code"
                      value={order.pin}
                      onChange={(e) =>
                        setOrder({ ...order, pin: e.target.value })
                      }
                    />
                  </div>

                  <button
                    className="primary-btn"
                    onClick={() => setStep(3)}
                  >
                    Continue →
                  </button>
                </>
              )}

              {step === 3 && (
                <>
                  <h2>Payment</h2>

                  <div className="payment-box">
                    Secure Payment (UPI / Card / Wallet)
                  </div>

                  <div className="btn-row">
                    <button
                      className="secondary-btn"
                      onClick={() => setStep(2)}
                    >
                      ← Back
                    </button>

                    <button
                      className="primary-btn glow"
                      onClick={handlePayment}
                      disabled={loading}
                    >
                      {loading
                        ? "Processing..."
                        : "Pay Now with Razorpay 🚀"}
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="checkout-summary glass">
              <h2>Order Summary</h2>

              {cart.map((item) => (
                <div
                  className="summary-item"
                  key={item.cartKey}
                >
                  <img src={item.image} alt="" />

                  <div>
                    <p>{item.name}</p>
                    <span>
                      ₹{item.price} × {item.quantity}
                    </span>
                  </div>
                </div>
              ))}

              <div className="summary-row">
                <span>Subtotal</span>
                <span>
                  ₹
                  {cart.reduce(
                    (s, i) => s + i.price * i.quantity,
                    0
                  )}
                </span>
              </div>

              <div className="summary-row">
                <span>Shipping</span>
                <span>₹70</span>
              </div>

              <div className="summary-total">
                <span>Total</span>
                <strong>₹{calculateTotal()}</strong>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Checkout;