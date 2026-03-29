import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/lib/context";
import { X } from "lucide-react";
import { SKILL_COLOR_OPTIONS } from "@/lib/skillColors";

const ICONS = [
  "🎯", "💻", "🎹", "🎸", "🎻", "🥁", "🎤", "📝", "✍️", "📚", "📷", "🎨", "🎬", "🧠", "🔬", "🧪", "🧮", "⚙️", "🏋️", "🏃", "🧘", "🥊", "♟️", "🧑‍🍳", "🪴", "🗣️", "🧵", "🧰", "🛰️", "🧭",
];

interface AddSkillModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddSkillModal({ open, onClose }: AddSkillModalProps) {
  const { addSkill } = useApp();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("🎯");
  const [color, setColor] = useState(SKILL_COLOR_OPTIONS[0]);

  function handleSubmit() {
    if (!name.trim()) return;
    addSkill(name.trim(), icon, color);
    setName("");
    setIcon("🎯");
    setColor(SKILL_COLOR_OPTIONS[0]);
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-foreground/10 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6"
          >
            <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 md:p-8 max-h-[calc(100vh-1.5rem)] md:max-h-[90vh] overflow-y-auto overscroll-contain">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-display text-xl font-semibold">New skill</h2>
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1">
                  <X size={18} />
                </button>
              </div>

              {/* Icon picker */}
              <div className="mb-6">
                <label className="text-sm text-muted-foreground block mb-3">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map((i) => (
                    <button
                      key={i}
                      onClick={() => setIcon(i)}
                      className={`w-10 h-10 rounded-inner flex items-center justify-center text-lg transition-all border ${
                        icon === i ? "border-primary bg-primary/10" : "border-border hover:border-foreground/20"
                      }`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="text-sm text-muted-foreground block mb-3">Color</label>
                <div className="flex flex-wrap gap-2">
                  {SKILL_COLOR_OPTIONS.map((option) => (
                    <button
                      key={option}
                      onClick={() => setColor(option)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        color === option ? "border-foreground scale-105" : "border-transparent hover:scale-105"
                      }`}
                      style={{ backgroundColor: option }}
                      aria-label={`Choose color ${option}`}
                    />
                  ))}
                </div>
              </div>

              {/* Name */}
              <div className="mb-8">
                <label className="text-sm text-muted-foreground block mb-2">Skill name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Guitar, Painting, Chess..."
                  className="w-full bg-background border border-border rounded-inner px-4 py-3 text-sm placeholder:text-muted-foreground/50"
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={!name.trim()}
                className="w-full bg-primary text-primary-foreground rounded-inner py-3.5 font-medium text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
              >
                Add skill
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
