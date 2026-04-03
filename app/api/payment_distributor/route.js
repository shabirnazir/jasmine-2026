import { connectMongoDB } from "@/lib/mongodb";
import Cement from "@/models/cement";
import { NextResponse } from "next/server";
export async function POST(req) {
  try {
    const { type, distributor, amount, date, detail } = await req.json();
    await connectMongoDB();
    const lastEnter = await Cement.findOne({
      distributor,
    }).sort({ createdAt: -1 });

    const lastEnterBalance = lastEnter ? lastEnter.balance : 0;
    const balance = lastEnterBalance - Number(amount);
    const month = new Date(date).getMonth();
    const year = new Date(date).getFullYear();
    await Cement.create({
      distributor,
      type,
      date,
      balance,
      month,
      paid: amount,
      year,
      detail,
    });
    return NextResponse.json(
      { message: "Payment Successfull" },
      { status: 201 }
    );
  } catch (error) {
    console.log("Error fetching cement:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching the cement." },
      { status: 500 }
    );
  }
}
