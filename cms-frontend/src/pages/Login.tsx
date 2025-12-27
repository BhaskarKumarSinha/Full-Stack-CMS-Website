import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../auth/useAuth";
import type { ErrorResponse } from "../types";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const nav = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      nav("/admin");
    } catch (err: unknown) {
      const error = err as ErrorResponse;
      setError(
        error?.response?.data?.message || error?.message || "Login failed"
      );
    }
  };

  return (
    <div className="w-screen min-h-screen bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full mx-auto bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-blue-600 text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
                />
                <circle
                  cx="12"
                  cy="7"
                  r="4"
                  strokeWidth={2}
                  stroke="currentColor"
                  fill="white"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-black">CMS Admin</h1>
              <p className="text-sm text-gray-500">
                Sign in to manage pages & components
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-2 text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-label="email"
                className="mt-1 block w-full rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm"
                placeholder="you@example.com"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Password
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                aria-label="password"
                className="mt-1 block w-full rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm"
                placeholder="••••••••"
              />
            </label>

            <div className="flex items-center justify-between">
              <label className="inline-flex items-center text-sm">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-gray-600">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot?
              </button>
            </div>

            <div>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                Sign in
              </button>
            </div>
          </form>
        </div>

        <div className="bg-gray-50 p-4 text-center text-sm text-gray-500 border-t border-gray-100">
          <span>Need an account?</span>
          <button
            onClick={() => nav("/login")}
            className="ml-2 text-blue-600 hover:underline"
          >
            Contact admin
          </button>
        </div>
      </div>
    </div>
  );
}
