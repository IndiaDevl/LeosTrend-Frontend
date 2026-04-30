import React from "react";
import "./Loader.css";

function Loader() {
  return (
    <div className="lux-loader">
      <div className="lux-loader-inner">
        <p className="lux-kicker">The Drop</p>
        <h1 className="lux-logo">LEOS TREND</h1>
        <div className="lux-progress">
          <div className="lux-progress-fill"></div>
        </div>
      </div>
    </div>
  );
}

export default Loader;