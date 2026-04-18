import React, { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import useBodyScrollLock from "../utils/useBodyScrollLock";

function Login({
  open,
  mode,
  initialForm,
  error,
  loading,
  onModeChange,
  onClose,
  onSubmit,
}) {
  const panelRef = useRef(null);
  const scrollTopRef = useRef(0);
  const nameInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const [formState, setFormState] = useState(() => ({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  }));

  useBodyScrollLock(open, "wishlist-auth-open");

  const firstFieldKey = useMemo(() => (mode === "register" ? "name" : "email"), [mode]);

  useEffect(() => {
    if (!open) return;

    setFormState((prev) => ({
      name: initialForm?.name || prev.name || "",
      email: initialForm?.email || prev.email || "",
      phone: initialForm?.phone || prev.phone || "",
      password: "",
      confirmPassword: "",
    }));
    scrollTopRef.current = 0;
  }, [open, mode, initialForm?.email, initialForm?.name, initialForm?.phone]);

  useLayoutEffect(() => {
    if (!open || !panelRef.current) return;
    panelRef.current.scrollTop = scrollTopRef.current;
  }, [open, formState, error, loading]);

  useEffect(() => {
    if (!open) return;

    if (error?.suggestedMode === "login" && mode === "login") {
      passwordInputRef.current?.focus();
      return;
    }

    if (mode === "register") {
      nameInputRef.current?.focus();
      return;
    }

    emailInputRef.current?.focus();
    emailInputRef.current?.select();
  }, [open, mode, error?.suggestedMode]);

  if (!open) return null;

  const stopEvent = (event) => {
    event.stopPropagation();
  };

  const stopPointerEvent = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const updateField = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const fieldError = (fieldName) => {
    return error?.field === fieldName ? error?.message : "";
  };

  const globalError = error?.field ? "" : error?.message || "";

  return (
    <div
      className="wishlist-auth-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wishlist-auth-title"
      onClick={stopEvent}
      onPointerDown={stopEvent}
      onKeyDown={stopEvent}
    >
      <button type="button" className="wishlist-auth-backdrop" onClick={onClose} aria-label="Close wishlist login" />
      <div
        ref={panelRef}
        className="wishlist-auth-panel"
        onScroll={(event) => {
          scrollTopRef.current = event.currentTarget.scrollTop;
        }}
        onClick={stopEvent}
        onPointerDown={stopEvent}
        onMouseDown={stopEvent}
      >
        <button type="button" className="wishlist-auth-close" onClick={onClose} aria-label="Close wishlist login">
          ✕
        </button>
        <p className="wishlist-auth-kicker">Wishlist Access</p>
        <h2 id="wishlist-auth-title">{mode === "register" ? "Create your account to save wishlist items" : "Sign in to open your wishlist"}</h2>
        <p className="wishlist-auth-copy">The modal appears only when you click wishlist. Your website stays open normally until then.</p>

        <div className="wishlist-auth-tabs" role="tablist" aria-label="Wishlist account access mode">
          <button
            type="button"
            className={`wishlist-auth-tab ${mode === "login" ? "active" : ""}`}
            onClick={() => onModeChange("login")}
            aria-pressed={mode === "login"}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`wishlist-auth-tab ${mode === "register" ? "active" : ""}`}
            onClick={() => onModeChange("register")}
            aria-pressed={mode === "register"}
          >
            Create Account
          </button>
        </div>

        <form
          className="wishlist-auth-form"
          onSubmit={(event) => { event.preventDefault(); onSubmit(event, formState); }}
          onClick={stopEvent}
          onPointerDown={stopEvent}
        >
          {mode === "register" && (
            <label>
              <span>Name</span>
              <input
                ref={nameInputRef}
                type="text"
                value={formState.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Your name"
                autoComplete="name"
                required
              />
              {fieldError("name") && <p className="wishlist-auth-field-error">{fieldError("name")}</p>}
            </label>
          )}

          <label>
            <span>Email</span>
            <input
              ref={emailInputRef}
              type="email"
              value={formState.email}
              onChange={(event) => updateField("email", event.target.value)}
              onPointerDown={stopEvent}
              onMouseDown={stopEvent}
              onKeyDown={stopEvent}
              placeholder="name@example.com"
              autoComplete="email"
              required
            />
            {fieldError("email") && <p className="wishlist-auth-field-error">{fieldError("email")}</p>}
          </label>

          {mode === "register" && (
            <label>
              <span>Phone</span>
              <input
                type="tel"
                value={formState.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                onPointerDown={stopEvent}
                onMouseDown={stopEvent}
                onKeyDown={stopEvent}
                placeholder="Optional phone number"
                autoComplete="tel"
              />
              {fieldError("phone") && <p className="wishlist-auth-field-error">{fieldError("phone")}</p>}
            </label>
          )}

          <label>
            <span>Password</span>
            <input
              ref={passwordInputRef}
              type="password"
              value={formState.password}
              onChange={(event) => updateField("password", event.target.value)}
              onPointerDown={stopEvent}
              onMouseDown={stopEvent}
              onKeyDown={stopEvent}
              placeholder={mode === "register" ? "Create a password" : "Enter your password"}
              autoComplete={mode === "register" ? "new-password" : "current-password"}
              required
            />
            {fieldError("password") && <p className="wishlist-auth-field-error">{fieldError("password")}</p>}
          </label>

          {mode === "register" && (
            <label>
              <span>Confirm Password</span>
              <input
                type="password"
                value={formState.confirmPassword}
                onChange={(event) => updateField("confirmPassword", event.target.value)}
                onPointerDown={stopEvent}
                onMouseDown={stopEvent}
                onKeyDown={stopEvent}
                placeholder="Confirm your password"
                autoComplete="new-password"
                required
              />
              {fieldError("confirmPassword") && <p className="wishlist-auth-field-error">{fieldError("confirmPassword")}</p>}
            </label>
          )}

          {globalError && <p className="wishlist-auth-error">{globalError}</p>}

          {error?.suggestedMode && error.suggestedMode !== mode && (
            <button
              type="button"
              className="wishlist-auth-helper-btn"
              onClick={() => onModeChange(error.suggestedMode)}
            >
              Switch to {error.suggestedMode === "login" ? "Sign In" : "Create Account"}
            </button>
          )}

          <button
            type="submit"
            className="wishlist-auth-submit"
            disabled={loading}
            onPointerDown={stopPointerEvent}
          >
            {loading ? "Please wait..." : mode === "register" ? "Create Account" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

