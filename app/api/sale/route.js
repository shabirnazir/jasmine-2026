import { connectMongoDB } from "@/lib/mongodb";
import Record from "@/models/record";
import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/accessControl";
export async function POST(req) {
  try {
    const { response } = await requireAdminSession();
    if (response) return response;

    const { type, customer, amount, date } = await req.json();
    await connectMongoDB();
    const lastEnter = await Record.findOne({
      customer,
    }).sort({ createdAt: -1 });

    const lastEnterBalance = lastEnter ? lastEnter.balance : 0;
    const balance = lastEnterBalance - Number(amount);
    const month = new Date(date).toLocaleString("default", {
      month: "long",
    });
    const year = new Date(date).getFullYear();
    const createdRecord = await Record.create({
      customer,
      type,
      date,
      balance,
      month,
      paid: amount,
      year,
    });
    return NextResponse.json(
      { message: "Payment Successfull", balance: createdRecord.balance },
      { status: 201 },
    );
  } catch (error) {
    console.log("Error fetching cement:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching the cement." },
      { status: 500 },
    );
  }
}
