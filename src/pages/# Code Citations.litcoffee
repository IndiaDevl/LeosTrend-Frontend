# Code Citations

## License: unknown
https://github.com/dquath/kanha-brothers/blob/560f107b760e502aa7e1fa0af766f17b504e51eb/src/ScrollToTop.jsx

```
Here's a summary of what was done:

---

**`ScrollToTop.jsx`** (new file at `src/components/ScrollToTop.jsx`)
```jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;  // renders nothing, just a side-effect
}
```
- `useLocation()` reads the current URL pathname from React Router.
- The `useEffect` fires every time `pathname` changes — i.e., on every navigation.
- Returns `null` because it's a behavior-only component, no UI needed.

---

**Placement in `App.jsx`**

```
<Router>
  <ScrollToTop />    ← placed here, INSIDE Router (needs Router context), OUTSIDE Routes
  <div className="app">
    ...
    <Routes>...</Routes>
  </div>
</Router>
```

It must be **inside `<Router>`** (so `useLocation` works) but **outside `<Routes>`** so it runs on every route change regardless of which route matches. This covers all pages — Home, Collection, Product
```


## License: unknown
https://github.com/uzairk241/netflix-frontend/blob/af3adf0bc7e9f070af7d052891c18b7c0f0d3117/src/components/ScrollToTop.jsx

```
Here's a summary of what was done:

---

**`ScrollToTop.jsx`** (new file at `src/components/ScrollToTop.jsx`)
```jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;  // renders nothing, just a side-effect
}
```
- `useLocation()` reads the current URL pathname from React Router.
- The `useEffect` fires every time `pathname` changes — i.e., on every navigation.
- Returns `null` because it's a behavior-only component, no UI needed.

---

**Placement in `App.jsx`**

```
<Router>
  <ScrollToTop />    ← placed here, INSIDE Router (needs Router context), OUTSIDE Routes
  <div className="app">
    ...
    <Routes>...</Routes>
  </div>
</Router>
```

It must be **inside `<Router>`** (so `useLocation` works) but **outside `<Routes>`** so it runs on every route change regardless of which route matches. This covers all pages — Home, Collection, Product
```

