import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { X, Loader2 } from 'lucide-react';

// Utility for class merging
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn("bg-white rounded-md border border-gray-200 p-4", className)}>
    {children}
  </div>
);

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'outline', isLoading?: boolean }> = ({ 
  children, variant = 'primary', className, isLoading, disabled, ...props 
}) => {
  const variants = {
    primary: "bg-white border border-gray-300 text-gray-800 hover:bg-gray-50",
    secondary: "bg-gray-800 text-white hover:bg-gray-900",
    danger: "bg-red-600 text-white hover:bg-red-700",
    outline: "bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50"
  };
  
  return (
    <button 
      className={cn("px-3 py-2 rounded-md font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm", variants[variant], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }> = ({ label, error, className, ...props }) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <input 
      className={cn("w-full px-3 py-2 border rounded-md outline-none transition-all text-sm", error ? "border-red-500" : "border-gray-300", className)}
      {...props}
    />
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string }> = ({ label, error, className, children, ...props }) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <select 
      className={cn("w-full px-3 py-2 border rounded-md outline-none bg-white text-sm", error ? "border-red-500" : "border-gray-300", className)}
      {...props}
    >
      {children}
    </select>
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

export const Badge: React.FC<{ children: React.ReactNode; color?: 'green' | 'red' | 'yellow' | 'gray' }> = ({ children, color = 'gray' }) => {
  const colors = {
    green: "bg-green-50 text-green-800 border border-green-100",
    red: "bg-red-50 text-red-800 border border-red-100",
    yellow: "bg-yellow-50 text-yellow-800 border border-yellow-100",
    gray: "bg-gray-50 text-gray-800 border border-gray-100"
  };
  return <span className={cn("px-2 py-0.5 rounded text-xs font-medium", colors[color])}>{children}</span>;
};

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-md w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-200">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="text-base font-medium">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};