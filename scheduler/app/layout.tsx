import type { Metadata } from "next";
import "./globals.css";
import BottomBar from "./components/BottomBar";

export const metadata: Metadata = {
  title: "Combinador de horarios ITBA 2024",
  description: "Combinador de horarios por CEITBA 2024",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <main>
          {children}
        </main>
        <BottomBar />
      </body>
    </html>
  );
}
