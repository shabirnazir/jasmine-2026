import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/authOptions";

export const requireAuthenticatedSession = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return {
      session: null,
      response: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
    };
  }

  return { session, response: null };
};

export const requireAdminSession = async () => {
  const { session, response } = await requireAuthenticatedSession();

  if (response) {
    return { session: null, response };
  }

  if (session?.user?.role !== "admin") {
    return {
      session,
      response: NextResponse.json({ message: "Forbidden" }, { status: 403 }),
    };
  }

  return { session, response: null };
};
