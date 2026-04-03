"use client";
import React from "react";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { IoMdLogOut } from "react-icons/io";

const UserInformation = () => {
  const { data: session } = useSession();
  const { name, email } = session?.user || {};
  return name ? (
    <div className="flex items-center gap-4">
      <div className="hidden sm:block text-right">
        <p className="text-sm font-semibold text-gray-900">{name}</p>
        <p className="text-xs text-gray-500">{email}</p>
      </div>
      <button
        onClick={() => signOut()}
        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium"
      >
        <IoMdLogOut size={18} />
        <span className="hidden sm:inline">Log Out</span>
      </button>
    </div>
  ) : null;
};

export default UserInformation;
