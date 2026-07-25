"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import AuthInput from "@/components/auth/AuthInput";
import AuthButton from "@/components/auth/AuthButton";
import { Mail, Lock, ShieldCheck, Hash, ShieldAlert, User, Briefcase } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch, setToken } from "@/lib/api";

const benefits = [
  { label: "Secure judicial dashboard" },
  { label: "Evidence management" },
  { label: "AI summarization" },
];

export default function CourtAuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [courtId, setCourtId] = useState("");
  const [officialEmail, setOfficialEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactor, setTwoFactor] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isLogin) {
        const data = await apiFetch("/auth/court/login", {
          method: "POST",
          body: JSON.stringify({
            court_id: courtId,
            official_email: officialEmail,
            password: password,
          }),
        });
        setToken(data.access_token);
        router.push("/dashboard/court");
      } else {
        // Register demo court account
        const data = await apiFetch("/auth/court/register", {
          method: "POST",
          body: JSON.stringify({
            name,
            designation,
            court_id: courtId,
            official_email: officialEmail,
            password: password,
          }),
        });
        setToken(data.access_token);
        router.push("/dashboard/court");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      heading="Court Portal"
      subheading="Restricted access for verified judicial personnel."
      benefits={benefits}
    >
      <AuthCard className="relative overflow-hidden">
        {/* Subtle security pattern background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
        
        <div className="relative z-10 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Government Verified Access
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {isLogin ? "Secure Sign In" : "Create Demo Account"}
          </h2>
          <p className="text-sm text-gray-500">
            {isLogin 
              ? "Authorized personnel only. All access is logged and monitored."
              : "For demonstration purposes only. Court accounts are usually provisioned by IT."}
          </p>
        </div>

        {error && (
          <div className="relative z-10 mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        <motion.div
          key={isLogin ? "login" : "register"}
          initial={{ opacity: 0, x: isLogin ? -10 : 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="relative z-10"
        >
          <form className="space-y-4" onSubmit={handleAuth}>
            {!isLogin && (
              <>
                <AuthInput
                  label="Full Name (e.g. Justice Smith)"
                  type="text"
                  placeholder="Justice D.Y. Chandrachud"
                  icon={<User className="w-5 h-5" />}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <AuthInput
                  label="Designation"
                  type="text"
                  placeholder="Chief Justice"
                  icon={<Briefcase className="w-5 h-5" />}
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  required
                />
              </>
            )}

            <AuthInput
              label="Court ID"
              type="text"
              placeholder="e.g. SC-7890"
              icon={<Hash className="w-5 h-5" />}
              value={courtId}
              onChange={(e) => setCourtId(e.target.value)}
              required
            />
            <AuthInput
              label="Official Email"
              type="email"
              placeholder="name@court.gov.in"
              icon={<Mail className="w-5 h-5" />}
              value={officialEmail}
              onChange={(e) => setOfficialEmail(e.target.value)}
              required
            />
            <AuthInput
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={<Lock className="w-5 h-5" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            
            {isLogin && (
              <AuthInput
                label="2FA Verification Code (Optional)"
                type="text"
                placeholder="000000"
                icon={<ShieldAlert className="w-5 h-5" />}
                value={twoFactor}
                onChange={(e) => setTwoFactor(e.target.value)}
              />
            )}
            
            <div className="pt-4">
              <AuthButton type="submit" isLoading={isLoading}>
                {isLogin ? "Sign In Securely" : "Create Demo Account"}
              </AuthButton>
            </div>
          </form>
        </motion.div>

        <div className="relative z-10 mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
          >
            {isLogin ? "Need a demo account? Create one here." : "Already have an account? Sign In."}
          </button>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
