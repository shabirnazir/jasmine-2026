import { connectMongoDB } from "@/lib/mongodb";
import Record from "@/models/record";
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
    const customer = searchParams.get("id");
    const years = searchParams.get("year");
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");

    const selectedYears = years
      ? JSON.parse(years)?.map((entry) => String(entry.value))
      : [];

    const query = { customer };

    if (selectedYears?.length) {
      query.year = { $in: selectedYears };
    }

    if (fromDate || toDate) {
      query.date = {};

      if (fromDate) {
        const startDate = new Date(fromDate);
        startDate.setHours(0, 0, 0, 0);
        query.date.$gte = startDate;
      }

      if (toDate) {
        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);
        query.date.$lte = endDate;
      }
    }

    if (query.date && query.date.$gte && query.date.$lte) {
      if (query.date.$gte > query.date.$lte) {
        return NextResponse.json(
          { message: "Invalid date range." },
          { status: 400 },
        );
      }
    }

    await connectMongoDB();

    const totalBags = await Record.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$customer",
          totalBags: { $sum: "$bags" },
        },
      },
    ]);

    const record = await Record.find(query).sort({ date: 1, createdAt: 1 });
    return NextResponse.json({
      data: record,
      bags: totalBags[0]?.totalBags || 0,
    });
  } catch (error) {
    console.log("Error fetching record:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching the record." },
      { status: 500 },
    );
  }
}
export async function POST(req) {
  try {
    const { response } = await requireAdminSession();
    if (response) return response;

    const { type, transactionType, customer, price, fair, bags, amount, date } =
      await req.json();
    await connectMongoDB();
    const lastEnter = await Record.findOne({ customer }).sort({
      createdAt: -1,
    });
    const normalizedTransactionType = ["sale", "return", "discount"].includes(
      transactionType,
    )
      ? transactionType
      : "sale";

    const lastEnterBalance = lastEnter ? lastEnter.balance : 0;
    const monthLabel = new Date(date).toLocaleString("default", {
      month: "long",
    });
    const year = new Date(date).getFullYear();

    if (normalizedTransactionType === "discount") {
      const amountInNumber = Math.abs(Number(amount) || 0);
      const balance = lastEnterBalance - amountInNumber;

      const createdRecord = await Record.create({
        type: "Discount",
        customer,
        price: 0,
        fair: 0,
        bags: 0,
        paid: amountInNumber,
        date,
        balance,
        month: monthLabel,
        year,
      });

      return NextResponse.json(
        {
          message: "Discount added successfully",
          balance: createdRecord.balance,
        },
        { status: 201 },
      );
    }

    const bagsInNumber = Math.abs(Number(bags) || 0);
    const fairInNumber = Math.abs(Number(fair) || 0);
    const priceInNumber = Math.abs(Number(price) || 0);

    const signedBags =
      normalizedTransactionType === "return" ? -bagsInNumber : bagsInNumber;
    const signedFair =
      normalizedTransactionType === "return" ? -fairInNumber : fairInNumber;
    const signedAmount = priceInNumber * signedBags + signedFair;

    const balance = lastEnterBalance + signedAmount;

    const createdRecord = await Record.create({
      type:
        normalizedTransactionType === "return"
          ? `Return ${type}`
          : String(type),
      customer,
      price: priceInNumber,
      fair: signedFair,
      bags: signedBags,
      date,
      balance,
      month: monthLabel,
      year,
    });

    return NextResponse.json(
      {
        message: "Record added successfully",
        balance: createdRecord.balance,
      },
      { status: 201 },
    );
  } catch (error) {
    console.log("Error adding Record:", error);
    return NextResponse.json(
      { message: "An error occurred while adding the Record." },
      { status: 500 },
    );
  }
}
