// HomePage.tsx
import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import type { Variants } from "framer-motion";
import InfiniteParallaxGallery from "../components/LandingGallery.tsx";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

export default function HomePage(): React.JSX.Element {
  const pageRef = useRef<HTMLDivElement | null>(null);

  // Hero parallax
  const { scrollYProgress } = useScroll({ target: pageRef });
  const heroY = useTransform(scrollYProgress, [0, 0.2], ["0%", "8%"]);

  // Polaroids in hero
  const polaroidRefs = [useRef(null), useRef(null), useRef(null)];
  const polaroidInViews = polaroidRefs.map((r) =>
    useInView(r as any, { once: true, amount: 0.4 })
  );

  // Carousel
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [carouselWidth, setCarouselWidth] = useState(0);
  React.useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    const total = el.scrollWidth - el.offsetWidth;
    setCarouselWidth(total > 0 ? -total : 0);
  }, []);

  // 🔥 Navbar show/hide on scroll
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const controlHeader = () => {
    if (typeof window === "undefined") return;
    if (window.scrollY > lastScrollY) {
      setShowHeader(false); // scrolling down → hide
    } else {
      setShowHeader(true); // scrolling up → show
    }
    setLastScrollY(window.scrollY);
  };

  useEffect(() => {
    window.addEventListener("scroll", controlHeader);
    return () => window.removeEventListener("scroll", controlHeader);
  }, [lastScrollY]);

  return (
    <div ref={pageRef} className="text-gray-800">
      {/* ---------- NAVBAR ---------- */}
      <header
        className={`fixed top-0 left-0 w-full z-50 bg-white/60 backdrop-blur-sm transition-transform duration-300 ${
          showHeader ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <img src="slfg.svg" alt="logo" className="w-10 h-10" />

            <div className="text-sm font-bold tracking-wider text-gray-700">
              SELFIEGRAM PHOTOSTUDIOS MALOLOS
            </div>
          </div>

          <nav className="hidden md:flex gap-8 items-center text-sm">
            <a
              href="#home"
              className="uppercase tracking-widest text-gray-700 transition-all duration-300 hover:text-black hover:-translate-y-0.5"
            >
              Home
            </a>
            <a
              href="#services"
              className="uppercase tracking-widest text-gray-700 transition-all duration-300 hover:text-black hover:-translate-y-0.5"
            >
              Services
            </a>
            <a
              href="#gallery"
              className="uppercase tracking-widest text-gray-700 transition-all duration-300 hover:text-black hover:-translate-y-0.5"
            >
              Gallery
            </a>
            <a
              href="#contacts"
              className="uppercase tracking-widest text-gray-700 transition-all duration-300 hover:text-black hover:-translate-y-0.5"
            >
              Contacts
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <button
              className="px-4 py-2 rounded-full bg-black text-white text-sm font-medium hover:scale-[1.02] transform transition shadow-sm hover:shadow-lg"
              onClick={() => {
                window.location.href = "/login";
              }}
            >
              Sign In
            </button>
          </div>

          {/* Mobile menu icon */}
          <div className="md:hidden">
            <button className="w-10 h-10 rounded-md border border-gray-200 bg-white text-gray-800">
              ☰
            </button>
          </div>
        </div>
      </header>

      {/* ---------- HERO ---------- */}
      <main className="pt-20">
        <section
          id="home"
          className="min-h-screen relative overflow-hidden bg-gradient-to-b from-white to-gray-200"
        >
          <h1
            className="absolute inset-0 flex items-center justify-center 
             font-extrabold tracking-tight text-gray-300 
             select-none pointer-events-none z-0 mb-70"
            style={{
              fontSize: "27vw", // scales with screen width
              lineHeight: "1",
              whiteSpace: "nowrap",
              width: "100vw",
              textAlign: "center",
            }}
          >
            selfigram
          </h1>

          {/* soft background blur / gradient */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute -left-40 -top-40 w-[600px] h-[600px] bg-gradient-to-tr from-pink-200/30 to-purple-200/20 rounded-full blur-3xl opacity-60" />
          </div>

          {/* Foreground content */}
          <div className="max-w-7xl mx-auto px-6 lg:px-20 py-24 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* LEFT: Polaroid art */}
              <div className="relative h-[420px] flex items-center justify-center">
                {/* big blurred shadow behind */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-80 h-60 rounded-2xl bg-white/60 blur-xl opacity-40 transform rotate-[8deg]" />
                </div>

                {/* polaroid 1 */}
                <motion.img
                  ref={polaroidRefs[0] as any}
                  src="../storage\packages\conceptstudio\cstudio4.jpg"
                  alt="Polaroid 1"
                  initial={{ opacity: 0, y: -60, rotate: -12, scale: 1.05 }}
                  animate={polaroidInViews[0] ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  whileHover={{ scale: 1.03, y: -4 }}
                  className="absolute w-56 sm:w-72 rounded-xl shadow-[0_30px_60px_rgba(0,0,0,0.12)]"
                  style={{
                    left: "0%",
                    top: "12%",
                    transformOrigin: "left center",
                  }}
                />

                {/* polaroid 2 rotated */}
                <motion.img
                  ref={polaroidRefs[1] as any}
                  src="../storage\packages\selfieforone\sone1.png"
                  alt="Polaroid 2"
                  initial={{ opacity: 0, y: -30, rotate: 8, scale: 1 }}
                  animate={polaroidInViews[1] ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: 0.12, ease: "easeOut" }}
                  whileHover={{ scale: 1.02, y: -6 }}
                  className="absolute w-60 sm:w-80 rounded-xl shadow-[0_40px_80px_rgba(0,0,0,0.12)]"
                  style={{
                    left: "38%",
                    top: "6%",
                    transformOrigin: "center center",
                  }}
                />

                {/* polaroid blurred background "floating" */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 0.12, scale: 1.05 }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                  className="absolute w-72 h-40 rounded-2xl bg-white blur-[18px]"
                  style={{ left: "10%", top: "36%" }}
                />
              </div>

              {/* RIGHT: Text block */}
              <motion.div
                style={{ y: heroY }}
                className="max-w-xl mx-auto lg:mx-0 text-left relative z-10"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.25 }}
                variants={staggerContainer}
              >
                <motion.h2
                  variants={fadeUp}
                  className="text-2xl lg:text-3xl font-extrabold leading-tight tracking-tight"
                >
                  WELCOME TO BULACAN'S BIGGEST AND GRANDEST PHOTO STUDIO
                </motion.h2>

                <motion.p
                  variants={fadeUp}
                  className="mt-6 text-gray-600 leading-relaxed"
                >
                  Where creativity meets quality! Step into a world of themed
                  studios...
                </motion.p>

                <motion.div variants={fadeUp} className="mt-8">
                  <button
                    onClick={() => {
                      window.location.href = "/login";
                    }}
                    className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white text-gray-800 shadow-md hover:shadow-2xl border border-gray-100 transition transform hover:-translate-y-0.5"
                  >
                    Book Now →
                  </button>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ---------- STORY + VISION ---------- */}
        <section className=" min-h-screen mx-auto px-6 lg:px-20 pb-14 bg-gray-200">
          <div className="grid gap-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 px-20 grid md:grid-cols-2 items-center">
              {/* Story text */}
              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.25 }}
                variants={staggerContainer}
                className="p-2"
              >
                <motion.h3
                  variants={fadeUp}
                  className="text-2xl font-bold mb-3 text-right"
                >
                  Our Story
                </motion.h3>
                <motion.p
                  variants={fadeUp}
                  className="text-gray-600 leading-relaxed text-right"
                >
                  SelfieGram was established in December 2022 by Elizabeth
                  Ortega with a vision to transform photography in Bulacan. We
                  are proud to be the largest, most creatively themed photo
                  studio in the area, offering a unique and immersive experience
                  for capturing memories.
                </motion.p>
              </motion.div>

              {/* images cluster */}
              <motion.div
                className="p-2 flex items-center justify-center relative"
                variants={fadeUp as any}
              >
                <div className="relative w-full max-w-[360px]">
                  <img
                    src="../storage\packages\studiorental\studio3.jpg"
                    alt="story-main"
                    className="rounded-xl shadow-xl w-full"
                    style={{ transform: "translateY(-6px)" }}
                  />
                </div>
              </motion.div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 px-20 grid md:grid-cols-2 items-center">
              {/* images cluster */}
              <motion.div
                className="p-2 flex items-center justify-center relative"
                variants={fadeUp as any}
              >
                <div className="relative w-full max-w-[360px]">
                  <img
                    src="../storage\packages\studiorental\studio2.jpg"
                    alt="vision-main"
                    className="rounded-xl shadow-xl w-full"
                  />
                </div>
              </motion.div>

              {/* Vision text */}
              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.25 }}
                variants={staggerContainer}
                className="p-2"
              >
                <motion.h3
                  variants={fadeUp}
                  className="text-2xl font-bold mb-3"
                >
                  Our Vision
                </motion.h3>
                <motion.p
                  variants={fadeUp}
                  className="text-gray-600 leading-relaxed"
                >
                  At SelfieGram, our mission is to create a welcoming and
                  inspiring space where clients feel free to express themselves.
                  We believe that each photo session should be as memorable as
                  the images it produces. Our goal is to make every session a
                  reflection of our clients’ personalities and moments.
                </motion.p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ---------- SERVICES ---------- */}
        <section
          id="services"
          className="min-h-screen max-w-7xl mx-auto px-6 lg:px-20 py-14"
        >
          <div className="text-center mb-10">
            <h3 className="text-3xl font-bold">Our Services</h3>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left: layered floating images */}
            <div className="relative h-96 flex items-center justify-center">
              <motion.img
                src="/storage\packages\selfiefortwo\stwo3.png"
                alt="svc-1"
                initial={{ rotate: -8, y: 40, opacity: 0 }}
                whileInView={{ rotate: -8, y: 0, opacity: 1 }}
                transition={{ duration: 0.7 }}
                className="absolute w-64 rounded-lg shadow-2xl"
                style={{ left: "-10%", top: "12%" }}
              />
              <motion.img
                src="/storage\packages\selfiefortwo\stwo5.png"
                alt="svc-2"
                initial={{ rotate: 6, y: 40, opacity: 0 }}
                whileInView={{ rotate: 6, y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="absolute w-64 rounded-lg shadow-2xl"
                style={{ left: "20%", top: "39%" }}
              />
              <motion.img
                src="/storage\packages\conceptstudio\cstudio3.jpg"
                alt="svc-3"
                initial={{ rotate: -2, y: 50, opacity: 0 }}
                whileInView={{ rotate: -2, y: 0, opacity: 1 }}
                transition={{ duration: 0.9, delay: 0.18 }}
                className="absolute w-56 rounded-lg shadow-2xl"
                style={{ left: "55%", top: "3%" }}
              />
            </div>

            {/* Right: text blocks */}
            <div className="space-y-6">
              <motion.h4
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-xl font-bold"
              >
                Tailored Photography Options
              </motion.h4>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-gray-600"
              >
                We offer flexible options that cater to every preference,
                ensuring a personalized experience that suits each client's
                style and vision.
              </motion.p>

              <motion.h4
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-xl font-bold mt-4"
              >
                Self-Shoot Sessions
              </motion.h4>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-gray-600"
              >
                Self-shoot sessions provide complete control over your
                photography experience so you can experiment and capture moments
                at your own pace.
              </motion.p>

              <motion.h4
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-xl font-bold mt-4"
              >
                Professional Photographer Sessions
              </motion.h4>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-gray-600"
              >
                Our team of experienced photographers provides guidance and
                expertise to ensure polished, stunning images.
              </motion.p>
            </div>
          </div>
        </section>

        {/* ---------- CONCEPT STUDIO (DRAG CAROUSEL) ---------- */}
        <section id="studio" className=" bg-white">
          <div className="min-h-screen max-w-7xl mx-auto px-6 lg:px-20">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold">Our Concept Studio</h3>
              <p className="text-gray-600 max-w-2xl mx-auto mt-3">
                We offer a wide variety of themed studio booths designed to
                inspire creativity and suit each client's unique style.
              </p>
            </div>

            {/* Carousel */}
            <div className="relative">
              <div className="overflow-hidden h-fit">
                <motion.div
                  ref={carouselRef as any}
                  drag="x"
                  dragConstraints={{ left: carouselWidth, right: 0 }}
                  className="flex gap-6 py-6 px-6 items-center"
                  whileTap={{ cursor: "grabbing" }}
                >
                  {Array.from({ length: 3 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="min-w-[320px] md:min-w-[420px] rounded-lg overflow-hidden shadow-2xl bg-white"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <img
                        src="/slfg-placeholder.png"
                        alt={`studio-${i}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="p-4 text-sm text-gray-700">
                        Studio Theme {i + 1}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- PHOTO GALLERY ---------- */}
        <section id="gallery" className="min-h-screen  mx-auto lg: py-14">
          <h3 className="text-3xl text-center font-bold mb-8">Photo Gallery</h3>

          <InfiniteParallaxGallery />
        </section>

        {/* ---------- FOOTER ---------- */}
        <footer id="contacts" className="mt-10 bg-[#212121] text-gray-200">
          <div className="max-w-7xl mx-auto px-6 lg:px-20 py-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-2xl font-bold text-white">SelfieGram</div>
              <p className="text-gray-400 mt-3">
                © {new Date().getFullYear()} SelfieGram. All rights reserved.
              </p>
            </div>

            <div className="text-sm text-gray-300">
              <div className="font-semibold mb-3">Information</div>
              <div className="space-y-2">
                <div>Home</div>
                <div>Gallery</div>
                <div>Contacts</div>
              </div>
            </div>

            <div className="text-sm text-gray-300">
              <div className="font-semibold mb-3">Contacts</div>
              <div className="space-y-2 text-gray-400">
                <div>
                  3rd Floor Kim Kor Building F Estrella St., Malolos,
                  Philippines
                </div>
                <div>+63 998 855 6035</div>
                <div>selfiegrammalolos@gmail.com</div>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
