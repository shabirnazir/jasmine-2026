import { authOptions } from "@/lib/authOptions";
import AddDistributor from "@/components/Distributor/AddDistributor";
import Delete from "@/components/Distributor/Delete";
import Payment from "@/components/Distributor/Payment";
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
        <Delete />
      </div>
    </>
  );
}
