"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import AuthInput from "@/components/auth/AuthInput";
import AuthButton from "@/components/auth/AuthButton";
import { Mail, Lock, BadgeCheck, User, Phone, MapPin } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import AuthTabs from "@/components/auth/AuthTabs";
import { apiFetch, setToken } from "@/lib/api";

const benefits = [
  { label: "AI legal assistant" },
  { label: "Case management" },
  { label: "Smart research" },
];

const tabs = [
  { id: "signin", label: "Sign In" },
  { id: "signup", label: "Apply for Verification" },
];

export default function LawyerAuthPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("signin");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [barCouncilNumber, setBarCouncilNumber] = useState("");
  const [stateBar, setStateBar] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (activeTab === "signin") {
        const data = await apiFetch("/auth/lawyer/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        setToken(data.access_token);
        router.push("/dashboard/lawyer");
      } else {
        const data = await apiFetch("/auth/lawyer/signup", {
          method: "POST",
          body: JSON.stringify({
            full_name: fullName,
            email,
            phone,
            password,
            bar_council_number: barCouncilNumber,
            state_bar: stateBar,
          }),
        });
        setToken(data.access_token);
        router.push("/dashboard/lawyer");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      heading="Lawyer Portal"
      subheading="Access your professional legal workspace."
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
                    label="Official Email"
                    type="email"
                    placeholder="name@lawfirm.com"
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
                      Sign In to Workspace
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
                    placeholder="Adv. John Doe"
                    icon={<User className="w-5 h-5" />}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <AuthInput
                      label="Email"
                      type="email"
                      placeholder="name@lawfirm.com"
                      icon={<Mail className="w-5 h-5" />}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <AuthInput
                      label="Phone"
                      type="tel"
                      placeholder="+91"
                      icon={<Phone className="w-5 h-5" />}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <AuthInput
                      label="Bar Council No."
                      type="text"
                      placeholder="D/123/2020"
                      icon={<BadgeCheck className="w-5 h-5" />}
                      value={barCouncilNumber}
                      onChange={(e) => setBarCouncilNumber(e.target.value)}
                      required
                    />
                    <AuthInput
                      label="State Bar"
                      type="text"
                      placeholder="Delhi"
                      icon={<MapPin className="w-5 h-5" />}
                      value={stateBar}
                      onChange={(e) => setStateBar(e.target.value)}
                      required
                    />
                  </div>
                  <AuthInput
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    icon={<Lock className="w-5 h-5" />}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <div className="pt-2">
                    <AuthButton type="submit" isLoading={isLoading}>
                      Submit Application
                    </AuthButton>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
