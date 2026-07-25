import { InputHTMLAttributes, forwardRef, ReactNode } from "react";

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: ReactNode;
}

const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, icon, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col space-y-1.5 w-full">
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[15px] text-gray-900 placeholder-gray-400 transition-all duration-200 outline-none focus:border-[#C9971A] focus:ring-1 focus:ring-[#C9971A] ${
              icon ? "pl-10" : ""
            } ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""} ${className}`}
            {...props}
          />
        </div>
        {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
      </div>
    );
  }
);

AuthInput.displayName = "AuthInput";
export default AuthInput;
