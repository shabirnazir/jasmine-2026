import React from "react";
import Link from "next/link";
import css from "./LandingPage.module.css";
import {
  FiUsers,
  FiTruck,
  FiArchive,
  FiDollarSign,
  FiArrowRight,
} from "react-icons/fi";

const LandingPage = () => {
  const sections = [
    {
      title: "Customer",
      description: "Handle onboarding, journal updates, and customer payments.",
      icon: <FiUsers size={22} />,
      links: [
        { label: "Add Customer", href: "/customer/add" },
        { label: "View Journal", href: "/customer/viewCustomer" },
        { label: "Customer Payment", href: "/customer/payment" },
        { label: "Delete Customer", href: "/customer/delete" },
      ],
    },
    {
      title: "Distributor",
      description: "Track distributor records, ledger entries, and payouts.",
      icon: <FiTruck size={22} />,
      links: [
        { label: "Add Distributor", href: "/distributor/add" },
        { label: "View Journal", href: "/distributor/viewdistributor" },
        { label: "Distributor Payment", href: "/distributor/payment" },
        { label: "Delete Distributor", href: "/distributor/delete" },
      ],
    },
    {
      title: "Stock & Sales",
      description: "Update stock movements from purchase to customer sale.",
      icon: <FiArchive size={22} />,
      links: [
        { label: "Add Purchase", href: "/purchase" },
        { label: "Add Sale", href: "/customer/saleCement" },
      ],
    },
  ];

  return (
    <div className={css.root}>
      <div className={css.container}>
        <section className={css.hero}>
          <div>
            <p className={css.kicker}>Store Management</p>
            <h1 className={css.bannerTitle}>Jasmine Operations Dashboard</h1>
            <p className={css.bannerSub}>
              Keep customer records, distributor journals, purchases, and sales
              synchronized from one control center.
            </p>
          </div>
          <div className={css.tipCard}>
            <h2 className={css.tipTitle}>Daily Flow</h2>
            <p className={css.tipText}>
              1. Add purchase entries
              <br />
              2. Record customer sales
              <br />
              3. Post payments to keep balances accurate
            </p>
          </div>
        </section>

        <section className={css.mainContainer}>
          {sections.map((section) => (
            <article key={section.title} className={css.card}>
              <div className={css.cardTop}>
                <div className={css.iconWrap}>{section.icon}</div>
                <h2 className={css.cardTitle}>{section.title}</h2>
              </div>
              <p className={css.cardDescription}>{section.description}</p>
              <div className={css.cardLinks}>
                {section.links.map((item) => (
                  <Link
                    className={css.quickLink}
                    href={item.href}
                    key={item.href}
                  >
                    <span>{item.label}</span>
                    <FiArrowRight size={16} />
                  </Link>
                ))}
              </div>
            </article>
          ))}

          <article className={css.financeCard}>
            <div className={css.cardTop}>
              <div className={css.iconWrap}>
                <FiDollarSign size={22} />
              </div>
              <h2 className={css.cardTitle}>Accounting Focus</h2>
            </div>
            <p className={css.cardDescription}>
              Use payment pages regularly so customer and distributor ledgers
              stay clean and easy to reconcile.
            </p>
            <div className={css.infoRow}>
              <span>Customer Payments</span>
              <Link href="/customer/payment">Open</Link>
            </div>
            <div className={css.infoRow}>
              <span>Distributor Payments</span>
              <Link href="/distributor/payment">Open</Link>
            </div>
          </article>
        </section>

        <div className={css.bottomNote}>
          Keep entries updated daily to avoid month-end reconciliation delays.
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
