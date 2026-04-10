import { connectMongoDB } from "@/lib/mongodb";
import Cement from "@/models/cement";
import Stock from "@/models/cementStock";
import { NextResponse } from "next/server";
import {
  requireAdminSession,
  requireAuthenticatedSession,
} from "@/lib/accessControl";

export async function GET(req) {
  try {
    const { response } = await requireAuthenticatedSession();
    if (response) return response;

    const { searchParams } = new URL(req.url);
    const distributor = searchParams.get("id");
    // const year = searchParams?.get("year");
    const years = searchParams?.get("year");
    const year = JSON.parse(years)?.map((year) => year.value);
    await connectMongoDB();
    const cement = await Cement.find({ distributor, year });
    return NextResponse.json({ data: cement });
  } catch (error) {
    console.log("Error fetching cement:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching the cement." },
      { status: 500 },
    );
  }
}
export async function POST(req) {
  try {
    const { response } = await requireAdminSession();
    if (response) return response;

    const { type, distributor, price, chalan, date } = await req.json();
    await connectMongoDB();
    const lastEnter = await Cement.findOne({ distributor }).sort({
      createdAt: -1,
    });
    const stockOfType = await Stock.findOne({ type });
    if (stockOfType) {
      stockOfType.quantity = stockOfType.quantity + 180;
      await stockOfType.save();
    } else {
      await Stock.create({
        type,
        quantity: 180,
      });
    }
    const lastEnterBalance = lastEnter ? lastEnter.balance : 0;

    const balance = lastEnterBalance + Number(price);
    const month = new Date(date).getMonth();
    const year = new Date(date).getFullYear();
    await Cement.create({
      type,
      distributor,
      price,
      // fair,
      chalan,
      // truckNumber,
      date,
      balance,
      month,
      year,
    });

    return NextResponse.json(
      { message: "Data added Successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.log("Error adding cement:", error);
    return NextResponse.json(
      { message: "An error occurred while adding the cement." },
      { status: 500 },
    );
  }
}
