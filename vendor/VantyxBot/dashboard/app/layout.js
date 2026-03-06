import "./globals.css";
import { Outfit } from "next/font/google";
import { Toaster } from "sonner";
import { SaveProvider } from "@/context/SaveContext";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata = {
  title: "LR7 COMMUNITY BOT Dashboard",
  description: "Manage your LR7 COMMUNITY BOT server",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${outfit.className} bg-background text-white min-h-screen flex flex-col`}
      >
        <SaveProvider>
          <Toaster richColors theme="dark" position="top-right" offset={90} />
          {children}
        </SaveProvider>
      </body>
    </html>
  );
}
