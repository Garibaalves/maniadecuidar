import { PawPrint } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background/60">
      <div className="flex items-center gap-3 rounded-full border border-border/70 bg-white/80 px-4 py-3 shadow-soft">
        <PawPrint className="h-5 w-5 text-brand-primary animate-pulse" />
        <span className="text-sm font-semibold text-brand-deep">
          Carregando experiência Mania de Cuidar...
        </span>
      </div>
    </div>
  );
}
