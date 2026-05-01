import { Zap } from "lucide-react";

export function Logo() {
    return (
        <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-gradient-to-br from-theme-primary to-theme-primary-dark">
                <Zap size={20} className="text-white" />
            </div>
            <div>
                <div className="text-base font-bold text-theme-text">Reviewdoo</div>
                <div className="text-[11px] text-theme-text-dim">Review Platform</div>
            </div>
        </div>
    );
}
