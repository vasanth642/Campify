"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  ArrowRight,
  Building2,
  Globe,
  Trophy,
  MessageCircle,
  TrendingUp,
  BookOpen,
  HandHelping,
  Users,
  ChevronUp,
  Clock,
  ShieldCheck,
  Bell,
  Sparkles,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Radio,
  Share2,
  UserPlus,
  Check,
  Award,
  Shield,
} from "lucide-react";

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] },
  },
};

const heroPostsByTab = {
  my_college: [
    {
      icon: BookOpen,
      category: "Academics",
      title: "Anyone taking the ML elective next semester?",
      author: "Vasanth",
      initial: "V",
      college: "NIT Trichy",
      time: "2m ago",
      upvotes: 24,
      discussions: 8,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      icon: HandHelping,
      category: "Hostel",
      title: "Hostel B Mess Menu: New caterer feedback thread",
      author: "Kavya",
      initial: "K",
      college: "NIT Trichy",
      time: "15m ago",
      upvotes: 34,
      discussions: 6,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      icon: Users,
      category: "Events",
      title: "Pragyan Robotics Workshop: registrations open",
      author: "Dinesh",
      initial: "D",
      college: "NIT Trichy",
      time: "45m ago",
      upvotes: 48,
      discussions: 12,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      icon: BookOpen,
      category: "Academics",
      title: "Operating Systems mid-term question paper discussion",
      author: "Arun",
      initial: "A",
      college: "NIT Trichy",
      time: "2h ago",
      upvotes: 52,
      discussions: 18,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
  ],
  nationwide: [
    {
      icon: TrendingUp,
      category: "Career",
      title: "Google SWE internship timeline and interview tips",
      author: "Meera",
      initial: "M",
      college: "IIT Madras",
      time: "1h ago",
      upvotes: 156,
      discussions: 41,
      color: "text-violet-400",
      bg: "bg-violet-500/10",
    },
    {
      icon: Users,
      category: "Events",
      title: "Smart India Hackathon 2026: 3 spots open for AI team",
      author: "Arjun",
      initial: "A",
      college: "BITS Pilani",
      time: "12m ago",
      upvotes: 67,
      discussions: 23,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      icon: BookOpen,
      category: "Academics",
      title: "Open-source compiler research group: weekly meetups",
      author: "Rohan",
      initial: "R",
      college: "IIT Bombay",
      time: "3h ago",
      upvotes: 84,
      discussions: 14,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      icon: TrendingUp,
      category: "Career",
      title: "Summer 2026 Off-Campus Referral sheet curated by seniors",
      author: "Siddharth",
      initial: "S",
      college: "Vel Tech",
      time: "4h ago",
      upvotes: 112,
      discussions: 29,
      color: "text-violet-400",
      bg: "bg-violet-500/10",
    },
  ],
  help_wanted: [
    {
      icon: HandHelping,
      category: "Help Wanted",
      title: "Lost my ID card near the central library (CS Senior)",
      author: "Priya",
      initial: "P",
      college: "IIT Bombay",
      time: "5m ago",
      upvotes: 42,
      discussions: 15,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      icon: HandHelping,
      category: "Help Wanted",
      title: "Need textbook PDF for Distributed Systems (Coulouris 5th ed)",
      author: "Naveen",
      initial: "N",
      college: "Vel Tech",
      time: "30m ago",
      upvotes: 19,
      discussions: 7,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      icon: HandHelping,
      category: "Help Wanted",
      title: "Seeking senior mentor for GSOC proposal review in WebRTC",
      author: "Ananya",
      initial: "A",
      college: "Anna Univ",
      time: "1h ago",
      upvotes: 38,
      discussions: 11,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      icon: HandHelping,
      category: "Help Wanted",
      title: "Accommodation advice for Bangalore internship near Electronic City",
      author: "Vignesh",
      initial: "V",
      college: "NIT Trichy",
      time: "3h ago",
      upvotes: 27,
      discussions: 16,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
  ],
};

const collegesList = [
  "IIT Bombay",
  "NIT Trichy",
  "IIIT Hyderabad",
  "BITS Pilani",
  "IIT Madras",
  "Vel Tech",
  "VIT Vellore",
  "DTU Delhi",
  "SRM Chennai",
  "IIT Delhi",
  "NIT Surathkal",
  "Anna University",
];

const howItWorksSteps = [
  {
    id: "01",
    title: "Verify with college ID",
    subtitle: "Fast single-step verification with your campus email or student credentials to unlock your verified badge.",
    badge: "Official Campus Verification",
  },
  {
    id: "02",
    title: "Join your campus feed",
    subtitle: "Direct access to real-time academic discussions, mess notices, club recruitment, and housing announcements.",
    badge: "Restricted Student Hub",
  },
  {
    id: "03",
    title: "Build verified campus rep",
    subtitle: "Help peers with study material, campus queries, and project teams to earn karma and unlock elite contributor status.",
    badge: "Community Credibility",
  },
];

export default function HomePage() {
  const [activeStep, setActiveStep] = useState(0);
  const [heroTab, setHeroTab] = useState<"my_college" | "nationwide" | "help_wanted">("my_college");
  const [isInView, setIsInView] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const howItWorksRef = useRef<HTMLElement>(null);
  const pauseTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const el = howItWorksRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView || isPaused) return;

    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % howItWorksSteps.length);
    }, 3200);

    return () => clearInterval(interval);
  }, [isInView, isPaused]);

  function handleSelectStep(idx: number) {
    setActiveStep(idx);
    setIsPaused(true);

    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
    }

    pauseTimerRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 5000);
  }

  return (
    <div className="bg-[#09090B] text-zinc-100 overflow-hidden">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden">
        {/* Radial spotlight */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120, 119, 198, 0.25), transparent)",
          }}
        />
        {/* Dot-matrix grid */}
        <div className="hero-grid pointer-events-none absolute inset-0" />

        <motion.div
          className="relative mx-auto max-w-6xl px-6 pb-20 pt-20 sm:pt-28"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {/* Centered hero content */}
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge */}
            <motion.div
              variants={fadeUp}
              className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5"
            >
              <div className="flex -space-x-1.5">
                {["V", "A", "S"].map((letter, i) => (
                  <div
                    key={i}
                    className="flex h-5 w-5 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-[9px] font-semibold text-zinc-400"
                  >
                    {letter}
                  </div>
                ))}
              </div>
              <span className="text-[13px] font-medium text-zinc-400">
                Trusted by students across 11+ colleges
              </span>
            </motion.div>

            {/* Headline with gradient text */}
            <motion.h1
              variants={fadeUp}
              className="bg-gradient-to-b from-white to-white/65 bg-clip-text text-[46px] font-semibold leading-[1.08] tracking-tighter text-transparent sm:text-[68px]"
            >
              The community platform built for campus life
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeUp}
              className="mx-auto mt-6 max-w-xl text-[16px] leading-relaxed text-zinc-400 sm:text-[17px]"
            >
              Real-time discussions, college-specific feeds, and peer connections
              built for students who want signal, not noise.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={fadeUp}
              className="mt-10 flex items-center justify-center gap-3"
            >
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-[14px] font-medium text-zinc-950 shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-colors hover:bg-zinc-200"
              >
                Get Started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/feed"
                className="rounded-full border border-white/[0.1] bg-white/[0.05] px-6 py-2.5 text-[14px] font-medium text-zinc-300 transition-colors hover:bg-white/[0.1]"
              >
                Browse Feed
              </Link>
            </motion.div>
          </div>

          {/* Interactive Feed Mockup Frame */}
          <motion.div
            variants={fadeUp}
            className="relative mx-auto mt-16 max-w-4xl"
          >
            {/* Outer glow */}
            <div className="pointer-events-none absolute -inset-6 rounded-3xl bg-accent/[0.08] blur-[60px]" />
            <div className="pointer-events-none absolute -inset-3 left-1/4 w-1/2 rounded-full bg-accent/[0.06] blur-[80px]" />

            {/* Frame */}
            <div className="relative overflow-hidden rounded-xl border border-white/[0.1] border-t-white/20 bg-zinc-900/60 shadow-2xl shadow-black/40 backdrop-blur-xl">
              {/* Title bar */}
              <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-[#FF5F56]/90 border border-[#E0443E]/50 shadow-sm" />
                  <div className="h-3 w-3 rounded-full bg-[#FFBD2E]/90 border border-[#DEA123]/50 shadow-sm" />
                  <div className="h-3 w-3 rounded-full bg-[#27C93F]/90 border border-[#1AAB29]/50 shadow-sm" />
                </div>
                <div className="mx-auto flex items-center gap-2">
                  <MessageCircle className="h-3.5 w-3.5 text-zinc-500" />
                  <span className="text-[12px] font-medium text-zinc-500">
                    Campus Feed
                  </span>
                </div>
                <div className="w-[52px]" />
              </div>

              {/* Tab bar */}
              <div className="flex items-center gap-1.5 border-b border-white/[0.06] px-4 py-2">
                {[
                  { key: "my_college", label: "My College" },
                  { key: "nationwide", label: "Nationwide" },
                  { key: "help_wanted", label: "Help Wanted" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setHeroTab(tab.key as any)}
                    className={`rounded-md px-3 py-1 text-[12px] font-medium transition-colors ${
                      heroTab === tab.key
                        ? "bg-white/[0.1] text-white shadow-sm"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Post cards */}
              <div className="divide-y divide-white/[0.04]">
                {heroPostsByTab[heroTab].map((post) => (
                  <div
                    key={post.title}
                    className="flex gap-3.5 px-5 py-4 transition-colors hover:bg-white/[0.04]"
                  >
                    {/* Avatar */}
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[13px] font-semibold text-zinc-300">
                      {post.initial}
                    </div>

                    <div className="min-w-0 flex-1">
                      {/* Author row */}
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold text-zinc-200">
                          {post.author}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-800/80 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
                          <ShieldCheck className="h-2.5 w-2.5" />
                          {post.college}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-zinc-600">
                          <Clock className="h-2.5 w-2.5" />
                          {post.time}
                        </span>
                      </div>

                      {/* Title */}
                      <p className="mt-1 text-[14px] font-medium leading-snug text-zinc-300">
                        {post.title}
                      </p>

                      {/* Meta row */}
                      <div className="mt-2.5 flex items-center gap-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md ${post.bg} px-2 py-0.5 text-[11px] font-medium ${post.color}`}
                        >
                          <post.icon className="h-3 w-3" />
                          {post.category}
                        </span>
                        <button className="inline-flex items-center gap-1 rounded-md bg-zinc-800/60 px-2 py-0.5 text-[11px] font-medium text-zinc-400 transition-colors hover:bg-zinc-700/60 hover:text-zinc-200">
                          <ChevronUp className="h-3 w-3" />
                          {post.upvotes}
                        </button>
                        <span className="flex items-center gap-1 text-[11px] text-zinc-500">
                          <MessageCircle className="h-3 w-3" />
                          {post.discussions}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* 2. College Ticker / Social Proof Strip */}
      <section className="relative border-y border-white/[0.06] bg-zinc-950/40 py-5 overflow-hidden">
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-24 bg-gradient-to-r from-[#09090B] to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-24 bg-gradient-to-l from-[#09090B] to-transparent" />

        <div className="flex animate-marquee gap-3 whitespace-nowrap">
          {[...collegesList, ...collegesList].map((college, idx) => (
            <div
              key={`${college}-${idx}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-4 py-1.5 text-xs font-medium text-zinc-400"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400/80" />
              <span>{college}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Bento Grid: Everything your campus needs */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            Everything your campus needs
          </h2>
          <p className="mt-3 text-sm sm:text-base text-zinc-400 max-w-xl mx-auto">
            High-signal architecture engineered for student communication, peer validation, and inter-college discovery.
          </p>
        </div>

        {/* Asymmetric 2-Row Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {/* Card 1: College Hubs (Span 4) */}
          <div className="md:col-span-4 rounded-2xl border border-white/10 bg-zinc-900/50 p-6 sm:p-7 hover:border-white/25 transition group flex flex-col justify-between">
            <div>
              {/* Mini UI Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs text-zinc-500 block">Verified University Domain</span>
                    <span className="text-sm font-semibold text-white">College Hub Feed</span>
                  </div>
                </div>
                {/* College filter pills */}
                <div className="hidden sm:flex items-center gap-1.5">
                  {["NIT Trichy", "Vel Tech", "IIT Madras"].map((name, i) => (
                    <span
                      key={name}
                      className={`text-[11px] px-2.5 py-1 rounded-full border ${
                        i === 0
                          ? "bg-white/10 text-white border-white/20"
                          : "text-zinc-500 border-white/[0.06] bg-white/[0.01]"
                      }`}
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Realistic Mini Feed Posts */}
              <div className="mt-5 space-y-3">
                <div className="rounded-xl border border-white/[0.06] bg-zinc-950/70 p-3.5 transition group-hover:bg-zinc-950/90">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-semibold text-zinc-300 border border-white/10">
                        K
                      </div>
                      <span className="text-xs font-semibold text-zinc-200">Kavya</span>
                      <span className="rounded-full bg-zinc-800/80 px-2 py-0.5 text-[9px] font-medium text-zinc-400">
                        NIT Trichy
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-500">10m ago</span>
                  </div>
                  <p className="mt-1.5 text-xs font-medium text-zinc-200">
                    Hostel B Mess Menu: New caterer feedback thread
                  </p>
                  <div className="mt-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="rounded bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                        Hostel
                      </span>
                      <span className="text-[10px] text-zinc-500">Campus Only</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                      <span className="inline-flex items-center gap-0.5"><ChevronUp className="h-3 w-3" /> 34</span>
                      <span className="inline-flex items-center gap-0.5"><MessageCircle className="h-3 w-3" /> 6</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-white/[0.06] bg-zinc-950/70 p-3.5 transition group-hover:bg-zinc-950/90">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-semibold text-zinc-300 border border-white/10">
                        V
                      </div>
                      <span className="text-xs font-semibold text-zinc-200">Vasanth</span>
                      <span className="rounded-full bg-zinc-800/80 px-2 py-0.5 text-[9px] font-medium text-zinc-400">
                        NIT Trichy
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-500">25m ago</span>
                  </div>
                  <p className="mt-1.5 text-xs font-medium text-zinc-200">
                    Machine Learning (CS401) syllabus & notes drive
                  </p>
                  <div className="mt-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="rounded bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[10px] font-medium text-blue-400">
                        Academics
                      </span>
                      <span className="text-[10px] text-zinc-500">Campus Only</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                      <span className="inline-flex items-center gap-0.5"><ChevronUp className="h-3 w-3" /> 28</span>
                      <span className="inline-flex items-center gap-0.5"><MessageCircle className="h-3 w-3" /> 9</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.06]">
              <h3 className="text-lg font-semibold text-white">College Hubs</h3>
              <p className="text-sm text-zinc-400 mt-1">
                Private, authenticated feeds scoped strictly to your university for verified campus notices and academic discussions.
              </p>
            </div>
          </div>

          {/* Card 2: Campus Reps & Badges (Span 2) */}
          <div className="md:col-span-2 rounded-2xl border border-white/10 bg-zinc-900/50 p-6 sm:p-7 hover:border-white/25 transition group flex flex-col justify-between">
            <div>
              {/* Rep Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-medium text-zinc-400">Campus Reps</span>
                </div>
                <div className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300">
                  <TrendingUp className="h-3 w-3" />
                  <span>+280 Reps Earned</span>
                </div>
              </div>

              {/* Tier Hierarchy */}
              <div className="mt-4 space-y-2">
                {[
                  { name: "Legend", reps: "1,500+ Reps", icon: Trophy, color: "text-amber-300", bg: "bg-amber-400/10 border-amber-400/30", active: false },
                  { name: "Expert", reps: "500+ Reps", icon: Award, color: "text-purple-300", bg: "bg-purple-400/10 border-purple-400/30", active: true },
                  { name: "Contributor", reps: "100+ Reps", icon: Sparkles, color: "text-cyan-300", bg: "bg-cyan-400/10 border-cyan-400/20", active: false },
                  { name: "Amateur", reps: "0+ Reps", icon: Shield, color: "text-zinc-400", bg: "bg-zinc-800/40 border-zinc-700/30", active: false },
                ].map((tier) => (
                  <div
                    key={tier.name}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs ${tier.bg}`}
                  >
                    <div className="flex items-center gap-2">
                      <tier.icon className={`h-3.5 w-3.5 ${tier.color}`} />
                      <span className={`font-semibold ${tier.color}`}>{tier.name}</span>
                    </div>
                    {tier.active ? (
                      <span className="text-[10px] bg-purple-400/20 text-purple-300 px-1.5 py-0.5 rounded font-mono font-medium">Current Tier</span>
                    ) : (
                      <span className="text-[10px] font-mono text-zinc-500">{tier.reps}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.06]">
              <h3 className="text-lg font-semibold text-white">Campus Reps & Badges</h3>
              <p className="text-sm text-zinc-400 mt-1">
                Progress from Amateur to Legend by contributing verified solutions and answering help queries.
              </p>
            </div>
          </div>

          {/* Card 3: Nationwide Feed (Span 3) */}
          <div className="md:col-span-3 rounded-2xl border border-white/10 bg-zinc-900/50 p-6 sm:p-7 hover:border-white/25 transition group flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-white">Nationwide Student Grid</span>
                </div>
                <span className="text-[10px] rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 font-medium">
                  Across India
                </span>
              </div>

              {/* Real Cross-Campus Posts */}
              <div className="mt-4 space-y-2.5">
                <div className="rounded-xl border border-white/[0.06] bg-zinc-950/70 p-3">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-zinc-300">Meera · IIT Madras</span>
                    <span className="text-zinc-500">1h ago</span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-200 font-medium">
                    Google SWE internship timeline and interview tips
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-400">
                    <span className="rounded bg-purple-500/10 text-purple-300 px-1.5 py-0.5">Career</span>
                    <span>156 Upvotes · 41 Replies</span>
                  </div>
                </div>

                <div className="rounded-xl border border-white/[0.06] bg-zinc-950/70 p-3">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-zinc-300">Arjun · BITS Pilani</span>
                    <span className="text-zinc-500">12m ago</span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-200 font-medium">
                    Smart India Hackathon 2026: 3 spots open for AI team
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-400">
                    <span className="rounded bg-emerald-500/10 text-emerald-300 px-1.5 py-0.5">Events</span>
                    <span>67 Upvotes · 23 Replies</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex items-center gap-1.5 pt-1">
                  {["#Hackathons", "#Internships", "#Research"].map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.03] text-zinc-400 border border-white/[0.06]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.06]">
              <h3 className="text-lg font-semibold text-white">Nationwide Feed</h3>
              <p className="text-sm text-zinc-400 mt-1">
                Collaborate with students across Indian institutions on open-source projects, internships, and research.
              </p>
            </div>
          </div>

          {/* Card 4: Student Network & Peer Directory (Span 3 - Replaces Map) */}
          <div className="md:col-span-3 rounded-2xl border border-white/10 bg-zinc-900/50 p-6 sm:p-7 hover:border-white/25 transition group flex flex-col justify-between">
            <div>
              {/* Network Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-accent-bright" />
                  <span className="text-xs font-semibold text-white">Campus Network</span>
                </div>
                <span className="text-[10px] rounded bg-white/[0.04] text-zinc-400 border border-white/10 px-2 py-0.5 font-medium">
                  Peer Directory
                </span>
              </div>

              {/* Real Student Peer Cards Mockup */}
              <div className="mt-4 space-y-2.5">
                <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-zinc-950/70 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-zinc-800 text-xs font-bold text-white">
                      P
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-white">Priya</span>
                        <span className="rounded bg-cyan-400/10 border border-cyan-400/30 px-1.5 py-0.2 text-[9px] font-medium text-cyan-300">
                          Contributor (140 Reps)
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-400">IIT Bombay</span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
                    <Check className="h-3 w-3" />
                    <span>Connected</span>
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-zinc-950/70 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-zinc-800 text-xs font-bold text-white">
                      A
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-white">Arjun</span>
                        <span className="rounded bg-purple-400/10 border border-purple-400/30 px-1.5 py-0.2 text-[9px] font-medium text-purple-300">
                          Expert (620 Reps)
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-400">Vel Tech</span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-[11px] font-semibold text-zinc-950">
                    <UserPlus className="h-3 w-3" />
                    <span>Connect</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.06]">
              <h3 className="text-lg font-semibold text-white">Campus Network & Directory</h3>
              <p className="text-sm text-zinc-400 mt-1">
                Discover, connect, and collaborate with verified student peers across Indian universities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. "How Campify Works" Interactive Tab Showcase */}
      <section ref={howItWorksRef} className="py-24 px-6 max-w-6xl mx-auto border-t border-white/[0.06]">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] text-xs font-medium text-zinc-400 mb-4">
            <CheckCircle2 className="h-3.5 w-3.5 text-accent-bright" />
            <span>Structured Onboarding</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            How Campify Works
          </h2>
          <p className="mt-3 text-sm sm:text-base text-zinc-400 max-w-xl mx-auto">
            A verified, zero friction experience built for authentic university collaboration.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Step Selector Buttons (5 Cols) */}
          <div className="lg:col-span-5 space-y-3">
            {howItWorksSteps.map((step, idx) => {
              const isActive = activeStep === idx;
              return (
                <button
                  key={step.id}
                  onClick={() => handleSelectStep(idx)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all ${
                    isActive
                      ? "bg-gradient-to-b from-zinc-900/90 via-zinc-900/50 to-zinc-950/90 border-white/20"
                      : "bg-zinc-950/40 border-white/[0.06] hover:border-white/10 hover:bg-zinc-900/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-semibold text-accent-bright">
                          {step.id}
                        </span>
                        <span className="text-[11px] text-zinc-500 font-medium">{step.badge}</span>
                      </div>
                      <h4 className="text-base font-semibold text-white mt-1.5">{step.title}</h4>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{step.subtitle}</p>
                    </div>

                    {/* Circular Progress Loader on Right Center */}
                    <div className="shrink-0 flex items-center justify-center pl-2">
                      {isActive ? (
                        <div className="relative flex h-6 w-6 items-center justify-center">
                          <svg className="h-6 w-6 -rotate-90" viewBox="0 0 24 24">
                            <circle
                              cx="12"
                              cy="12"
                              r="9"
                              stroke="rgba(255,255,255,0.08)"
                              strokeWidth="2.5"
                              fill="none"
                            />
                            {isInView && !isPaused ? (
                              <motion.circle
                                key={`circle-${idx}-${activeStep}`}
                                cx="12"
                                cy="12"
                                r="9"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeDasharray="56.5"
                                initial={{ strokeDashoffset: 56.5 }}
                                animate={{ strokeDashoffset: 0 }}
                                transition={{ duration: 3.2, ease: "linear" }}
                                fill="none"
                                className="text-accent-bright"
                              />
                            ) : (
                              <circle
                                cx="12"
                                cy="12"
                                r="9"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                fill="none"
                                className="text-accent-bright"
                              />
                            )}
                          </svg>
                          <span className="absolute h-1.5 w-1.5 rounded-full bg-accent-bright" />
                        </div>
                      ) : (
                        <div className="h-6 w-6 flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-white/10" />
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Animated Preview Panel (7 Cols) */}
          <div className="lg:col-span-7">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900/85 via-zinc-900/45 to-zinc-950/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl min-h-[340px] flex flex-col justify-center">
              {/* Radial Top Spotlight Glow */}
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl"
                style={{
                  background:
                    "radial-gradient(circle at 50% 0%, rgba(120, 119, 198, 0.22), transparent 70%)",
                }}
              />
              <AnimatePresence mode="wait">
                {activeStep === 0 && (
                  <motion.div
                    key="step-0"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">Identity Verification</h4>
                        <p className="text-xs text-zinc-500">Student security check</p>
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/[0.08] bg-zinc-950/80 p-4 space-y-3 font-mono text-xs">
                      <div className="flex justify-between py-1.5 border-b border-white/[0.04]">
                        <span className="text-zinc-500">College Email</span>
                        <span className="text-zinc-200">vasanth@nitt.edu</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-white/[0.04]">
                        <span className="text-zinc-500">Domain Match</span>
                        <span className="text-emerald-400">National Institute of Tech</span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-zinc-500">Access Tier</span>
                        <span className="text-blue-400">Verified Scholar</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeStep === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">Campus Feed Unlocked</h4>
                        <p className="text-xs text-zinc-500">Filtered high-priority updates</p>
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/[0.08] bg-zinc-950/80 p-4 space-y-2.5">
                      <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        <span>Active Stream: NIT Trichy Hub</span>
                      </div>
                      <p className="text-xs text-zinc-400">
                        Connected to 1,240 verified students. Real-time updates for courses, clubs, and mess notices.
                      </p>
                    </div>
                  </motion.div>
                )}

                {activeStep === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Trophy className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">Verified Peer Reputation</h4>
                        <p className="text-xs text-zinc-500">Earned karma and recognition</p>
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/[0.08] bg-zinc-950/80 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-400">Total Upvotes Received</span>
                        <span className="text-sm font-mono font-bold text-amber-300">+280 Karma</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-amber-400 to-violet-400 h-full w-3/4 rounded-full" />
                      </div>
                      <span className="text-[11px] text-zinc-500 block text-right">
                        Level: Expert Contributor
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* 5. High-Contrast Closing CTA */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900/80 to-zinc-950 p-10 sm:p-16 text-center overflow-hidden shadow-2xl">
          {/* Radial Top Glow */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 0%, rgba(120, 119, 198, 0.22), transparent 70%)",
            }}
          />

          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white leading-tight">
              Your campus is already talking. Join in.
            </h2>
            <p className="mt-4 text-sm sm:text-base text-zinc-400 leading-relaxed">
              Experience the verified community built specifically for student collaboration, academic discussions, and inter-college networking.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-zinc-950 shadow-[0_0_25px_rgba(255,255,255,0.18)] transition-colors hover:bg-zinc-200"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
