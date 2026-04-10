import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/user";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requireAdminSession } from "@/lib/accessControl";

export async function POST(req) {
  try {
    const { response } = await requireAdminSession();
    if (response) return response;

    const { name, email, password } = await req.json();
    const normalizedEmail = String(email || "")
      .trim()
      .toLowerCase();
    if (!normalizedEmail) {
      return NextResponse.json(
        { message: "Email is required." },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await connectMongoDB();
    const existingUser = await User.findOne({ email: normalizedEmail }).select(
      "_id",
    );
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists." },
        { status: 409 },
      );
    }

    await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
    });

    return NextResponse.json({ message: "User registered." }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "An error occurred while registering the user." },
      { status: 500 },
    );
  }
}
