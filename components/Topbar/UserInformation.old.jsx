"use client";
import React from "react";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { IoMdLogOut } from "react-icons/io";
import css from "./Topbar.module.css";
const UserInformation = () => {
  const { data: session } = useSession();
  const { name, email } = session?.user || {};
  return name ? (
    <div className={css.userContainer}>
      <div className={css.user}>{name}</div>
      <button onClick={() => signOut()} className={css.logout}>
        <IoMdLogOut className={css.icon} /> <span> Log Out</span>
      </button>
    </div>
  ) : null;
};

export default UserInformation;
