"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
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
import Image from "next/image"
import { cn } from "@/lib/utils";

interface LoginForm {
  emailOrUsername: string;
  password: string;
  rememberMe: boolean;
}

interface AuthDialogProps {
  children?: React.ReactNode;
  onSuccess?: () => void;
  triggerText?: string;
  title?: string;
  description?: string;
}

export function AuthDialog({ 
  children, 
  onSuccess, 
  triggerText = "Sign in",
  title = "Self Progress Chart",
  description = "Enter your credentials to login to your account."
}: AuthDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login,user } = useAuth();
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
    if (user?.is_active) {
      router.push("/profile/dashboard");
    } else {
      router.push("/profile"); // fallback for inactive users
    }
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
        {children || (
          <button type="button" className="btn-outline w-full sm:w-auto">
            {triggerText}
          </button>
        )}
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-md rounded-2xl border border-gray-100 bg-white px-6 py-8 sm:px-8"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="flex flex-col items-center gap-2">
          <div
            className="flex shrink-0 items-center justify-center rounded-full border border-border bg-white/40 p-2"
            aria-hidden="true"
          >
            <Image
              src="/return%20to%20the%20source.svg"  
              alt="Return to the Source"
              width={160}
              height={160}
              className="h-14 w-auto sm:h-16"
            />
          </div>
          <DialogHeader>
            <DialogTitle className="sm:text-center">Self Progress Chart</DialogTitle>
            <DialogDescription className="sm:text-center">
              Enter your credentials to login to your account.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`${id}-email`}>Email or Phone Number</Label>
              <Input
                id={`${id}-email`}
                placeholder="hi@yourcompany.com or username"
                type="text"
                {...register("emailOrUsername", {
                  required: "Email or Phone Number is required",
                })}
                className={cn(
                  "input-field",
                  errors.emailOrUsername && "border-destructive"
                )}
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
                className={cn(
                  "input-field",
                  errors.password && "border-destructive"
                )}
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
            <a className="text-sm font-medium text-[#b08d57] hover:text-[#a3824d]" href="#">
              Forgot password?
            </a>
          </div>
          <button
            type="submit"
            className="w-full btn-primary disabled:bg-gray-400"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
