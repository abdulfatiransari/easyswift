"use client";
import LandingPage from "@/components/Home";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {

  return (
    <>
      <div>
        <LandingPage />
      </div>
    </>
  );
}
