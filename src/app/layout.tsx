import type { Metadata } from "next";
import "./globals.css";
import BottomTabs from "@/components/ui/BottomTabs";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import GlobalError from "./global-error";

export const metadata: Metadata = {
  title: "Oshimade",
  description: "A platform to share your favorite things",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className=" antialiased max-w-[390px] mx-auto">
        <ErrorBoundary errorComponent={GlobalError}>
            {children}
            <BottomTabs />
          </ErrorBoundary>
        </body>
    </html>
  );
}



