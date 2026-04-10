import { withAuth } from "next-auth/middleware";

const ADMIN_ONLY_PATHS = [
  "/register",
  "/customer/add",
  "/customer/delete",
  "/customer/payment",
  "/customer/saleCement",
  "/distributor/add",
  "/distributor/delete",
  "/distributor/payment",
  "/purchase",
];

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      if (!token) return false;

      const pathname = req.nextUrl.pathname;
      const isAdminOnlyRoute = ADMIN_ONLY_PATHS.some((path) =>
        pathname.startsWith(path),
      );

      if (isAdminOnlyRoute) {
        return token.role === "admin";
      }

      return true;
    },
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/register/:path*",
    "/customer/:path*",
    "/distributor/:path*",
    "/purchase/:path*",
  ],
};
