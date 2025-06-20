import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs'
import { TRPCProvider } from '@/trpc/client'
import { Toaster } from "@/components/ui/sonner";
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ZDAR",
  description: "Job Portal",
};
// Add ThemeProvider
import { ThemeProvider } from "next-themes";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={inter.className}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
          <TRPCProvider>
            {children}
            <Toaster />
          </TRPCProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
