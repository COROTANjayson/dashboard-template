"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/app/store/auth.store";
import { authService } from "@/services/auth.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GoogleAuthButton } from "@/components/google-auth-button";
import { Loader2 } from "lucide-react";
import { AxiosError } from "axios";
import { RegisterResponse } from "@/types/auth";

export function SignupView() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const { mutate: handleRegister, isPending } = useMutation({
    mutationFn: authService.register,
    onSuccess: async (data: RegisterResponse) => {
      try {
        // 1. Set tokens first so subsequent API calls have the Authorization header
        useAuthStore.getState().setTokens({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        });

        // 2. Fetch full user info
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
      setErrorMessage(error.response?.data?.message || "Registration failed. Please try again.");
      console.error("Registration failed:", error);
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    handleRegister(formData);
  };

  return (
    <div className="flex items-center justify-center px-4 mt-24">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
          <CardDescription>Create a new account to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {errorMessage && (
              <p className="text-sm text-destructive text-center">{errorMessage}</p>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign Up"}
            </Button>
          </form>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <GoogleAuthButton mode="signup" />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

