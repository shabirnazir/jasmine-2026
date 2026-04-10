import { connectMongoDB } from "@/lib/mongodb";
import Cement from "@/models/cement";
import Customer from "@/models/customer";
import Record from "@/models/record";
import { NextResponse } from "next/server";
import {
  requireAdminSession,
  requireAuthenticatedSession,
} from "@/lib/accessControl";

export async function DELETE(req) {
  try {
    const { response } = await requireAdminSession();
    if (response) return response;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    await connectMongoDB();
    await Customer.findByIdAndDelete(id);
    await Record.deleteMany({ customer: id });
    return NextResponse.json(
      { message: "Customer deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.log("Error deleting Customer:", error);
    return NextResponse.json(
      { message: "An error occurred while deleting the Customer." },
      { status: 500 },
    );
  }
}
export async function GET(req) {
  try {
    const { response } = await requireAuthenticatedSession();
    if (response) return response;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    await connectMongoDB();
    const customers = await Customer.find();

    const records = customers.map(async (customer) => {
      const lastRecord = await Record.findOne({ customer: customer._id }).sort({
        createdAt: -1,
      });
      return { ...customer?._doc, lastRecord };
    });
    return NextResponse.json({ data: await Promise.all(records) });
    // return NextResponse.json({ data: customers });
  } catch (error) {
    console.log("Error fetching Customer:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching the Customer." },
      { status: 500 },
    );
  }
}
export async function POST(req) {
  try {
    const { response } = await requireAdminSession();
    if (response) return response;

    const { firstName, lastName, mobileNumber, address } = await req.json();
    // await connectMongoDB();
    await Customer.create({
      firstName,
      lastName,
      phone: mobileNumber,
      address,
    });
    return NextResponse.json(
      { message: "Customer added successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.log("Error adding customer:", error);
    return NextResponse.json(
      { message: "An error occurred while adding the customer." },
      { status: 500 },
    );
  }
}

export async function PUT(req) {
  try {
    const { response } = await requireAdminSession();
    if (response) return response;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const { firstName, lastName, mobileNumber, address } = await req.json();
    await connectMongoDB();
    await Customer.findByIdAndUpdate(id, {
      firstName,
      lastName,
      phone: mobileNumber,
      address,
    });
    return NextResponse.json(
      { message: "Customer updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.log("Error updating customer:", error);
    return NextResponse.json(
      { message: "An error occurred while updating the customer." },
      { status: 500 },
    );
  }
}
