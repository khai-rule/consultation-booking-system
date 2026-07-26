import { cn } from "@/lib/cn";
import { BookingStatus } from "@/lib/types";

const STATUS_STYLES: Record<BookingStatus, string> = {
  pending:   "bg-status-pending-bg   text-status-pending-fg",
  confirmed: "bg-status-confirmed-bg text-status-confirmed-fg",
  completed: "bg-status-completed-bg text-status-completed-fg",
  cancelled: "bg-status-cancelled-bg text-status-cancelled-fg",
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2.5 py-0.5 text-label font-medium capitalize",
        STATUS_STYLES[status]
      )}
    >
      {status}
    </span>
  );
}

