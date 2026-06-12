"use client"

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { IconLayoutRows } from "@tabler/icons-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Remove email/password from the URL if they exist
  useEffect(() => {
    if (searchParams?.has("email") || searchParams?.has("password")) {
      const cleanUrl = router.pathname; // keep only the path, drop query
      router.replace(cleanUrl);
    }
  }, [searchParams, router]);

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <IconLayoutRows className="size-4" />
            </div>
            Preevol INTX.
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src="/LS.svg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.8] "
        />
      </div>
    </div>
  )
}
