import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      richColors
      position="top-right"
      toastOptions={{
        classNames: {
          toast: "bg-[#1a1a24] border border-white/10 text-white",
          description: "text-gray-400",
        },
      }}
    />
  );
}

