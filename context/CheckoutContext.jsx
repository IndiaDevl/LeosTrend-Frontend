import React, { createContext, useContext, useEffect, useState } from "react";

const CheckoutContext = createContext();

const CHECKOUT_KEY = "checkoutOrder";

const defaultOrder = {
  customer: "",
  phone: "",
  email: "",
  shippingAddress: "",
  city: "",
  stateVal: "Andhra Pradesh",
  pin: ""
};

export function CheckoutProvider({ children }) {
  const [order, setOrder] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(CHECKOUT_KEY));
      return saved ? { ...defaultOrder, ...saved } : defaultOrder;
    } catch {
      return defaultOrder;
    }
  });

  useEffect(() => {
    localStorage.setItem(CHECKOUT_KEY, JSON.stringify(order));
  }, [order]);

  const clearOrder = () => {
    setOrder(defaultOrder);
    localStorage.removeItem(CHECKOUT_KEY);
  };

  return (
    <CheckoutContext.Provider value={{ order, setOrder, clearOrder }}>
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  return useContext(CheckoutContext);
}