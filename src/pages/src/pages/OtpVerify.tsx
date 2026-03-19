import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function OtpVerify() {
  const { verifyOTP } = useAuth();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const handleVerify = async () => {
    try {
      await verifyOTP(email, otp, "signup");
      alert("✅ OTP Verified");
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Enter OTP</h2>

      <input
        placeholder="Enter Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <br /><br />

      <input
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />

      <br /><br />

      <button onClick={handleVerify}>Verify OTP</button>
    </div>
  );
}
