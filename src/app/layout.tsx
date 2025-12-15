import type { Metadata } from "next";
import "@/app/globals.css";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import GlobalError from "./global-error";
import Providers from "./providers";
import BottomTabs from "@/components/ui/BottomTabs";

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
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css"
        />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" />
      </head>
      <body className="antialiased max-w-[390px] bg-[#FFFDFA]">
        <ErrorBoundary errorComponent={GlobalError}>
          <Providers>
            {children}
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
