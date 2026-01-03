import type { Metadata } from "next";
import "./globals.css";
import { VisualEditsMessenger } from "orchids-visual-edits";
import ErrorReporter from "@/components/ErrorReporter";
import { WebVitals } from "@/components/WebVitals";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Kunal Portfolio | Full-Stack Developer & AI Engineer",
  description: "Crafting immersive digital experiences through Full-Stack Development & Generative AI. Explore my work and projects.",
  keywords: ["Full-Stack Developer", "AI Engineer", "Next.js", "React", "Portfolio"],
  authors: [{ name: "Kunal" }],
  openGraph: {
    title: "Kunal's Portfolio",
    description: "Full-Stack Developer & AI Engineer",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="smooth-scroll">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          rel="preload" 
          as="style" 
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&display=swap" 
        />
        <link 
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&display=swap" 
          rel="stylesheet"
        />
        <noscript>
          <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&display=swap" rel="stylesheet" />
        </noscript>
      </head>
      <body className="antialiased optimize-text">
        <WebVitals />
        <Script
          id="orchids-browser-logs"
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts/orchids-browser-logs.js"
          strategy="afterInteractive"
          data-orchids-project-id="cc215bd3-a932-4698-a03e-94013d9a1730"
        />
        <ErrorReporter />
        <Script
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
          strategy="afterInteractive"
          data-target-origin="*"
          data-message-type="ROUTE_CHANGE"
          data-include-search-params="true"
          data-only-in-iframe="true"
          data-debug="true"
          data-custom-data='{"appName": "YourApp", "version": "1.0.0", "greeting": "hi"}'
        />
        {children}
        <VisualEditsMessenger />
      </body>
    </html>
  );
}