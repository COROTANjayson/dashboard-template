"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/app/store/auth.store";
import { authService } from "@/services/auth.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { AxiosError } from "axios";
import { LoginResponse } from "@/types/auth";

export function LoginView() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const { mutate: handleLogin, isPending } = useMutation({
    mutationFn: authService.login,
    onSuccess: async (data: LoginResponse) => {
      try {
        // 1. Set tokens first so subsequent API calls (like getMe) have the Authorization header
        useAuthStore.getState().setTokens({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        });

        // 2. Fetch user info
        const user = await authService.getMe();
        
        // 3. Update store with user info
        useAuthStore.getState().setUser(user);
        
        router.push("/dashboard");
      } catch (error) {
        setErrorMessage("Failed to fetch user details.");
        console.error("Fetch user failed:", error);
      }
    },
    onError: (error: AxiosError<{ message: string }>) => {
      setErrorMessage(error.response?.data?.message || "Login failed. Please try again.");
      console.error("Login failed:", error);
    } 
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    handleLogin({ email, password });
  };

  return (
    <div className="flex items-center justify-center px-4 mt-24">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {errorMessage && (
              <p className="text-sm text-destructive text-center">{errorMessage}</p>
            )}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Login"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

