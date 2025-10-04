"use client";
import { motion } from "framer-motion";
import Image from "next/image";

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[radial-gradient(1200px_800px_at_10%_10%,#E8ECF2_20%,transparent_60%),linear-gradient(to_bottom,#F9FAFB,#E8ECF2)]">
      <div className="relative w-full max-w-sm mx-auto px-8">
        <div className="flex items-center justify-center">
          <div className="relative h-14 w-14">
            <Image src="/logo.png" alt="Samanyay" fill className="object-contain" priority />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-4 text-center text-[#1A2C4E] text-lg font-medium"
        >
          Loading your experience…
        </motion.div>

        <div className="mt-6 h-2 w-full rounded-full bg-white/60 backdrop-blur border border-slate-200/70 overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500"
            initial={{ width: "0%" }}
            animate={{ width: ["0%", "35%", "60%", "85%", "100%"] }}
            transition={{ duration: 2.4, ease: "easeInOut", repeat: Infinity }}
          />
        </div>

        <div className="mt-8 flex items-center justify-center gap-3 text-sm text-slate-600">
          <motion.span
            className="inline-flex h-2 w-2 rounded-full bg-emerald-500"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
          <span>Securing documents</span>
          <motion.span
            className="inline-flex h-2 w-2 rounded-full bg-emerald-500"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
          />
          <span>Preparing AI</span>
          <motion.span
            className="inline-flex h-2 w-2 rounded-full bg-emerald-500"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
          />
          <span>Optimizing UI</span>
        </div>

        <motion.div
          aria-hidden
          className="pointer-events-none absolute -inset-x-20 -top-10 h-40 rounded-[32px] bg-gradient-to-br from-[#1A2C4E]/10 via-[#2EA27E]/10 to-transparent blur-3xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        />
      </div>
    </div>
  );
}


