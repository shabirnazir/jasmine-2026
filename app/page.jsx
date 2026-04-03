import LoginForm from "@/components/LoginForm";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { connectMongoDB } from "@/lib/mongodb";

export default async function Home() {
  const session = await getServerSession(authOptions);
  await connectMongoDB();
  if (session) redirect("/dashboard");
  return (
    <main>
      <LoginForm />
    </main>
  );
}
