import { motion } from "framer-motion";

export default function MaintenancePage({ title = "Page under maintenance" }) {
  return (
    <div className="pt-28 pb-20 min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
          className="text-7xl mb-6"
        >
          ☕️
        </motion.div>
        <h1 className="font-heading font-black text-3xl tracking-tighter mb-2">Get a Coffee</h1>
        <p className="text-muted-foreground text-sm mb-2">{title}</p>
        <p className="text-muted-foreground text-xs">We're brewing something great. Check back soon!</p>
      </div>
    </div>
  );
}
