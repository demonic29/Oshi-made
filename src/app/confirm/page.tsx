import { Suspense } from "react";
import ConfirmContent from "./ConfirmContent";

function LoadingFallback() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-pulse">
                <p>確認中。。。</p>
            </div>
        </div>
    );
}

export default function ConfirmPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <ConfirmContent />
        </Suspense>
    );
}