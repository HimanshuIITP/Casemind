"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import AuthTabs from "@/components/auth/AuthTabs";
import AuthInput from "@/components/auth/AuthInput";
import AuthButton from "@/components/auth/AuthButton";
import { Mail, Lock, User, Phone } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch, setToken } from "@/lib/api";

const benefits = [
  { label: "Track cases" },
  { label: "File petitions" },
  { label: "Secure documents" },
];

const tabs = [
  { id: "signin", label: "Sign In" },
  { id: "signup", label: "Create Account" },
];

export default function CitizenAuthPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("signin");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (activeTab === "signin") {
        const data = await apiFetch("/auth/citizen/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        setToken(data.access_token);
        router.push("/dashboard/citizen");
      } else {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }
        const data = await apiFetch("/auth/citizen/signup", {
          method: "POST",
          body: JSON.stringify({
            full_name: fullName,
            email,
            phone,
            password,
          }),
        });
        setToken(data.access_token);
        router.push("/dashboard/citizen");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      heading="Citizen Portal"
      subheading="Secure access to your legal workspace."
      benefits={benefits}
    >
      <AuthCard>
        <AuthTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="relative">
          <AnimatePresence mode="wait">
            {activeTab === "signin" ? (
              <motion.div
                key="signin"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.3 }}
              >
                <form className="space-y-4" onSubmit={handleAuth}>
                  <AuthInput
                    label="Email"
                    type="email"
                    placeholder="name@example.com"
                    icon={<Mail className="w-5 h-5" />}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer text-gray-600">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-[#C9971A] focus:ring-[#C9971A]"
                      />
                      Remember me
                    </label>
                    <Link
                      href="#"
                      className="font-medium text-gray-900 hover:text-[#C9971A] transition-colors"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="pt-2">
                    <AuthButton type="submit" isLoading={isLoading}>
                      Continue
                    </AuthButton>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
              >
                <form className="space-y-4" onSubmit={handleAuth}>
                  <AuthInput
                    label="Full Name"
                    type="text"
                    placeholder="John Doe"
                    icon={<User className="w-5 h-5" />}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                  <AuthInput
                    label="Email"
                    type="email"
                    placeholder="name@example.com"
                    icon={<Mail className="w-5 h-5" />}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <AuthInput
                    label="Phone Number"
                    type="tel"
                    placeholder="+91 98765 43210"
                    icon={<Phone className="w-5 h-5" />}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <AuthInput
                      label="Password"
                      type="password"
                      placeholder="••••••••"
                      icon={<Lock className="w-5 h-5" />}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <AuthInput
                      label="Confirm"
                      type="password"
                      placeholder="••••••••"
                      icon={<Lock className="w-5 h-5" />}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="pt-2">
                    <AuthButton type="submit" isLoading={isLoading}>
                      Create Account
                    </AuthButton>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6">
            <AuthButton variant="outline" type="button" disabled={isLoading}>
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </AuthButton>
          </div>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
