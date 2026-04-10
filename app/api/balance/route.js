import { connectMongoDB } from "@/lib/mongodb";
import Record from "@/models/record";
import Cement from "@/models/cement";
import { NextResponse } from "next/server";
import { requireAuthenticatedSession } from "@/lib/accessControl";

export async function GET(req) {
  try {
    const { response } = await requireAuthenticatedSession();
    if (response) return response;

    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");

    if (!customerId) {
      return NextResponse.json(
        { message: "Customer ID is required" },
        { status: 400 },
      );
    }

    await connectMongoDB();

    // First try to find in Record model (for customers)
    let lastRecord = await Record.findOne({ customer: customerId }).sort({
      createdAt: -1,
    });

    // If not found in Record, try Cement model (for distributors)
    if (!lastRecord) {
      lastRecord = await Cement.findOne({ distributor: customerId }).sort({
        createdAt: -1,
      });
    }

    const balance = lastRecord ? lastRecord.balance : 0;

    return NextResponse.json({
      balance,
      customerId,
    });
  } catch (error) {
    console.log("Error fetching balance:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching the balance." },
      { status: 500 },
    );
  }
}
