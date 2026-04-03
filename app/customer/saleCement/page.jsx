import { authOptions } from "@/lib/authOptions";
import SaleCement from "@/components/SaleCement/SaleCement";
import Topbar from "@/components/Topbar/Topbar";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import React from "react";

export default async function page() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");
  return (
    <>
      <Topbar />
      <div className="m-5">
        <SaleCement />
      </div>
    </>
  );
}
