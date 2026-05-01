import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL, ORDERS_API_URL } from "../utils/api";
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

function StateDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="state-dropdown" ref={ref}>
      <button type="button" className={`state-dropdown-trigger${open ? " open" : ""}`} onClick={() => setOpen(p => !p)}>
        <span className="state-dropdown-value">{value}</span>
        <span className="state-dropdown-arrow" aria-hidden="true" />
      </button>
      {open && (
        <div className="state-dropdown-list">
          {STATES.map((s) => (
            <button
              key={s}
              type="button"
              className={`state-dropdown-option${s === value ? " selected" : ""}`}
              onClick={() => { onChange(s); setOpen(false); }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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
        `${API_BASE_URL}/api/payment/razorpay/order`,
      //  `https://leostrend.com/api/payment/razorpay/order`,
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

      handler: async function (response) {
        const fullAddress = [
          order.shippingAddress,
          order.city,
          order.stateVal,
          order.pin,
        ].filter(Boolean).join(", ");

        const orderPayload = {
          customer: order.customer,
          phone: order.phone,
          email: order.email,
          shippingAddress: fullAddress,
          items: cart.map((item) => ({
            id: item.id || item._id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            image: item.image,
          })),
          total: calculateTotal(),
          payment: {
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
          },
        };

        // Save payment backup to localStorage in case API call fails
        const paymentBackup = {
          ...orderPayload,
          paymentId: response.razorpay_payment_id,
          paidAt: new Date().toISOString(),
        };
        localStorage.setItem("leostrend_payment_backup", JSON.stringify(paymentBackup));

        // Retry up to 3 times if saving order fails
        let lastError = null;
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            const res = await axios.post(ORDERS_API_URL, orderPayload);

            // Success — remove backup and navigate
            localStorage.removeItem("leostrend_payment_backup");
            // Save phone/email for order lookup
            localStorage.setItem('leostrend_order_contact', JSON.stringify({
              phone: order.phone,
              email: order.email
            }));
            clearOrder();
            setLoading(false);

            navigate("/order-success", {
              state: {
                orderId: res.data.orderId,
                orderNumber: res.data.orderNumber,
              },
            });
            return;
          } catch (err) {
            lastError = err;
            // Wait before retrying (500ms, 1500ms)
            if (attempt < 3) {
              await new Promise((r) => setTimeout(r, attempt * 500));
            }
          }
        }

        // All retries failed — payment backup is still in localStorage
        setLoading(false);
        setPaymentError(
          "Payment of ₹" + calculateTotal() + " was successful (Payment ID: " +
            response.razorpay_payment_id +
            ") but we couldn't save your order. Don't worry — your payment is safe. " +
            "Please contact support with this Payment ID and we will process your order."
        );
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

      <div className="checkout-page-header">
        <p className="checkout-kicker">Leos Trend</p>
        <h1 className="checkout-page-title">Checkout</h1>
      </div>

      <div className="checkout-steps">
        <div className={`checkout-step${step >= 2 ? " active" : ""}`}>
          <span className="step-num">01</span>
          Delivery
        </div>
        <div className="step-divider" />
        <div className={`checkout-step${step >= 3 ? " active" : ""}`}>
          <span className="step-num">02</span>
          Payment
        </div>
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
            <div className="checkout-form">
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

                    <StateDropdown
                      value={order.stateVal}
                      onChange={(s) => setOrder({ ...order, stateVal: s })}
                    />

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
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M19 12H5M12 5l-7 7 7 7"/>
                      </svg>
                      Back
                    </button>

                    <button
                      className="primary-btn pay-btn"
                      onClick={handlePayment}
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="pay-btn-loading">
                          <span className="pay-spinner" />
                          <span>Processing</span>
                        </span>
                      ) : (
                        <span className="pay-btn-inner">
                          <span className="pay-btn-left">
                            <svg className="pay-lock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                              <rect x="5" y="11" width="14" height="10" rx="1"/>
                              <path d="M8 11V7a4 4 0 0 1 8 0v4"/>
                            </svg>
                            <span className="pay-btn-text">Pay Now</span>
                          </span>
                          <span className="pay-secure-badge">SSL Secured</span>
                        </span>
                      )}
                    </button>
                  </div>

                  <p className="pay-trust-line">
                    <span className="pay-trust-dot" />
                    256-bit encryption
                    <span className="pay-trust-sep" />
                    PCI DSS Compliant
                    <span className="pay-trust-sep" />
                    Secure Checkout
                  </p>
                </>
              )}
            </div>

            <div className="checkout-summary">
              <h2>Order Summary</h2>

              {cart.map((item) => (
                <div className="summary-item" key={item.cartKey}>
                  <img src={item.image} alt="" />
                  <div className="summary-item-info">
                    <p>{item.name}</p>
                    <span>₹{item.price} × {item.quantity}</span>
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