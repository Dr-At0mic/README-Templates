import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

// Native <dialog>: focus trapping, Esc to close and the backdrop come from the browser.
export default function Dialog({ open, onClose, title, description, children, footer, width = 480 }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="dialog"
      style={{ width }}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="dialog-title"
    >
      {open && (
        <div className="dialog-inner">
          <header className="dialog-header">
            <div>
              <h2 id="dialog-title">{title}</h2>
              {description && <p className="dialog-description">{description}</p>}
            </div>
            <button type="button" className="icon-button" onClick={onClose} aria-label="Close">
              <X size={16} />
            </button>
          </header>
          <div className="dialog-body">{children}</div>
          {footer && <footer className="dialog-footer">{footer}</footer>}
        </div>
      )}
    </dialog>
  );
}
