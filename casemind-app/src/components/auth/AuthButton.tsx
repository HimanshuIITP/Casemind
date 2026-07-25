import { ButtonHTMLAttributes, ReactNode } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost";
  isLoading?: boolean;
  icon?: ReactNode;
};

// Intersection of HTMLButton and Motion props
type AuthButtonProps = ButtonProps & Omit<HTMLMotionProps<"button">, keyof ButtonProps>;

export default function AuthButton({
  children,
  variant = "primary",
  isLoading = false,
  icon,
  className = "",
  disabled,
  ...props
}: AuthButtonProps) {
  const baseStyles =
    "relative w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[15px] font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#C9971A] focus-visible:ring-offset-2";

  const variants = {
    primary:
      "bg-[#111111] text-white hover:bg-black border border-transparent shadow-sm",
    outline:
      "bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900",
  };

  return (
    <motion.button
      whileHover={{ y: disabled || isLoading ? 0 : -2 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${
        disabled || isLoading ? "opacity-60 cursor-not-allowed" : ""
      } ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </motion.button>
  );
}
