import { motion } from "framer-motion";

export default function ComingSoonPage({ title = "Coming Soon", description = "This feature is being built" }) {
  return (
    <div className="pt-28 pb-20 min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <motion.div
          animate={{ rotate: [0, -8, 8, -8, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 0.5 }}
          className="text-7xl mb-6"
        >
          ☕️
        </motion.div>
        <div className="text-xs uppercase tracking-[0.2em] font-semibold text-primary mb-3">Get a Coffee</div>
        <h1 className="font-heading font-black text-4xl tracking-tighter mb-3">{title}</h1>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </div>
  );
}
