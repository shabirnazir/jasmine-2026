import React from "react";
import css from "./Footer.module.css";

export const Footer = () => {
  return (
    <footer className={css.root}>
      <div className={css.inner}>
        <div className={css.brand}>Jasmine Enterprises</div>
        <div>Store Management System</div>
      </div>
    </footer>
  );
};
