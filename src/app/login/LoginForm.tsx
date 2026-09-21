"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginAction, setupFirstAdminAction } from "./actions";

interface LoginFormProps {
  isInitialSetup: boolean;
  sumberData: string;
}

export default function LoginForm({ isInitialSetup, sumberData }: LoginFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function handleFillDemo() {
    setName("Administrator");
    setEmail("admin@newstimes.id");
    setPassword("admin123");
    setConfirmPassword("admin123");
    setError(null);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    if (isInitialSetup) {
      formData.append("name", name);
      formData.append("confirmPassword", confirmPassword);
    }

    startTransition(async () => {
      const res = isInitialSetup
        ? await setupFirstAdminAction(formData)
        : await loginAction(formData);

      if (!res.ok) {
        setError(res.error || "Gagal masuk. Silakan periksa kredensial Anda.");
        return;
      }

      router.push("/admin");
      router.refresh();
    });
  }

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <div className="text-center mb-8">
        <Link href="/" className="inline-block text-2xl font-bold tracking-tight text-gray-900 mb-2">
          News<span className="text-blue-600">Times</span>
        </Link>
        <h2 className="text-xl font-semibold text-gray-900">
          {isInitialSetup ? "Inisialisasi Akun Administrator" : "Masuk ke Panel Admin"}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {isInitialSetup
            ? "Belum ada akun di database. Daftarkan akun admin pertama Anda."
            : "Gunakan email dan kata sandi yang telah terdaftar untuk mengelola berita."}
        </p>

        <div className="mt-3 inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          <span>Mode:</span>
          <span className="font-semibold text-blue-700">
            {sumberData === "prisma" ? "PostgreSQL (Neon)" : "In-Memory"}
          </span>
        </div>
      </div>

      {isInitialSetup && (
        <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-100 text-blue-900 text-xs leading-relaxed space-y-2">
          <p className="font-semibold flex items-center gap-1.5 text-blue-950">
            <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Instalasi Baru Terdeteksi
          </p>
          <p>
            Akun pertama yang didaftarkan akan otomatis mendapatkan peran <strong>ADMIN</strong> dengan hak akses penuh.
          </p>
          <button
            type="button"
            onClick={handleFillDemo}
            className="text-xs font-semibold text-blue-700 hover:text-blue-800 underline block cursor-pointer mt-1"
          >
            Klik di sini untuk isi otomatis data contoh (admin@newstimes.id)
          </button>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
          <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {isInitialSetup && (
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
              Nama Lengkap
            </label>
            <input
              type="text"
              name="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Administrator NewsTimes"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
            Alamat Email
          </label>
          <input
            type="email"
            name="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@newstimes.id"
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
            Kata Sandi
          </label>
          <input
            type="password"
            name="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isInitialSetup ? "Minimal 6 karakter" : "••••••••"}
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
          />
        </div>

        {isInitialSetup && (
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
              Konfirmasi Kata Sandi
            </label>
            <input
              type="password"
              name="confirmPassword"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ketik ulang kata sandi"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full mt-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
        >
          {isPending && (
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          )}
          <span>
            {isPending
              ? "Memproses..."
              : isInitialSetup
                ? "Daftarkan Admin & Masuk"
                : "Masuk ke Panel Admin"}
          </span>
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-100 text-center">
        <Link
          href="/"
          className="text-xs text-gray-500 hover:text-gray-900 transition-colors inline-flex items-center gap-1"
        >
          <span>&larr;</span> Kembali ke Halaman Utama
        </Link>
      </div>
    </div>
  );
}
