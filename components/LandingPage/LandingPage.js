import React from "react";
import Link from "next/link";
import css from "./LandingPage.module.css";

const LandingPage = () => {
  return (
    <div className={css.root}>
      <div className={css.container}>
        <div className={css.banner}>
          <h1 className={css.bannerTitle}>Jasmine Enterprises Dashboard</h1>
          <p className={css.bannerSub}>
            Manage customers, distributors, purchases, and payments from one
            place.
          </p>
        </div>

        <div className={css.mainContainer}>
          <section className={css.card}>
            <h2 className={css.cardTitle}>Customer</h2>
            <div className={css.cardLinks}>
              <Link className={css.quickLink} href="/customer/add">
                Add Customer
              </Link>
              <Link className={css.quickLink} href="/customer/viewCustomer">
                View Journal
              </Link>
              <Link className={css.quickLink} href="/customer/payment">
                Customer Payment
              </Link>
              <Link className={css.quickLink} href="/customer/delete">
                Delete Customer
              </Link>
            </div>
          </section>

          <section className={css.card}>
            <h2 className={css.cardTitle}>Distributor</h2>
            <div className={css.cardLinks}>
              <Link className={css.quickLink} href="/distributor/add">
                Add Distributor
              </Link>
              <Link
                className={css.quickLink}
                href="/distributor/viewdistributor"
              >
                View Journal
              </Link>
              <Link className={css.quickLink} href="/distributor/payment">
                Distributor Payment
              </Link>
              <Link className={css.quickLink} href="/distributor/delete">
                Delete Distributor
              </Link>
            </div>
          </section>

          <section className={css.card}>
            <h2 className={css.cardTitle}>Stock & Sales</h2>
            <div className={css.cardLinks}>
              <Link className={css.quickLink} href="/purchase">
                Add Purchase
              </Link>
              <Link className={css.quickLink} href="/customer/saleCement">
                Add Sale
              </Link>
            </div>
          </section>

          <section className={css.distributorContainer}>
            <h2 className={css.cardTitle}>Quick Tip</h2>
            <p>
              Start with purchases, then record sales and payments to keep
              journals accurate.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
