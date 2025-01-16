import type { Metadata } from "next";
import "./globals.css";
import BottomBar from "./components/BottomBar";
import { ThemeProvider } from "next-themes";

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
    <html lang="en" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen bg-background">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <main>
            {children}
          </main>
          <BottomBar />
        </ThemeProvider>
      </body>
    </html>
  );
}
