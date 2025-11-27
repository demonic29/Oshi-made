import type { Metadata } from "next";
import '@/app/globals.css'
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import GlobalError from "./global-error";
import Providers from "./providers";

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
      <body className="antialiased max-w-[390px]">
        <ErrorBoundary errorComponent={GlobalError}>
          <Providers>
            {children}
            {/* <BottomTabs /> */}
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}



