import type { Metadata } from "next";
import { Atkinson_Hyperlegible_Next, Dela_Gothic_One, Geist_Mono, Hanken_Grotesk, Newsreader } from "next/font/google";
import "./globals.css";

const sans = Hanken_Grotesk({ variable: "--font-hanken", subsets: ["latin"] });
const serif = Newsreader({ variable: "--font-newsreader", subsets: ["latin"], style: ["normal", "italic"] });
const logo = Dela_Gothic_One({ variable: "--font-dela", subsets: ["latin"], weight: "400" });
// The script is read out loud from the screen, so it gets a face built for easy reading.
const read = Atkinson_Hyperlegible_Next({ variable: "--font-atkinson", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Retake — hear what a listener would miss",
  description:
    "Practise the exact words you have to say in English. Read your script once, see which words a listener would miss, and retake only those lines.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${serif.variable} ${logo.variable} ${read.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
