"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

const IMAGES = {
  login: "/images/Auth-Background.jpg",
  register: "/images/Auth-Background-2.jpg",
};

export function AuthVisualPanel() {
  const pathname = usePathname();
  const isRegister = pathname === "/register";

  return (
    <div className="relative hidden w-[60%] shrink-0 overflow-hidden rounded-3xl lg:block">
      {/* Login image */}
      <Image
        src={IMAGES.login}
        alt="Login background"
        fill
        className="object-cover transition-opacity duration-700 ease-in-out"
          sizes="60vw"
        style={{ opacity: isRegister ? 0 : 1 }}
        priority
      />
      {/* Register image */}
      <Image
        src={IMAGES.register}
        alt="Register background"
        fill
        className="object-cover transition-opacity duration-700 ease-in-out"
          sizes="60vw"
        style={{ opacity: isRegister ? 1 : 0 }}
        priority
      />
    </div>
  );
}
