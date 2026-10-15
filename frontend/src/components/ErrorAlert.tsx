import { X } from "lucide-react";

export function ErrorAlert({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  if (!message) return null;
  return (
    <div className="error" role="alert">
      {message}
      <button onClick={onDismiss} aria-label="Dismiss error">
        <X size={16} />
      </button>
    </div>
  );
}
