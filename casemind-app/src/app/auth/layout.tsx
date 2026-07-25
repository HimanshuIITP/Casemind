import { ReactNode } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authenticate — CaseMind",
  description: "Secure access to your CaseMind workspace.",
};

export default function RootAuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans">
      {children}
    </div>
  );
}
