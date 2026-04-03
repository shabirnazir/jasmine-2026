"use client";
import React, { useState } from "react";
import Link from "next/link";
import UserInformation from "./UserInformation";
import { SessionProvider } from "next-auth/react";
import { FaHome, FaChevronDown } from "react-icons/fa";
import { IoIosContact } from "react-icons/io";
import { BiSolidPurchaseTag } from "react-icons/bi";
import { GiTakeMyMoney } from "react-icons/gi";

const Topbar = (props) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMobileSection, setOpenMobileSection] = useState(null);

  const toggleMobileSection = (sectionId) => {
    setOpenMobileSection(openMobileSection === sectionId ? null : sectionId);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setOpenMobileSection(null);
  };

  const menuItems = [
    {
      id: "distributor",
      icon: <IoIosContact size={20} />,
      label: "Distributor",
      items: [
        { label: "Add Distributor", href: "/distributor/add" },
        { label: "View Journal", href: "/distributor/viewdistributor" },
        { label: "Payment", href: "/distributor/payment" },
        { label: "Delete Distributor", href: "/distributor/delete" },
      ],
    },
    {
      id: "customer",
      icon: <IoIosContact size={20} />,
      label: "Customer",
      items: [
        { label: "Add Customer", href: "/customer/add" },
        { label: "View Journal", href: "/customer/viewCustomer" },
        { label: "Payment", href: "/customer/payment" },
        { label: "Delete Customer", href: "/customer/delete" },
      ],
    },
    {
      id: "purchase",
      icon: <BiSolidPurchaseTag size={20} />,
      label: "Purchase",
      items: [{ label: "Purchase", href: "/purchase" }],
    },
    {
      id: "sale",
      icon: <GiTakeMyMoney size={20} />,
      label: "Sale",
      items: [{ label: "Cement", href: "/customer/saleCement" }],
    },
  ];

  return (
    <SessionProvider session={props.session}>
      <nav className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <Link href="/" className="flex items-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                Jasmine
              </div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                href="/"
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
              >
                <FaHome size={18} />
                <span className="font-medium">Home</span>
              </Link>

              {menuItems.map((menu) => (
                <div key={menu.id} className="relative group">
                  <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200">
                    {menu.icon}
                    <span className="font-medium">{menu.label}</span>
                    <FaChevronDown
                      size={12}
                      className="group-hover:rotate-180 transition-transform duration-200"
                    />
                  </button>

                  {/* Dropdown */}
                  <div className="absolute left-0 mt-0 w-56 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2 z-50">
                    {menu.items.map((item, idx) => (
                      <Link
                        key={idx}
                        href={item.href}
                        className="block px-4 py-2.5 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors duration-150"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:bg-primary-50 focus:outline-none"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>

            {/* User Info */}
            <UserInformation />
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 py-2">
            <Link
              href="/"
              onClick={closeMobileMenu}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 mx-2"
            >
              <FaHome size={18} />
              <span className="font-medium">Home</span>
            </Link>
            {menuItems.map((menu) => (
              <div key={menu.id}>
                <button
                  onClick={() => toggleMobileSection(menu.id)}
                  className="w-full flex items-center justify-between px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 mx-2"
                >
                  <div className="flex items-center gap-2">
                    {menu.icon}
                    <span className="font-medium">{menu.label}</span>
                  </div>
                  <FaChevronDown
                    size={12}
                    className={`transition-transform duration-200 ${
                      openMobileSection === menu.id ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openMobileSection === menu.id && (
                  <div className="pl-4">
                    {menu.items.map((item, idx) => (
                      <Link
                        key={idx}
                        href={item.href}
                        onClick={closeMobileMenu}
                        className="block px-4 py-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-150"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </nav>
    </SessionProvider>
  );
};

export default Topbar;
