"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset?: () => void;
}) {
  return (
    <div>
      <h2>何が間違ったみたいね！</h2>
      <Link href="/">ホームに戻ってや</Link>
    </div>
  );
}
