"use client";
import React from "react";
import css from "./Topbar.module.css";
import Link from "next/link";
import UserInformation from "./UserInformation";
import { SessionProvider } from "next-auth/react";
import { FaHome } from "react-icons/fa";
import { IoIosContact } from "react-icons/io";
import { BiSolidPurchaseTag } from "react-icons/bi";
import { FcSalesPerformance } from "react-icons/fc";
import Popup from "reactjs-popup";
import { Button, Container, Nav, NavDropdown, Navbar } from "react-bootstrap";
const Topbar = (props) => {
  return (
    <SessionProvider session={props.session}>
      <Navbar expand="lg" className="bg-body-tertiary">
        <Container>
          <Navbar.Brand href="#home">
            {" "}
            <div className={css.title}>Jasmine Enterprises</div>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Link href="/" className={css.link}>
                <FaHome className={css.icon} /> <span>Home</span>
              </Link>

              <Popup
                trigger={
                  <div key="Distributor" className={css.link}>
                    <IoIosContact className={css.icon} />{" "}
                    <span>Distributor</span>
                  </div>
                }
                position="bottom"
                on="click"
                closeOnDocumentClick
                mouseLeaveDelay={300}
                mouseEnterDelay={0}
                contentStyle={{
                  padding: "5px",
                  border: "1px solid #ccc",
                  width: "180px",
                  borderRadius: "0px",
                  backgroundColor: "#fff",
                }}
                arrow={true}
              >
                <div className="menu">
                  <Link href="/distributor/add" className={css.option}>
                    Add Distributor
                  </Link>
                  <Link
                    href="/distributor/viewdistributor"
                    className={css.option}
                  >
                    View Journal
                  </Link>
                  <Link href="/distributor/payment" className={css.option}>
                    Payment
                  </Link>
                  <Link href="/distributor/delete" className={css.option}>
                    Delete Distributor
                  </Link>
                </div>
              </Popup>
              <Popup
                trigger={
                  <div key="customer" className={css.link}>
                    <IoIosContact className={css.icon} /> <span>Customer</span>
                  </div>
                }
                position="bottom"
                on="click"
                closeOnDocumentClick
                mouseLeaveDelay={300}
                mouseEnterDelay={0}
                contentStyle={{
                  padding: "5px",
                  border: "1px solid #ccc",
                  width: "180px",
                  borderRadius: "0px",
                  backgroundColor: "#fff",
                }}
                arrow={true}
              >
                <div className="menu">
                  <Link href="/customer/add" className={css.option}>
                    Add Customer
                  </Link>
                  <Link href="/customer/viewCustomer" className={css.option}>
                    View Journal
                  </Link>
                  <Link href="/customer/payment" className={css.option}>
                    Payment
                  </Link>
                  <Link href="/customer/delete" className={css.option}>
                    Delete Customer
                  </Link>
                </div>
              </Popup>

              <Popup
                trigger={
                  <div key="purchase" className={css.link}>
                    <BiSolidPurchaseTag className={css.icon} />{" "}
                    <span>Purchase</span>
                  </div>
                }
                position="bottom"
                on="click"
                closeOnDocumentClick
                mouseLeaveDelay={300}
                mouseEnterDelay={0}
                contentStyle={{
                  padding: "5px",
                  border: "1px solid #ccc",
                  width: "180px",
                  borderRadius: "0px",
                  backgroundColor: "#fff",
                }}
                arrow={true}
              >
                <div className="menu">
                  <Link href="/purchase" className={css.option}>
                    Purchase
                  </Link>
                </div>
              </Popup>
              <Popup
                trigger={
                  <div key="sale" className={css.link}>
                    <FcSalesPerformance className={css.icon} />{" "}
                    <span>Sale</span>
                  </div>
                }
                position="bottom"
                on="click"
                closeOnDocumentClick
                mouseLeaveDelay={300}
                mouseEnterDelay={0}
                contentStyle={{
                  padding: "5px",
                  border: "1px solid #ccc",
                  width: "180px",
                  borderRadius: "0px",
                  backgroundColor: "#fff",
                }}
                arrow={true}
              >
                <div className="menu">
                  <Link href="/customer/saleCement" className={css.option}>
                    Cement
                  </Link>
                </div>
              </Popup>
            </Nav>
            <UserInformation />
          </Navbar.Collapse>
        </Container>
      </Navbar>
      {/* <div className={css.container}>
        <div className={css.subContainer}>
          <div className={css.title}>Jasmine Enterprises</div>
          <Link href="/" className={css.link}>
            <FaHome className={css.icon} /> <span>Home</span>
          </Link>
          <Popup
            trigger={
              <div key="Distributor" className={css.link}>
                <IoIosContact className={css.icon} /> <span>Distributor</span>
              </div>
            }
            position="bottom"
            on="click"
            closeOnDocumentClick
            mouseLeaveDelay={300}
            mouseEnterDelay={0}
            contentStyle={{
              padding: "5px",
              border: "1px solid #ccc",
              width: "180px",
              borderRadius: "0px",
              backgroundColor: "#fff",
            }}
            arrow={true}
          >
            <div className="menu">
              <Link href="/distributor/add" className={css.option}>
                Add Distributor
              </Link>
              <Link href="/distributor/viewdistributor" className={css.option}>
                View Journal
              </Link>
              <Link href="/distributor/payment" className={css.option}>
                Payment
              </Link>
              <Link href="/distributor/delete" className={css.option}>
                Delete Distributor
              </Link>
            </div>
          </Popup>
          <Popup
            trigger={
              <div key="customer" className={css.link}>
                <IoIosContact className={css.icon} /> <span>Customer</span>
              </div>
            }
            position="bottom"
            on="click"
            closeOnDocumentClick
            mouseLeaveDelay={300}
            mouseEnterDelay={0}
            contentStyle={{
              padding: "5px",
              border: "1px solid #ccc",
              width: "180px",
              borderRadius: "0px",
              backgroundColor: "#fff",
            }}
            arrow={true}
          >
            <div className="menu">
              <Link href="/customer/add" className={css.option}>
                Add Customer
              </Link>
              <Link href="/customer/viewCustomer" className={css.option}>
                View Journal
              </Link>
              <Link href="/customer/payment" className={css.option}>
                Payment
              </Link>
              <Link href="/customer/delete" className={css.option}>
                Delete Customer
              </Link>
            </div>
          </Popup>

          <Popup
            trigger={
              <div key="purchase" className={css.link}>
                <BiSolidPurchaseTag className={css.icon} />{" "}
                <span>Purchase</span>
              </div>
            }
            position="bottom"
            on="click"
            closeOnDocumentClick
            mouseLeaveDelay={300}
            mouseEnterDelay={0}
            contentStyle={{
              padding: "5px",
              border: "1px solid #ccc",
              width: "180px",
              borderRadius: "0px",
              backgroundColor: "#fff",
            }}
            arrow={true}
          >
            <div className="menu">
              <Link href="/purchase" className={css.option}>
                Cement
              </Link>
            </div>
          </Popup>
          <Popup
            trigger={
              <div key="sale" className={css.link}>
                <FcSalesPerformance className={css.icon} /> <span>Sale</span>
              </div>
            }
            position="bottom"
            on="click"
            closeOnDocumentClick
            mouseLeaveDelay={300}
            mouseEnterDelay={0}
            contentStyle={{
              padding: "5px",
              border: "1px solid #ccc",
              width: "180px",
              borderRadius: "0px",
              backgroundColor: "#fff",
            }}
            arrow={true}
          >
            <div className="menu">
              <Link href="/customer/saleCement" className={css.option}>
                Cement
              </Link>
            </div>
          </Popup>
        </div>
        <div>
          <UserInformation />
        </div>
      </div> */}
    </SessionProvider>
  );
};

export default Topbar;
