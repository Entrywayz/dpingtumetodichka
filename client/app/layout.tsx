import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Footer from '@/components/footer'
import Header from "@/components/header";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"], 
  display: "swap",
});

export const metadata: Metadata = {
  title: "Магазин телевизоров",
  description: "  ",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-black flex flex-col">
        <AuthProvider>
          <Header />
          <main className="content">
            {children}
          </main>
        <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
