import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/lib/context";
import { X } from "lucide-react";

const ICONS = ["🎹", "✏️", "💻", "📝", "🎸", "📷", "🎨", "🏋️", "🧘", "📚", "🎯", "🔬"];

interface AddSkillModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddSkillModal({ open, onClose }: AddSkillModalProps) {
  const { addSkill } = useApp();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("🎯");

  function handleSubmit() {
    if (!name.trim()) return;
    addSkill(name.trim(), icon);
    setName("");
    setIcon("🎯");
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
            className="fixed bottom-0 left-0 right-0 md:bottom-auto md:top-1/2 md:left-1/2 md:right-auto md:-translate-x-1/2 md:-translate-y-1/2 z-50 w-full md:max-w-md"
          >
            <div className="bg-card border border-border rounded-t-3xl md:rounded-3xl p-8">
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
