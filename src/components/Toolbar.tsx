import { Link } from "react-router-dom";
import { ProfileDropdown } from "./ProfileDropdown";
import type { Session } from "./MyMap";
import type { WaterType } from "@/types";
import { WATER_TYPE_LABELS } from "@/types";

interface ToolbarProps {
  activeWaterType: WaterType;
  onWaterTypeChange: (type: WaterType) => void;
  sessionHistory?: Session[];
  onHistoryItemClick?: (markerId: string) => void;
  onRejectedSessionClick?: (sessionId: string) => void;
  isProcessingSubmit?: boolean;
}

// Mock user data - replace with actual user data from your auth system
const mockUser = {
  name: "Hardik Sharma",
  email: "hardik.sharma@example.com",
  phone: "+91 98765 43210",
  userId: "WQA-2024-0042",
};

export function Toolbar({
  activeWaterType,
  onWaterTypeChange,
  sessionHistory = [],
  onHistoryItemClick,
  onRejectedSessionClick,
  isProcessingSubmit,
}: ToolbarProps) {
  return (
    <header className="w-full border-b border-border bg-card">
      <div className="flex items-center justify-between h-14 px-6">
        <div className="flex items-center gap-6">
          <div className="font-semibold text-lg">Water Quality Monitor</div>
          <nav className="flex items-center gap-1" aria-label="Water type">
            {(["ponds", "river", "lake"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => onWaterTypeChange(type)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeWaterType === type
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {WATER_TYPE_LABELS[type]}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/admin"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Admin
          </Link>
          <ProfileDropdown
            user={mockUser}
            history={sessionHistory}
            onHistoryItemClick={onHistoryItemClick}
            onRejectedSessionClick={onRejectedSessionClick}
            isProcessingSubmit={isProcessingSubmit}
          />
        </div>
      </div>
    </header>
  );
}
