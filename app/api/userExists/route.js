import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/user";
import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/accessControl";

export async function POST(req) {
  try {
    const { response } = await requireAdminSession();
    if (response) return response;

    await connectMongoDB();
    const { email } = await req.json();
    const normalizedEmail = String(email || "")
      .trim()
      .toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select("_id");
    return NextResponse.json({ user });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "An error occurred while checking the user." },
      { status: 500 },
    );
  }
}
