'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
    InputOTPSeparator,
} from "@/components/ui/input-otp";

import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PhoneAuthPage() {
    const [step, setStep] = useState<"phone" | "otp">("phone");
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // 1️⃣ Send SMS
    const sendOtp = async () => {
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithOtp({
            phone,
        });

        setLoading(false);

        if (error) {
            setError(error.message);
            return;
        }

        setStep("otp");
    };

    // 2️⃣ Verify OTP
    const verifyOtp = async () => {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase.auth.verifyOtp({
            phone,
            token: otp,
            type: "sms",
        });

        setLoading(false);

        if (error || !data.user) {
            setError("コードが正しくありません");
            return;
        }

        // ✅ Update user's phone in database
        // The session is checked on the server side
        await fetch("/api/auth/send-otp", {  // Fixed endpoint
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                phone: data.user.phone,  // Only send phone
            }),
        });

        console.log("✅ User phone updated");
        router.push('/cart');
    };

    return (
        <div className="flex flex-col items-center text-center justify-center h-screen gap-8">
            <div>
                <h2 className="text-2xl mb-4 font-semibold">本人確認</h2>

                {step === "phone" ? (
                    <p>電話番号を入力してください</p>
                ) : (
                    <>
                        <p>入力された電話番号に送られた</p>
                        <p>6桁のパスワードを入力してください</p>
                    </>
                )}
            </div>

            {/* PHONE INPUT */}
            {step === "phone" && (
                <Input
                    placeholder="+819012345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="max-w-xs text-center"
                />
            )}

            {/* OTP INPUT */}
            {step === "otp" && (
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                    <InputOTPGroup>
                        <InputOTPSlot index={0} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                        <InputOTPSlot index={1} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                        <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                        <InputOTPSlot index={3} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                        <InputOTPSlot index={4} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                        <InputOTPSlot index={5} />
                    </InputOTPGroup>
                </InputOTP>
            )}

            {error && <p className="text-red-500">{error}</p>}

            {/* BUTTON */}
            {step === "phone" ? (
                <Button
                    className="bg-main text-white px-8"
                    onClick={sendOtp}
                    disabled={!phone || loading}
                >
                    {loading ? "送信中..." : "コード送信"}
                </Button>
            ) : (
                <Button
                    className="bg-main text-white px-8"
                    onClick={verifyOtp}
                    disabled={otp.length !== 6 || loading}
                >
                    {loading ? "確認中..." : "送信"}
                </Button>
            )}
        </div>
    );
}