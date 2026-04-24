import Header from "@/components/Header";
import "./globals.css";
// import { Providers } from "./providers";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <AuthProvider>
          {/* <Providers> */}
          <Header />
          <main className="main-content">{children}</main>
          <Toaster position="bottom-right" richColors />
          {/* </Providers> */}
        </AuthProvider>
      </body>
    </html>
  );
}
