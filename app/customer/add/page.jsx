import { authOptions } from "@/lib/authOptions";
import AddCustomer from "@/components/Customer/AddCustomer";
import Topbar from "@/components/Topbar/Topbar";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import React from "react";

export default async function page() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");
  // const handleAddCustomer = async (data) => {
  //   const res = await fetch("/api/customer/add", {
  //     method: "POST",
  //     body: JSON.stringify(data),
  //   });
  //   const json = await res.json();
  //   if (!res.ok) throw Error(json.message);
  //   return json;
  // };
  return (
    <>
      <Topbar />
      <div className="m-5">
        <AddCustomer />
      </div>
    </>
  );
}
