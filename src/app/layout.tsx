import type { Metadata } from "next";
import { Fredoka, DM_Sans, Roboto_Condensed, Libre_Baskerville, Gowun_Batang, Montserrat, Crimson_Text, Playfair_Display} from "next/font/google"; // Import Fredoka font  
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { ThemeProvider } from "@/providers/theme-provider";
import ModalProvider from "@/providers/modal-provider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

const font = DM_Sans({ subsets: ["latin"], weight: "400" });
const gowunBatang = Gowun_Batang({ subsets: ["latin"], weight: "700" }); // Load only the 700 weight  
const robotoCondensed = Roboto_Condensed({ subsets: ["latin"], weight: ["100", "300", "400", "700", "900"] }); // Load Roboto Condensed font  
const montserrat = Montserrat({ subsets: ["latin"], weight: ["500"] }); 
const crimson_text = Crimson_Text({ subsets: ["latin"], weight: ["700"] }); 


export const metadata: Metadata = {
  title: "JPlura",
  description: "All in one Agency Solution",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    //remove the ClerkProvider to main folder and site folder
    <html lang="en" suppressHydrationWarning>
      <body className={font.className} >
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
