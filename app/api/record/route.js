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

export async function PUT(req) {
  try {
    const { response } = await requireAdminSession();
    if (response) return response;

    const { id, customer, type, price, fair, bags, paid, date } =
      await req.json();

    if (!id || !customer) {
      return NextResponse.json(
        { message: "Entry id and customer are required." },
        { status: 400 },
      );
    }

    await connectMongoDB();

    const latestEntry = await Record.findOne({ customer }).sort({
      createdAt: -1,
    });

    if (!latestEntry || String(latestEntry._id) !== String(id)) {
      return NextResponse.json(
        { message: "Only the latest journal entry can be edited." },
        { status: 400 },
      );
    }

    const previousEntry = await Record.findOne({
      customer,
      _id: { $ne: latestEntry._id },
    }).sort({ createdAt: -1 });

    const previousBalance = previousEntry
      ? Number(previousEntry.balance || 0)
      : 0;
    const isPaidEntry = Number(latestEntry.paid || 0) > 0;
    const isReturnEntry = Number(latestEntry.bags || 0) < 0;

    const priceInNumber = Math.abs(Number(price) || 0);
    const fairInNumber = Math.abs(Number(fair) || 0);
    const bagsInNumber = Math.abs(Number(bags) || 0);
    const paidInNumber = Math.abs(Number(paid) || 0);

    let signedBags = 0;
    let signedFair = 0;
    let signedAmount = 0;
    let paidAmount = 0;

    if (isPaidEntry) {
      signedBags = 0;
      signedFair = 0;
      paidAmount = paidInNumber;
      signedAmount = -paidAmount;
    } else {
      signedBags = isReturnEntry ? -bagsInNumber : bagsInNumber;
      signedFair = isReturnEntry ? -fairInNumber : fairInNumber;
      paidAmount = 0;
      signedAmount = priceInNumber * signedBags + signedFair;
    }

    const updatedBalance = previousBalance + signedAmount;

    const updatedDate = new Date(date);
    const monthLabel = updatedDate.toLocaleString("default", {
      month: "long",
    });
    const year = updatedDate.getFullYear();

    const updatedRecord = await Record.findByIdAndUpdate(
      latestEntry._id,
      {
        type: String(type || latestEntry.type || ""),
        price: isPaidEntry ? 0 : priceInNumber,
        fair: signedFair,
        bags: signedBags,
        paid: paidAmount,
        date: updatedDate,
        balance: updatedBalance,
        month: monthLabel,
        year,
      },
      { new: true },
    );

    return NextResponse.json(
      {
        message: "Latest entry updated successfully",
        balance: updatedRecord.balance,
        data: updatedRecord,
      },
      { status: 200 },
    );
  } catch (error) {
    console.log("Error updating Record:", error);
    return NextResponse.json(
      { message: "An error occurred while updating the Record." },
      { status: 500 },
    );
  }
}

export async function DELETE(req) {
  try {
    const { response } = await requireAdminSession();
    if (response) return response;

    const { id, customer } = await req.json();

    if (!id || !customer) {
      return NextResponse.json(
        { message: "Entry id and customer are required." },
        { status: 400 },
      );
    }

    await connectMongoDB();

    const latestEntry = await Record.findOne({ customer }).sort({
      createdAt: -1,
    });

    if (!latestEntry || String(latestEntry._id) !== String(id)) {
      return NextResponse.json(
        { message: "Only the latest journal entry can be deleted." },
        { status: 400 },
      );
    }

    await Record.findByIdAndDelete(latestEntry._id);

    return NextResponse.json(
      { message: "Latest entry deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.log("Error deleting Record:", error);
    return NextResponse.json(
      { message: "An error occurred while deleting the Record." },
      { status: 500 },
    );
  }
}
