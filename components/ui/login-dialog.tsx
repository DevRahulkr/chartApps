"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useId } from "react";
import toast from "react-hot-toast";

interface LoginForm {
  emailOrUsername: string;
  password: string;
  rememberMe: boolean;
}

interface LoginDialogProps {
  children?: React.ReactNode;
  onSuccess?: () => void;
}

export function LoginDialog({ children, onSuccess }: LoginDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const id = useId();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      await login(data.emailOrUsername, data.password);
      toast.success("Login successful!");
      setIsOpen(false);
      reset();
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || "Login failed - please check your credentials");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      reset();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || <Button variant="outline">Sign in</Button>}
      </DialogTrigger>
      <DialogContent>
        <div className="flex flex-col items-center gap-2">
          <div
            className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border"
            aria-hidden="true"
          >
            <svg
              className="stroke-zinc-800 dark:stroke-zinc-100"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 32 32"
              aria-hidden="true"
            >
              <circle cx="16" cy="16" r="12" fill="none" strokeWidth="8" />
            </svg>
          </div>
          <DialogHeader>
            <DialogTitle className="sm:text-center">Welcome back</DialogTitle>
            <DialogDescription className="sm:text-center">
              Enter your credentials to login to your account.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`${id}-email`}>Email or Username</Label>
              <Input
                id={`${id}-email`}
                placeholder="hi@yourcompany.com or username"
                type="text"
                {...register("emailOrUsername", {
                  required: "Email or username is required",
                })}
                className={errors.emailOrUsername ? "border-destructive" : ""}
              />
              {errors.emailOrUsername && (
                <p className="text-sm text-destructive">{errors.emailOrUsername.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${id}-password`}>Password</Label>
              <Input
                id={`${id}-password`}
                placeholder="Enter your password"
                type="password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                className={errors.password ? "border-destructive" : ""}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
          </div>
          <div className="flex justify-between gap-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id={`${id}-remember`}
                {...register("rememberMe")}
              />
              <Label htmlFor={`${id}-remember`} className="font-normal text-muted-foreground">
                Remember me
              </Label>
            </div>
            <a className="text-sm underline hover:no-underline" href="#">
              Forgot password?
            </a>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="flex items-center gap-3 before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
          <span className="text-xs text-muted-foreground">Or</span>
        </div>

        <Button variant="outline" className="w-full">
          Login with Google
        </Button>
      </DialogContent>
    </Dialog>
  );
}
