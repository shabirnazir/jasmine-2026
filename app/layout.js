import { Footer } from "@/components/Footer/Footer";
import { AuthProvider } from "./Providers";
import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "JASMINE PROV STORE",
  description: "Jasmine prov store",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
        <Footer />
      </body>
    </html>
  );
}
