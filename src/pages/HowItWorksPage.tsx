// src/pages/HowItWorksPage.tsx
import { motion } from "framer-motion";
import Footer from "@/components/Footer";
import HowItWorks from "@/components/HowItWorks";
import FAQ from "@/components/FAQ";
import Navigation from "@/components/Navigation";

const HowItWorksPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <main className="pt-32">
        {/* --- Hero: Done Using? Return Without Worries (restyled) --- */}
        <section
          className="relative overflow-hidden py-20 md:py-28"
          aria-label="Done Using? Return Without Worries"
        >
          {/* Background image (keeps your original asset); adjust path if needed */}
          <div
            className="absolute inset-0 bg-center bg-cover -z-10"
            style={{
              backgroundImage: "url('/src/assets/moodboards/hero-woman-phone.jpg')",
              // optional: subtle blur fallback for smaller sizes
              backgroundRepeat: "no-repeat",
            }}
            aria-hidden
          />

          {/* Soft warm gradient overlay to match second screenshot */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-[rgba(255,250,245,0.85)] via-[rgba(255,247,240,0.6)] to-transparent -z-5"></div>

          <div className="relative max-w-6xl mx-auto px-6 md:px-8 lg:px-12 text-center">
            {/* Badge centered */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="flex justify-center"
            >
              <span
                className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-emerald-50/60 text-emerald-600 text-sm font-medium shadow-sm ring-1 ring-emerald-100"
                aria-hidden
              >
                {/* small icon */}
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
                >
                  <path d="M12 2v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 12H3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Hassle-Free Returns</span>
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="mt-8 text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight text-slate-900"
            >
              <span className="block md:inline">Done Using?</span>{" "}
              <span className="block md:inline mt-1 md:mt-0 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-fuchsia-400 to-purple-400">
                Return Without <span className="text-pink-500/90">Worries</span>
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.12 }}
              className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-slate-600"
            >
              No stress, no hassle. Just pack it up and we'll handle the rest.
            </motion.p>
          </div>
        </section>

        {/* Existing content */}
        <div className="container-custom">
          <HowItWorks />
        </div>

        <div className="bg-secondary/5 py-20">
          <FAQ />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HowItWorksPage;
