import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google"; // <--- IMPORT THIS

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DataHire V2",
  description: "AI-Powered Hiring Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* REPLACE THIS STRING WITH YOUR REAL GOOGLE CLIENT ID */}
        <GoogleOAuthProvider clientId="457354649320-kfau3m6rmtr4lh365a05hahd7jqop6qd.apps.googleusercontent.com"> 
            <AuthProvider>
              {children}
            </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}