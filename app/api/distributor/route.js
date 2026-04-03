import { connectMongoDB } from "@/lib/mongodb";
import Cement from "@/models/cement";
import Distributor from "@/models/distributor";
import { NextResponse } from "next/server";
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    await connectMongoDB();
    await Distributor.findByIdAndDelete(id);
    await Cement.deleteMany({ distributor: id });
    return NextResponse.json(
      { message: "Distributor deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.log("Error deleting Distributor:", error);
    return NextResponse.json(
      { message: "An error occurred while deleting the Distributor." },
      { status: 500 },
    );
  }
}
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    await connectMongoDB();
    //all distributors
    const distributors = await Distributor.find();
    // const distributors = await Distributor.find({
    //   $or: [
    //     { firstName: { $regex: search, $options: "i" } },
    //     { lastName: { $regex: search, $options: "i" } },
    //     { address: { $regex: search, $options: "i" } },
    //   ],
    // });

    return NextResponse.json({ data: distributors });
  } catch (error) {
    console.log("Error fetching Distributor:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching the Distributor." },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  try {
    const { firstName, lastName, mobileNumber, address } = await req.json();
    await connectMongoDB();
    await Distributor.create({
      firstName,
      lastName,
      phone: mobileNumber,
      address,
    });
    return NextResponse.json(
      { message: "Distributor added successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.log("Error adding Distributor:", error);
    return NextResponse.json(
      { message: "An error occurred while adding the Distributor." },
      { status: 500 },
    );
  }
}

export async function PUT(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const { firstName, lastName, mobileNumber, address } = await req.json();
    await connectMongoDB();
    await Distributor.findByIdAndUpdate(id, {
      firstName,
      lastName,
      phone: mobileNumber,
      address,
    });
    return NextResponse.json(
      { message: "Distributor updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.log("Error updating Distributor:", error);
    return NextResponse.json(
      { message: "An error occurred while updating the Distributor." },
      { status: 500 },
    );
  }
}
