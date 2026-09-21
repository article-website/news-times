import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSession } from "@/server/auth";
import { userRepo, sumberDataAktif } from "@/server/repositories";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Login Admin - NewsTimes",
  description: "Halaman autentikasi untuk pengelola dan redaksi NewsTimes.",
};

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    redirect("/admin");
  }

  const userCount = await userRepo.count();

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
      <LoginForm isInitialSetup={userCount === 0} sumberData={sumberDataAktif} />
    </div>
  );
}
