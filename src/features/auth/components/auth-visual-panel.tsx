"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

const IMAGES = {
  login: "/images/Auth-Background.jpg",
  register: "/images/Auth-Background-2.jpg",
};

export function AuthVisualPanel() {
  const pathname = usePathname();
  const isRegister = pathname === ROUTES.AUTH.REGISTER;

  return (
    <div className="relative hidden w-[60%] shrink-0 overflow-hidden rounded-3xl lg:block">
      {/* Login image */}
      <Image
        src={IMAGES.login}
        alt="Login background"
        fill
        sizes="60vw"
        className={cn(
          "object-cover transition-opacity duration-700 ease-in-out",
          isRegister ? "opacity-0" : "opacity-100"
        )}
        priority
      />
      {/* Register image */}
      <Image
        src={IMAGES.register}
        alt="Register background"
        fill
        sizes="60vw"
        className={cn(
          "object-cover transition-opacity duration-700 ease-in-out",
          isRegister ? "opacity-100" : "opacity-0"
        )}
        priority
      />
    </div>
  );
}
