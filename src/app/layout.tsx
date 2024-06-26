import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { ThemeProvider } from "@/providers/theme-provider";
import ModalProvider from "@/providers/modal-provider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster} from "@/components/ui/sonner";

const font = DM_Sans({ subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: "JPlura",
  description: "All in you Agency Solution",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    //remove the ClerkProvider to main folder and site folder
    <html lang="en" suppressHydrationWarning>
      <body className={font.className}>
        {/*from ShadCN UI -> dark mode -> step 3*/}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ModalProvider>
            {children}
            <Toaster />
            <SonnerToaster position="bottom-right" />
          </ModalProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
