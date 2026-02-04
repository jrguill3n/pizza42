"use client";

import { Fingerprint } from "lucide-react";

export function PasskeysRoadmapCallout() {
  return (
    <div className="glass rounded-2xl p-6 border border-accent/20">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
          <Fingerprint className="w-6 h-6 text-accent" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-foreground">Futuro: Passkeys</h3>
            <div className="px-2 py-0.5 rounded-full bg-accent/20 text-accent text-xs font-medium">
              Roadmap
            </div>
          </div>

          <p className="text-muted-foreground text-sm leading-relaxed">
            Autenticación sin contraseña mediante biometría.
            Estrategia mobile-first con fallback a Google y email/password.
          </p>


        </div>
      </div>
    </div>
  );
}
