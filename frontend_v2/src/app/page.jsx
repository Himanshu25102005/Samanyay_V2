"use client";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { Playfair_Display, Inter } from "next/font/google";
import Plasma from "../../animations/Plasma";


const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function Home() {
  const { scrollYProgress } = useScroll();
  const heroParallax = useTransform(scrollYProgress, [0, 1], [0, 60]);

  const testimonials = useMemo(
    () => [
      { name: "Aarav Sharma", role: "Advocate, Delhi HC", text: "Samanyay saves me hours every week. Its research and drafting assistance are remarkably precise." },
      { name: "Neha Verma", role: "In-house Counsel", text: "Clean, trustworthy, and fast. The AI insights help us move confidently." },
      { name: "Rahul Mehta", role: "Startup Founder", text: "From notices to agreements, Samanyay makes legal tasks approachable and efficient." },
      { name: "Priya Singh", role: "Legal Analyst", text: "Multilingual support and smart summarization are game-changers for our workflows." },
    ],
    []
  );

  const [activeIdx, setActiveIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActiveIdx((i) => (i + 1) % testimonials.length), 4500);
    return () => clearInterval(id);
  }, [testimonials.length]);

  function onNavClick(e, id) {
    e.preventDefault();
    const el = document.querySelector(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <main className={`${inter.variable} ${playfair.variable} text-slate-800`}>
      {/* In-page navbar */}
      <header className="sticky top-0 z-40 backdrop-blur bg-white/70 border-b border-slate-200/70">
        <div className="mx-auto max-w-[1280px] px-6 md:px-10 lg:px-14 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative h-8 w-8">
              <Image src="/logo.png" alt="Samanyay" fill className="object-contain" />
            </div>
            <span className="font-semibold text-[#1A2C4E]">Samanyay</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-700">
            {[{ id: "#features", label: "Features" }, { id: "#how-it-works", label: "How it works" }, { id: "#benefits", label: "Why Samanyay" }, { id: "#trust", label: "Security" }, { id: "#contact", label: "Contact" }].map((link) => (
              <motion.a
                key={link.id}
                href={link.id}
                onClick={(e) => onNavClick(e, link.id)}
                whileTap={{ scale: 0.96 }}
                className="hover:text-[#1A2C4E] transition"
              >
                {link.label}
              </motion.a>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <motion.a
              href="/login"
              whileHover={{ y: -2, boxShadow: "0 10px 24px rgba(46,162,126,0.22)" }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center justify-center rounded-lg border border-slate-300/80 bg-white/60 backdrop-blur px-4 py-2 text-sm text-[#1A2C4E] hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300"
            >
              Login
            </motion.a>
            <motion.a
              href="/login"
              whileHover={{ y: -2, boxShadow: "0 12px 28px rgba(46,162,126,0.28)", filter: "brightness(1.05)" }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center justify-center rounded-lg bg-[#2EA27E] px-4 py-2 text-sm text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2EA27E]"
            >
              Sign Up
            </motion.a>
          </div>
        </div>
      </header>
      {/* Background */}
      <div className="fixed inset-0 -z-20" aria-hidden>
        <Plasma 
          color="#2EA27E"
          speed={0.5}
          direction="forward"
          scale={1.2}
          opacity={0.35}
          mouseInteractive={true}
        />
      </div>

      <div className="fixed inset-0 -z-10 bg-[radial-gradient(1200px_800px_at_10%_10%,#E8ECF2_20%,transparent_60%),linear-gradient(to_bottom,#F9FAFB, #E8ECF2)]" />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-[1280px] px-6 md:px-10 lg:px-14 py-20 md:py-24 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="[font-family:var(--font-playfair)] text-[#1A2C4E] text-3xl md:text-4xl lg:text-5xl leading-tight tracking-tight"
              >
                AI-Powered Legal Assistance for Everyone
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
                className="mt-4 md:mt-5 text-slate-600 text-base md:text-lg leading-relaxed max-w-2xl"
              >
                Simplifying legal processes with intelligent document analysis and legal research.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.25 }}
                className="mt-7 flex flex-wrap gap-3"
              >
                <a href="/login" className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-white bg-[#2EA27E] shadow-sm hover:shadow-md hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2EA27E] transition">
                  Get Started
                </a>
                <a
                  href="#document-analysis"
                  className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-[#1A2C4E] border border-slate-300/80 bg-white/60 backdrop-blur hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300 transition"
                >
                  Try Document Analysis
                </a>
              </motion.div>
            </div>

            <div className="relative">
              {/* Glow */}
              <motion.div
                style={{ y: heroParallax }}
                aria-hidden
                className="absolute -top-10 -left-10 right-0 h-80 rounded-3xl bg-gradient-to-br from-[#1A2C4E]/10 via-[#2EA27E]/10 to-transparent blur-2xl"
              />
              {/* Visual */}
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
                className="relative rounded-3xl border border-slate-200/70 bg-white/70 backdrop-blur p-4 shadow-[0_10px_40px_rgba(26,44,78,0.08)]"
              >
                <div className="aspect-[16/10] w-full overflow-hidden rounded-2xl">
                  <Image src="/window.png" alt="AI legal assistant" fill priority className="object-contain" />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-12 md:py-20">
        <div className="mx-auto max-w-[1280px] px-6 md:px-10 lg:px-14">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="[font-family:var(--font-playfair)] text-2xl md:text-3xl lg:text-4xl text-[#1A2C4E]"
          >
            Powerful Features at Your Fingertips
          </motion.h2>
          <p className="mt-3 text-slate-600 max-w-2xl">A modern toolkit balancing legal rigor with AI efficiency.</p>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {[
              { title: "Document Analysis & Summarization", icon: "file.svg", desc: "Understand lengthy documents in seconds." },
              { title: "AI-Driven Legal Research", icon: "globe.svg", desc: "Search jurisprudence and insights intelligently." },
              { title: "Multilingual Support", icon: "next.svg", desc: "Work across languages with ease." },
              { title: "Custom Document Generation", icon: "vercel.svg", desc: "Draft contracts, notices, and more." },
              { title: "Secure & Private Assistance", icon: "window.svg", desc: "Your data stays confidential." },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="group rounded-2xl border border-slate-200/70 bg-white/70 backdrop-blur p-5 shadow-sm hover:shadow-md transition will-change-transform"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1A2C4E]/10 to-[#2EA27E]/10 flex items-center justify-center ring-1 ring-slate-200">
                  <Image src={`/${f.icon}`} alt="" width={24} height={24} className="opacity-80" />
                </div>
                <div className="mt-4 font-medium text-[#1A2C4E]">{f.title}</div>
                <div className="text-sm text-slate-600 mt-1">{f.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-12 md:py-20">
        <div className="mx-auto max-w-[1280px] px-6 md:px-10 lg:px-14">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="[font-family:var(--font-playfair)] text-2xl md:text-3xl lg:text-4xl text-[#1A2C4E]"
          >
            How Samanyay Works
          </motion.h2>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Upload Document", desc: "Securely upload PDFs or text files.", delay: 0 },
              { title: "AI Analyzes & Suggests Insights", desc: "Get summaries, risks, and recommendations.", delay: 0.05 },
              { title: "Get Instant Results & Drafts", desc: "Copy, export, or start a new draft.", delay: 0.1 },
            ].map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.55, delay: s.delay }}
                whileHover={{ y: -6, boxShadow: "0 16px 40px rgba(26,44,78,0.12)" }}
                className="relative rounded-2xl border border-slate-200/70 bg-white/70 backdrop-blur p-6 shadow-sm"
              >
                <div className="absolute top-4 right-4 text-sm text-slate-400">{String(i + 1).padStart(2, "0")}</div>
                <div className="font-medium text-[#1A2C4E]">{s.title}</div>
                <div className="text-sm text-slate-600 mt-1">{s.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="py-12 md:py-20">
        <div className="mx-auto max-w-[1280px] px-6 md:px-10 lg:px-14 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="[font-family:var(--font-playfair)] text-2xl md:text-3xl lg:text-4xl text-[#1A2C4E]"
            >
              Why Choose Samanyay
            </motion.h2>
            <p className="mt-3 text-slate-600 leading-relaxed max-w-prose">
              Built for professionals and citizens alike, Samanyay brings clarity and efficiency to legal work.
            </p>
            <ul className="mt-6 space-y-3">
              {["Accessible legal help anytime, anywhere", "Save time and reduce legal costs", "AI-powered insights trusted by professionals"].map(
                (b) => (
                  <li key={b} className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-50 text-emerald-700">✓</span>
                    <span className="text-slate-700">{b}</span>
                  </li>
                )
              )}
            </ul>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl border border-slate-200/70 bg-white/70 backdrop-blur p-6 shadow-[0_10px_40px_rgba(26,44,78,0.08)]"
          >
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-gradient-to-br from-[#1A2C4E]/10 to-[#2EA27E]/10 flex items-center justify-center ring-1 ring-slate-200">
                <Image src="/globe.svg" alt="AI" width={28} height={28} />
              </div>
    <div>
                <div className="font-medium text-[#1A2C4E]">Designed with AI precision</div>
                <div className="text-sm text-slate-600">Premium UX, tasteful motion, and accessibility in mind.</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section aria-label="Testimonials" className="py-12 md:py-20 bg-white/50">
        <div className="mx-auto max-w-[1280px] px-6 md:px-10 lg:px-14">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="[font-family:var(--font-playfair)] text-2xl md:text-3xl lg:text-4xl text-[#1A2C4E]"
          >
            Trusted by Professionals and Citizens
          </motion.h2>
          <div className="relative mt-8">
            <div className="overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {testimonials.map((t, i) => (
                  <motion.figure
                    key={t.name}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: activeIdx === i ? 1 : 0.4, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="rounded-2xl border border-slate-200/70 bg-white/70 backdrop-blur p-6 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-slate-200" />
                      <figcaption>
                        <div className="font-medium text-[#1A2C4E]">{t.name}</div>
                        <div className="text-sm text-slate-600">{t.role}</div>
                      </figcaption>
                    </div>
                    <blockquote className="mt-4 text-slate-700 leading-relaxed">“{t.text}”</blockquote>
                  </motion.figure>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Security */}
      <section id="trust" className="py-12 md:py-20">
        <div className="mx-auto max-w-[1280px] px-6 md:px-10 lg:px-14">
          <div className="relative">
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="[font-family:var(--font-playfair)] text-2xl md:text-3xl lg:text-4xl text-[#1A2C4E]"
            >
              Your Privacy, Our Priority
            </motion.h2>
            <div className="absolute left-0 -bottom-1 h-[2px] w-40 bg-gradient-to-r from-[#2EA27E] to-transparent" />
    </div>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "End-to-End Document Encryption", desc: "Your files are protected in transit and at rest.", svg: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M7 10V7a5 5 0 0 1 10 0v3" stroke="#1A2C4E" strokeWidth="1.6" />
                    <rect x="4" y="10" width="16" height="10" rx="2" stroke="#2EA27E" strokeWidth="1.6" />
                    <circle cx="12" cy="15" r="2" stroke="#1A2C4E" strokeWidth="1.6" />
                  </svg>
                )
              },
              {
                title: "Strict Confidentiality Policies", desc: "We never sell or share your data.", svg: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M12 3l8 4v5c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V7l8-4z" stroke="#1A2C4E" strokeWidth="1.6" />
                    <path d="M9 12l2 2 4-4" stroke="#2EA27E" strokeWidth="1.6" />
                  </svg>
                )
              },
              {
                title: "GDPR-Compliant Data Handling", desc: "Built with global privacy standards.", svg: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <circle cx="12" cy="12" r="9" stroke="#1A2C4E" strokeWidth="1.6" />
                    <path d="M7 12h10M12 7v10" stroke="#2EA27E" strokeWidth="1.6" />
                  </svg>
                )
              },
            ].map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="rounded-2xl border border-slate-200/70 bg-white/70 backdrop-blur p-6 shadow-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1A2C4E]/10 to-[#2EA27E]/10 mb-3 flex items-center justify-center">
                  {c.svg}
                </div>
                <div className="font-medium text-[#1A2C4E]">{c.title}</div>
                <div className="text-sm text-slate-600 mt-1">{c.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1A2C4E] text-white">
        <div className="mx-auto max-w-[1280px] px-6 md:px-10 lg:px-14 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="relative h-8 w-8">
                <Image src="/logo.png" alt="Samanyay" fill className="object-contain" />
              </div>
              <span className="text-lg font-semibold">Samanyay</span>
            </div>
            <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-100/90">
              <a className="hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/60 focus:ring-offset-[#1A2C4E] rounded" href="#about">About</a>
              <a className="hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/60 focus:ring-offset-[#1A2C4E] rounded" href="#features">Features</a>
              <a className="hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/60 focus:ring-offset-[#1A2C4E] rounded" href="#privacy">Privacy Policy</a>
              <a className="hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/60 focus:ring-offset-[#1A2C4E] rounded" href="#contact">Contact</a>
              <a className="hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/60 focus:ring-offset-[#1A2C4E] rounded" href="#terms">Terms of Service</a>
            </nav>
            <div className="flex items-center gap-3">
              <a aria-label="Twitter" href="https://twitter.com/" target="_blank" rel="noreferrer" className="size-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/60 focus:ring-offset-[#1A2C4E]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-white" aria-hidden>
                  <path d="M22 5.8c-.7.3-1.5.6-2.3.7.8-.5 1.4-1.2 1.7-2-.8.5-1.7.9-2.6 1.1A4.1 4.1 0 0 0 12 8.9c0 .3 0 .6.1.9-3.3-.2-6.3-1.7-8.3-4-.3.6-.5 1.2-.5 1.9 0 1.4.7 2.7 1.9 3.4-.6 0-1.2-.2-1.7-.5 0 2 1.4 3.7 3.3 4-.3.1-.7.2-1 .2-.3 0-.5 0-.8-.1.6 1.7 2.2 2.9 4.1 3a8.3 8.3 0 0 1-5.1 1.7H3a11.7 11.7 0 0 0 6.3 1.8c7.6 0 11.8-6.3 11.8-11.8v-.5c.8-.6 1.4-1.2 1.9-2z" />
                </svg>
              </a>
              <a aria-label="Instagram" href="https://instagram.com/" target="_blank" rel="noreferrer" className="size-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/60 focus:ring-offset-[#1A2C4E]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-white" aria-hidden>
                  <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11zm0 2a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zm5.8-2.2a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0z" />
                </svg>
              </a>
              <a aria-label="LinkedIn" href="https://www.linkedin.com/" target="_blank" rel="noreferrer" className="size-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/60 focus:ring-offset-[#1A2C4E]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-white" aria-hidden>
                  <path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM0 8h5v16H0V8zm7.5 0h4.8v2.2h.1c.7-1.3 2.4-2.7 4.9-2.7 5.2 0 6.1 3.4 6.1 7.8V24h-5V16.4c0-1.8 0-4.1-2.5-4.1-2.6 0-3 2-3 4v7.7h-5V8z" />
                </svg>
              </a>
            </div>
          </div>
          {/* Contact in footer */}
          <div id="contact" className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="text-sm text-slate-100/90">Email</div>
              <a href="mailto:aditya@samanyay.com" className="mt-1 block text-white font-medium hover:underline">aditya@samanyay.com</a>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="text-sm text-slate-100/90">Phone</div>
              <a href="tel:+919665170418" className="mt-1 block text-white font-medium hover:underline">+91-9665170418</a>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="text-sm text-slate-100/90">Location</div>
              <div className="mt-1 text-white font-medium">Pune, Maharashtra</div>
            </div>
          </div>
          <div className="mt-8 text-xs text-slate-200/80">© {new Date().getFullYear()} Samanyay. All rights reserved.</div>
        </div>
      </footer>
    </main>
  );
}
