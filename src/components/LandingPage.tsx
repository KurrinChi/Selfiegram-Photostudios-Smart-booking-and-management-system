// HomePage.tsx
import React, { useRef, useState, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useInView,
} from "framer-motion";
import type { Variants } from "framer-motion";
import InfiniteParallaxGallery from "../components/LandingGallery.tsx";
import TagEmbedWidget from "./Embed/TagEmbedWidget.tsx";

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
  const polaroidRefs = [
    useRef<HTMLImageElement | null>(null),
    useRef<HTMLImageElement | null>(null),
    useRef<HTMLImageElement | null>(null),
  ];
  const polaroidInViews = polaroidRefs.map((r) =>
    useInView(r as any, { once: true, amount: 0.4 })
  );

  // Carousel
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [carouselWidth, setCarouselWidth] = useState(0);

  useEffect(() => {
    const updateWidth = () => {
      const el = carouselRef.current;
      if (!el) return;
      const total = el.scrollWidth - el.offsetWidth;
      setCarouselWidth(total > 0 ? -total : 0);
    };

    updateWidth();

    // Resize observer and image load listeners to recalc when content changes
    const ro = (window as any).ResizeObserver
      ? new (window as any).ResizeObserver(updateWidth)
      : null;
    if (ro && carouselRef.current) ro.observe(carouselRef.current);

    window.addEventListener("resize", updateWidth);

    const images: HTMLImageElement[] = carouselRef.current
      ? (Array.from(
          carouselRef.current.querySelectorAll("img")
        ) as HTMLImageElement[])
      : [];
    images.forEach((img) => {
      if (!img.complete) img.addEventListener("load", updateWidth);
    });

    return () => {
      window.removeEventListener("resize", updateWidth);
      images.forEach((img) => img.removeEventListener("load", updateWidth));
      if (ro && carouselRef.current) ro.disconnect();
    };
  }, []);

  // 🔥 Navbar show/hide on scroll (using ref for previous scroll to avoid re-adding listeners)
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    const controlHeader = () => {
      if (typeof window === "undefined") return;
      const current = window.scrollY;
      // small threshold to avoid jitter
      const threshold = 10;
      if (current > lastScrollYRef.current + threshold) {
        setShowHeader(false); // scrolling down → hide
      } else if (current < lastScrollYRef.current - threshold) {
        setShowHeader(true); // scrolling up → show
      }
      lastScrollYRef.current = current;
    };
    window.addEventListener("scroll", controlHeader);
    return () => window.removeEventListener("scroll", controlHeader);
  }, []);

  // Mobile menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    const headerOffset = 80; // height of your fixed header
    const elementPosition = el.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  return (
    <div ref={pageRef} className="text-gray-800">
      {/* ---------- NAVBAR ---------- */}
      <header
        className={`fixed top-0 left-0 w-full z-50 backdrop-blur-sm transition-transform duration-300 ${
          showHeader
            ? "translate-y-0 shadow-md bg-white/70"
            : "-translate-y-full"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <img src="/slfg.svg" alt="logo" className="w-10 h-10" />

            <div className="text-sm font-bold tracking-wider text-gray-700">
              SELFIEGRAM PHOTOSTUDIOS MALOLOS
            </div>
          </div>

          <nav className="hidden md:flex gap-8 items-center text-sm">
            <button
              onClick={() => scrollToSection("home")}
              className="uppercase tracking-widest text-gray-700 transition-all duration-300 hover:text-black hover:-translate-y-0.5"
              aria-label="Go to Home"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection("services")}
              className="uppercase tracking-widest text-gray-700 transition-all duration-300 hover:text-black hover:-translate-y-0.5"
              aria-label="Go to Services"
            >
              Services
            </button>
            <button
              onClick={() => scrollToSection("gallery")}
              className="uppercase tracking-widest text-gray-700 transition-all duration-300 hover:text-black hover:-translate-y-0.5"
              aria-label="Go to Gallery"
            >
              Gallery
            </button>
            <button
              onClick={() => scrollToSection("contacts")}
              className="uppercase tracking-widest text-gray-700 transition-all duration-300 hover:text-black hover:-translate-y-0.5"
              aria-label="Go to Contacts"
            >
              Contacts
            </button>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <button
              className="px-4 py-2 rounded-full bg-black text-white text-sm font-medium hover:scale-[1.02] transform transition shadow-sm hover:shadow-lg"
              onClick={() => {
                window.location.href = "/login";
              }}
              aria-label="Sign In"
            >
              Sign In
            </button>
          </div>

          {/* Mobile menu icon */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen((s) => !s)}
              className="w-10 h-10 rounded-md border border-gray-200 bg-white text-gray-800"
              aria-label="Toggle menu"
            >
              ☰
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden bg-white shadow-lg px-6 py-4 space-y-3"
            >
              {[
                { id: "home", label: "Home" },
                { id: "services", label: "Services" },
                { id: "gallery", label: "Gallery" },
                { id: "contacts", label: "Contacts" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="block w-full text-left uppercase tracking-widest text-gray-700 hover:text-black"
                >
                  {item.label}
                </button>
              ))}

              <button
                onClick={() => (window.location.href = "/login")}
                className="block w-full px-4 py-2 rounded-full bg-black text-white text-sm font-medium"
              >
                Sign In
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ---------- HERO ---------- */}
      <main className="pt-20">
        <section
          id="home"
          className="scroll-mt-32 min-h-screen relative overflow-hidden bg-gradient-to-b from-white to-gray-200"
        >
          {/* Big background wordmark */}
          <h1
            className="absolute inset-0 flex items-center justify-center 
        font-extrabold tracking-tight text-gray-200 
        select-none pointer-events-none z-0"
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

          <motion.h1
            className="absolute inset-0 flex items-center justify-center font-extrabold tracking-tight text-gray-300 select-none pointer-events-none z-0 mb-70 text-[20vw] sm:text-[24vw] lg:text-[27vw] leading-none whitespace-nowrap"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 0.12, y: 0 }}
            transition={{ duration: 1.2 }}
          >
            selfigram
          </motion.h1>

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
                  src="/storage/packages/conceptstudio/cstudio4.jpg"
                  alt="Polaroid 1"
                  initial={{ opacity: 0, y: -60, rotate: -12, scale: 1.05 }}
                  animate={polaroidInViews[0] ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  whileHover={{ scale: 1.03, y: -4, rotate: -8 }}
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
                  src="/storage/packages/selfieforone/sone1.png"
                  alt="Polaroid 2"
                  initial={{ opacity: 0, y: -30, rotate: 8, scale: 1 }}
                  animate={polaroidInViews[1] ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: 0.12, ease: "easeOut" }}
                  whileHover={{ scale: 1.02, y: -6, rotate: 6 }}
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

        {/* ---------- STORY + VISION + PLACEHOLDER ---------- */}
        <section className=" bg-white ">
          <div className="bg-gray-200 w-full rounded-b-[5rem] mx-auto px-6 lg:px-20 pb-20">
            <div className="grid gap-8 lg:grid-cols-2 lg:grid-rows-2 lg:gap-6">
              {/* Story card (1) */}
              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.25 }}
                variants={staggerContainer}
                className="bg-white rounded-2xl shadow-lg p-8 flex flex-col lg:flex-row gap-4 lg:col-start-1  lg:row-start-1"
              >
                {/* Text */}
                <div className="flex-1 flex flex-col justify-center">
                  <motion.h3
                    variants={fadeUp}
                    className="text-2xl font-bold mb-3"
                  >
                    Our Story
                  </motion.h3>
                  <motion.p
                    variants={fadeUp}
                    className="text-gray-600 leading-relaxed"
                  >
                    SelfieGram was established in December 2022 by Elizabeth
                    Ortega with a vision to transform photography in Bulacan. We
                    are proud to be the largest, most creatively themed photo
                    studio in the area, offering a unique and immersive
                    experience for capturing memories.
                  </motion.p>
                </div>

                {/* Image */}
                <motion.div
                  className="flex-1 flex items-center justify-center"
                  variants={fadeUp as any}
                >
                  <img
                    src="/storage/packages/studiorental/studio3.jpg"
                    alt="story-main"
                    className="rounded-xl shadow-xl w-full max-w-[360px]"
                  />
                </motion.div>
              </motion.div>

              {/* Vision card (2) */}
              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.25 }}
                variants={staggerContainer}
                className="bg-white rounded-2xl shadow-lg p-8 flex flex-col lg:flex-row-reverse gap-4 lg:col-start-1 lg:row-start-2"
              >
                {/* Text */}
                <div className="flex-1 flex flex-col justify-center">
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
                    inspiring space where clients feel free to express
                    themselves. We believe that each photo session should be as
                    memorable as the images it produces. Our goal is to make
                    every session a reflection of our clients’ personalities and
                    moments.
                  </motion.p>
                </div>

                {/* Image */}
                <motion.div
                  className="flex-1 flex items-center justify-center"
                  variants={fadeUp as any}
                >
                  <img
                    src="/storage/packages/studiorental/studio2.jpg"
                    alt="vision-main"
                    className="rounded-xl shadow-xl w-full max-w-[360px]"
                  />
                </motion.div>
              </motion.div>

              {/* Placeholder card (3) spanning 2 rows */}
              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.25 }}
                variants={staggerContainer}
                className="bg-white rounded-2xl shadow-lg p-8 lg:col-start-2 lg:col-span-2 lg:row-start-1 lg:row-span-2 flex flex-col items-center justify-start gap-4"
              >
                {/* Header */}
                <motion.div
                  className="w-full flex justify-center"
                  variants={fadeUp}
                >
                  <motion.h3
                    variants={fadeUp}
                    className="text-2xl font-bold mb-4"
                  >
                    Announcements
                  </motion.h3>
                </motion.div>

                <motion.div
                  className="w-full max-w-[700px] max-h-[700px] overflow-y-auto"
                  variants={fadeUp}
                >
                  <TagEmbedWidget height={700} />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ---------- SERVICES ---------- */}
        <section
          id="services"
          className="relative scroll-mt-32 min-h-screen py-14 overflow-hidden"
        >
          {/* Background scattered static polaroids (full width) */}
          <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
            {[
              {
                src: "/slfg-placeholder-1.png",
                left: "5%",
                top: "40%",
                size: "w-48",
                rotate: "-12deg",
              },
              {
                src: "/storage/packages/selfiefortwo/stwo3.png",
                left: "20%",
                top: "40%",
                size: "w-54",
                rotate: "8deg",
              },
              {
                src: "/storage/packages/conceptstudio/cstudio3.jpg",
                left: "55%",
                top: "15%",
                size: "w-60",
                rotate: "-6deg",
              },
              {
                src: "/storage/packages/selfiefortwo/stwo5.png",
                left: "70%",
                top: "55%",
                size: "w-40",
                rotate: "46deg",
              },
              {
                src: "/storage/packages/studiorental/studio2.jpg",
                left: "85%",
                top: "25%",
                size: "w-28",
                rotate: "-10deg",
              },
            ].map((img, i) => (
              <img
                key={i}
                src={img.src}
                alt={`bg-polaroid-${i}`}
                className={`absolute opacity-30 blur-sm rounded-lg shadow-lg ${img.size}`}
                style={{
                  left: img.left,
                  top: img.top,
                  transform: `rotate(${img.rotate})`,
                }}
              />
            ))}
          </div>

          {/* Foreground content (aligned with max width) */}
          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-20">
            <div className="text-center mb-10">
              <h3 className="text-3xl font-bold">Our Services</h3>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {/* Left: layered floating images */}
              <div className="relative h-96 flex items-center justify-center">
                <motion.img
                  src="/storage/packages/selfiefortwo/stwo3.png"
                  alt="svc-1"
                  initial={{ rotate: -8, y: 40, opacity: 0 }}
                  whileInView={{ rotate: -8, y: 0, opacity: 1 }}
                  transition={{ duration: 0.7 }}
                  className="absolute w-64 rounded-lg shadow-2xl"
                  style={{ left: "-10%", top: "12%" }}
                />
                <motion.img
                  src="/storage/packages/selfiefortwo/stwo5.png"
                  alt="svc-2"
                  initial={{ rotate: 6, y: 40, opacity: 0 }}
                  whileInView={{ rotate: 6, y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className="absolute w-64 rounded-lg shadow-2xl"
                  style={{ left: "20%", top: "39%" }}
                />
                <motion.img
                  src="/storage/packages/conceptstudio/cstudio3.jpg"
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
                  photography experience so you can experiment and capture
                  moments at your own pace.
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
          </div>
        </section>

        {/* ---------- CONCEPT STUDIO (DRAG CAROUSEL) ---------- */}
        <section id="studio" className="bg-white">
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
                  {Array.from({ length: 6 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="min-w-[320px] md:min-w-[420px] rounded-lg overflow-hidden bg-gray-200 "
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
        <section
          id="gallery"
          className="scroll-mt-20 min-h-screen mx-auto py-14"
        >
          <h3 className="text-3xl text-center font-bold mb-8">Photo Gallery</h3>

          <InfiniteParallaxGallery />
        </section>

        {/* ---------- FOOTER ---------- */}
        <footer id="contacts" className="mt-10 bg-[#212121] text-gray-200">
          <div className="max-w-7xl mx-auto px-6 lg:px-20 py-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Branding */}
            <div>
              <div className="text-2xl font-bold text-white">SelfieGram</div>
              <p className="text-gray-400 mt-3">
                © {new Date().getFullYear()} SelfieGram. All rights reserved.
              </p>
            </div>

            {/* Navigation */}
            <div className="text-sm text-gray-300">
              <div className="font-semibold mb-3">Information</div>
              <div className="space-y-2">
                <button
                  onClick={() => scrollToSection("home")}
                  className="block uppercase tracking-widest hover:text-white transition-colors"
                >
                  Home
                </button>
                <button
                  onClick={() => scrollToSection("gallery")}
                  className="block uppercase tracking-widest hover:text-white transition-colors"
                >
                  Gallery
                </button>
                <button
                  onClick={() => scrollToSection("contacts")}
                  className="block uppercase tracking-widest hover:text-white transition-colors"
                >
                  Contacts
                </button>
              </div>
            </div>

            {/* Contact Info */}
            <div className="text-sm text-gray-300">
              <div className="font-semibold mb-3">Contacts</div>
              <div className="space-y-2 text-gray-400">
                <div>
                  3rd Floor Kim Kor Building F Estrella St., Malolos,
                  Philippines
                </div>
                <div>
                  <a href="tel:+639988556035" className="hover:text-white">
                    +63 998 855 6035
                  </a>
                </div>
                <div>
                  <a
                    href="mailto:selfiegrammalolos@gmail.com"
                    className="hover:text-white"
                  >
                    selfiegrammalolos@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
