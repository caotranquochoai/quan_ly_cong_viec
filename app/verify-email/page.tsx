"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    if (token) {
      const verifyEmail = async () => {
        try {
          const response = await fetch("/api/auth/verify-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          });

          if (response.ok) {
            setStatus("success");
            setMessage("Your email has been successfully verified!");
          } else {
            const data = await response.json();
            setStatus("error");
            setMessage(data.error || "Failed to verify email.");
          }
        } catch (error) {
          setStatus("error");
          setMessage("An unexpected error occurred.");
        }
      };
      verifyEmail();
    } else {
      setStatus("error");
      setMessage("No verification token found.");
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Email Verification</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          {status === "verifying" && (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          )}
          {status === "success" && <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />}
          {status === "error" && <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />}
          <p>{message}</p>
        </CardContent>
      </Card>
    </div>
  );
}