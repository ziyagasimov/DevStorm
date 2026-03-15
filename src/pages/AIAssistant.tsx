import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const AIAssistant = () => (
  <div className="max-w-6xl mx-auto py-12 px-8">
    <div className="flex items-center justify-center min-h-[60vh]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center mx-auto mb-6">
          <Sparkles size={32} className="text-primary" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-3">AI Community Builder</h1>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Our AI assistant will soon help you plan and grow your community automatically.
        </p>
        <span className="inline-block px-4 py-2 bg-secondary text-muted-foreground rounded-lg text-sm font-medium">
          Coming Soon
        </span>
      </motion.div>
    </div>
  </div>
);

export default AIAssistant;
