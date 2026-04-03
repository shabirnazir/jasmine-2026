import { withAuth } from "next-auth/middleware";

export default function proxy(req) {
  return withAuth(req);
}

export const config = { matcher: ["/dashboard"] };
