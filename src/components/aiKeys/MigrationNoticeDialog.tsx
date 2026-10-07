import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EncryptedBadge } from "@/components/aiKeys/EncryptedBadge";
import { MaskedKey } from "@/components/aiKeys/MaskedKey";
import { useKeyPoolStatus } from "@/hooks/useKeyPoolStatus";
import api from "@/lib/api";

/**
 * One-time notice telling a user that the Gemini key(s) from their old AI
 * config were moved into the shared team pool.
 *
 * - Shown only while the server reports `migrationNotice.pending`.
 * - Acknowledged with one of exactly two buttons; Escape, outside clicks and
 *   the corner X are disabled.
 * - The acknowledgment is stored server-side. If the ack call fails, the
 *   dialog still closes for this page load and reappears on the next one.
 */
export function MigrationNoticeDialog() {
  const navigate = useNavigate();
  const { migrationNotice } = useKeyPoolStatus(true);
  // Local dismissal: survives route changes inside the dashboard, resets on reload.
  const [dismissed, setDismissed] = useState(false);
  const [acking, setAcking] = useState(false);
  const gotItRef = useRef<HTMLButtonElement>(null);

  const open = migrationNotice.pending && !dismissed;
  const plural = migrationNotice.keys.length > 1;

  const acknowledge = async () => {
    setAcking(true);
    try {
      await api.post("/ai-keys/migration-notice/ack");
    } catch {
      // Ignore: close for this page load; the notice reappears next time.
    } finally {
      setAcking(false);
      setDismissed(true);
    }
  };

  const handleGoToAiKeys = async () => {
    if (acking) return;
    await acknowledge();
    navigate("/ai-config");
  };

  const handleGotIt = async () => {
    if (acking) return;
    await acknowledge();
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-md"
        hideClose
        // Focus "Got it" on open, so the Encrypted badge tooltip doesn't pop up.
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          gotItRef.current?.focus();
        }}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {plural ? "Your Gemini keys are now in the team pool" : "Your Gemini key is now in the team pool"}
          </DialogTitle>
          <DialogDescription>
            AI setup is now shared. The {plural ? "keys" : "key"} from your old AI config{" "}
            {plural ? "have" : "has"} moved into the team pool and now help power semantic search
            and duplicate detection for everyone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-5 text-sm text-theme-text-muted">
          <div className="mt-5 mb-10">
            <div className="flex items-center justify-between gap-2 mb-1.5 px-1">
              <span className="text-[13px] font-medium text-theme-text">
                {plural ? "Your keys" : "Your key"}
              </span>
              <EncryptedBadge />
            </div>
            <div className="rounded-[10px] border border-border bg-theme-bg-hover/40 px-3.5 py-3">
              <ul className="flex flex-wrap gap-2">
                {migrationNotice.keys.map((key) => (
                  <li key={key.id}>
                    <MaskedKey hint={key.keyHint} size="sm" />
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="flex items-start gap-2">
            <Users className="mt-0.5 h-4 w-4 shrink-0 text-theme-text-dim" aria-hidden="true" />
            <span>
              {plural ? "Their" : "Its"} quota is now shared with the team pool. You can review or
              remove {plural ? "them" : "it"} anytime on AI Keys.
            </span>
          </p>
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={handleGoToAiKeys} disabled={acking}>
            Go to AI Keys
          </Button>
          <Button ref={gotItRef} type="button" onClick={handleGotIt} disabled={acking}>
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
