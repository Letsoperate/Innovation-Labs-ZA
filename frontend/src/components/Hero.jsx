import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { ArrowRight, Lightning, Sparkle, Rocket } from "@phosphor-icons/react";

export default function Hero({ stats }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -180]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.2]);

  return (
    <section
      ref={ref}
      className="relative pt-32 pb-20 lg:pt-44 lg:pb-32 overflow-hidden bg-grid"
      data-testid="hero-section"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background pointer-events-none" />

      {/* Floating accent shapes */}
      <motion.div
        style={{ y: y3 }}
        className="absolute top-32 right-[5%] w-24 h-24 border border-primary/40 hidden lg:block"
        aria-hidden
      />
      <motion.div
        style={{ y: y2 }}
        className="absolute top-64 right-[15%] w-3 h-3 bg-primary hidden lg:block"
        aria-hidden
      />
      <motion.div
        style={{ y: y1 }}
        className="absolute top-48 left-[8%] w-2 h-24 bg-foreground hidden lg:block"
        aria-hidden
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div style={{ opacity }} className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 border border-border bg-secondary/60 text-xs uppercase tracking-[0.2em] font-semibold mb-8"
            data-testid="hero-badge"
          >
            <Sparkle size={12} weight="fill" className="text-primary" />
            Product Discovery Platform
          </motion.div>

          <h1 className="font-heading font-black text-5xl sm:text-6xl lg:text-7xl xl:text-8xl tracking-tighter leading-[0.95]">
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="block"
            >
              Ship.
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="block"
            >
              Get <span className="text-primary">discovered.</span>
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="block text-stroke"
            >
              Stay relevant.
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg sm:text-xl text-muted-foreground mt-8 max-w-2xl leading-relaxed"
            data-testid="hero-subtitle"
          >
            The product discovery platform built for makers who care about long-term visibility — not
            just launch day. Showcase your projects with structured data, gain community traction, and
            find your people.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="flex flex-wrap items-center gap-3 mt-10"
          >
            <Link to="/submit">
              <Button
                size="lg"
                data-testid="hero-cta-submit"
                className="bg-primary hover:bg-primary/90 text-white rounded-sm h-12 px-6 gap-2 group"
              >
                <Rocket size={18} weight="fill" />
                Submit your project
                <ArrowRight size={16} weight="bold" className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/discover">
              <Button
                size="lg"
                variant="outline"
                data-testid="hero-cta-discover"
                className="rounded-sm h-12 px-6 border-foreground/20 hover:bg-foreground hover:text-background"
              >
                Discover projects
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
