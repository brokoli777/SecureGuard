import DeployButton from "@/components/deploy-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import HeaderAuth from "@/components/header-auth";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";
import NavBar from "@/components/NavBar"; // Import the NavBar component
import "./globals.css";
import Script from "next/script"; 

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "SecureGuard",
  description: "Image Recognition Security System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="min-h-screen flex flex-col items-center">
            {/* Include the NavBar at the top */}
            <NavBar />
            
            {/* Main content */}
            <div className="flex-1 w-full flex flex-col gap-20 items-center max-w-5xl p-5">
              {children}
            </div>

            {/* Footer */}
            <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
              SecureGuard 🛡️
              <ThemeSwitcher />
            </footer>
          </main>
        </ThemeProvider>
      </body>
      <Script src="https://accounts.google.com/gsi/client" async></Script>
    </html>
  );
}
