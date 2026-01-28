'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp";
import { createClient } from "@supabase/supabase-js";
import { useRouter, useSearchParams } from "next/navigation";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ConfirmPage() {
    const [step, setStep] = useState<"phone" | "otp">("phone");
    const [phone, setPhone] = useState("");
    const [price, setPrice] = useState(""); // 💰 New price state
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const searchParams = useSearchParams();
    const roomId = searchParams.get("roomId");

    const sendOtp = async () => {
        if (!price || isNaN(Number(price))) {
            setError("有効な金額を入力してください");
            return;
        }
        setLoading(true);
        setError(null);
        const { error } = await supabase.auth.signInWithOtp({ phone });
        setLoading(false);
        if (error) { setError(error.message); return; }
        setStep("otp");
    };

    const verifyOtp = async () => {
        setLoading(true);
        setError(null);

        const { data, error: otpErr } = await supabase.auth.verifyOtp({
            phone,
            token: otp,
            type: "sms",
        });

        if (otpErr || !data.user) {
            setLoading(false);
            setError("コードが正しくありません");
            return;
        }

        try {
            const res = await fetch("/api/auth/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    phone: phone,
                    roomId: roomId,
                    price: Number(price), // 💰 Send price to API
                }),
            });

            if (!res.ok) throw new Error("オーダー作成に失敗しました");
            router.push('/cart');
        } catch (err) {
            setError("エラーが発生しました");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center text-center justify-center h-screen gap-6">
            <h2 className="text-2xl font-bold">注文内容の確認</h2>

            {step === "phone" && (
                <div className="w-full max-w-xs space-y-4">
                    <div className="text-left">
                        <label className="text-sm font-medium text-gray-700">合計金額 (¥)</label>
                        <Input
                            type="number"
                            placeholder="5000"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="mt-1 text-lg font-semibold"
                        />
                    </div>
                    <div className="text-left">
                        <label className="text-sm font-medium text-gray-700">電話番号</label>
                        <Input
                            placeholder="+819012345678"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="mt-1"
                        />
                    </div>
                </div>
            )}

            {step === "otp" && (
                <div className="space-y-4 w-full overflow-hidden px-4">
                    <p className="text-sm text-gray-600">SMSで送られた6桁のコードを入力</p>
                    <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                        <InputOTPGroup><InputOTPSlot className="size-6" index={0} /></InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup><InputOTPSlot className="size-6" index={1} /></InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup><InputOTPSlot className="size-6" index={2} /></InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup><InputOTPSlot className="size-6" index={3} /></InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup><InputOTPSlot className="size-6" index={4} /></InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup><InputOTPSlot className="size-6" index={5} /></InputOTPGroup>
                    </InputOTP>
                </div>
            )}

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button
                className="bg-main text-white w-full max-w-xs py-6 text-lg rounded-xl"
                onClick={step === "phone" ? sendOtp : verifyOtp}
                disabled={loading || (step === "otp" && otp.length !== 6)}
            >
                {loading ? "処理中..." : step === "phone" ? "本人確認へ進む" : "注文を確定する"}
            </Button>

            <Button
                className="border-gray-500 border text-text w-full max-w-xs py-6 text-lg rounded-xl"
                onClick={() => router.back()}                
            >
                キャンセル
            </Button>
        </div>
    );
}