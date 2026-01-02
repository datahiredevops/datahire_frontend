import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google"; 
import ClientLayout from "@/components/ClientLayout"; // <--- Import the wrapper

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
        <GoogleOAuthProvider clientId="457354649320-kfau3m6rmtr4lh365a05hahd7jqop6qd.apps.googleusercontent.com"> 
            <AuthProvider>
              {/* Use the ClientLayout to handle Sidebar & Spacing */}
              <ClientLayout>
                {children}
              </ClientLayout>
            </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}