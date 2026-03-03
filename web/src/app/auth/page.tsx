"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

type FormValues = {
  name: string;
  email: string;
  password: string;
};

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const { login } = useAuth();
  const router = useRouter();
  const { register, handleSubmit, formState } = useForm<FormValues>();

  const onSubmit = async (values: FormValues) => {
    try {
      const endpoint = mode === "signup" ? "/auth/signup" : "/auth/login";
      const payload = mode === "signup" ? values : { email: values.email, password: values.password };
      const response = await api.post(endpoint, payload);
      login(response.data.token, response.data.user);
      toast.success(`${mode === "signup" ? "Account created" : "Welcome back"}!`);
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Authentication failed");
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <div className="glass-card w-full space-y-4">
        <h1 className="text-2xl font-semibold">Welcome to SmartSpend</h1>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`btn ${mode === "login" ? "bg-cyan-600 text-white" : "bg-slate-200 dark:bg-slate-800"}`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`btn ${mode === "signup" ? "bg-cyan-600 text-white" : "bg-slate-200 dark:bg-slate-800"}`}
          >
            Sign Up
          </button>
        </div>
        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
          {mode === "signup" && <input className="input" placeholder="Name" {...register("name", { required: true })} />}
          <input className="input" placeholder="Email" type="email" {...register("email", { required: true })} />
          <input className="input" placeholder="Password" type="password" {...register("password", { required: true })} />
          <button type="submit" disabled={formState.isSubmitting} className="btn w-full bg-cyan-600 text-white">
            {formState.isSubmitting ? "Please wait..." : mode === "signup" ? "Create account" : "Login"}
          </button>
        </form>
      </div>
    </main>
  );
}
