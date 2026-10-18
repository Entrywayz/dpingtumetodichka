"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [loginVal, setLoginVal] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false); // <-- Состояние чекбокса
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({
        login: loginVal,
        password,
        remember_me: rememberMe, 
      });
      router.push("/products");
    } catch (err: any) {
      setError(err.message || "Ошибка авторизации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded-lg border border-white/20 p-6 shadow-md bg-zinc-900 text-white">
        <h1 className="text-xl font-bold">Вход в систему</h1>

        {error && <div className="rounded bg-red-500/20 border border-red-500 p-3 text-sm text-red-300">{error}</div>}

        <div>
          <label className="block text-sm font-medium">Логин</label>
          <input
            type="text"
            value={loginVal}
            onChange={(e) => setLoginVal(e.target.value)}
            required
            className="mt-1 w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-white outline-none focus:border-blue-500"
            placeholder="Введите логин"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Пароль</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-white outline-none focus:border-blue-500"
            placeholder="••••••••"
          />
        </div>

        {/* Чекбокс Запомнить меня */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="rememberMe" className="text-sm text-zinc-300 cursor-pointer select-none">
            Запомнить меня
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-blue-600 p-2 font-medium text-white hover:bg-blue-700 disabled:bg-gray-600"
        >
          {loading ? "Вход..." : "Войти"}
        </button>
      </form>
    </div>
  );
}