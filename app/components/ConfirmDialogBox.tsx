import { useEffect, type ReactNode } from "react";

type Props = {
  open: boolean;
  title: string;
  description: string;
  onCancel: () => void;
  children: ReactNode; // the confirm action (a submit button inside a Form)
};

const ConfirmDialog = ({
  open,
  title,
  description,
  onCancel,
  children,
}: Props) => {
  // close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-title" className="text-lg font-semibold mb-2">
          {title}
        </h2>
        <p className="text-gray-600 mb-6">{description}</p>

        <div className="flex justify-end gap-3 [&_button]:cursor-pointer ">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border px-4 py-2  "
          >
            Cancel
          </button>
          {children}
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
