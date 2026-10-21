import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Clock, HardDrive, LogOut, Plus, ShieldCheck, Trash2, UserRound } from 'lucide-react';

function Avatar({ src, size = 20 }) {
  return src ? (
    <img className="avatar" src={src} alt="" width={size} height={size} />
  ) : (
    <span className="avatar avatar-empty" style={{ width: size, height: size }} aria-hidden="true">
      <UserRound size={size * 0.6} />
    </span>
  );
}

export default function AccountMenu({
  accounts,
  activeLogin,
  loading,
  canPersist,
  onSwitch,
  onAdd,
  onSignOut,
  onToggleRemember,
  onRemove,
  onClearAll,
}) {
  const [open, setOpen] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const rootRef = useRef(null);
  const active = accounts.find((a) => a.login === activeLogin);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => !rootRef.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!open) setConfirmClear(false);
  }, [open]);

  const run = (fn) => () => {
    setOpen(false);
    fn();
  };

  return (
    <div className="account-menu" ref={rootRef}>
      <button
        type="button"
        className="account-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {active ? (
          <>
            <Avatar src={active.avatarUrl} />
            <span className="account-login">@{active.login}</span>
            <span className="badge badge-live">{loading ? 'Syncing' : 'Live'}</span>
          </>
        ) : (
          <>
            <span className="badge" title="No account active — showing static sample data">
              Sample data
            </span>
            {accounts.length > 0 && <span className="account-count">{accounts.length} saved</span>}
          </>
        )}
        <ChevronDown size={14} aria-hidden="true" className="chevron" />
      </button>

      {open && (
        <div className="menu" role="menu" aria-label="GitHub accounts">
          <p className="menu-label">GitHub accounts</p>

          {accounts.length === 0 && <p className="menu-empty">No accounts yet. Add one to use live data and publish.</p>}

          {accounts.map((acc) => {
            const isActive = acc.login === activeLogin;
            return (
              <div key={acc.login} className={`menu-account${isActive ? ' is-active' : ''}`}>
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={isActive}
                  className="menu-account-main"
                  onClick={run(() => onSwitch(acc.login))}
                >
                  <Avatar src={acc.avatarUrl} size={28} />
                  <span className="menu-account-text">
                    <span className="menu-account-login">@{acc.login}</span>
                    <span className="menu-account-meta">
                      {acc.remember ? (
                        <>
                          <HardDrive size={11} aria-hidden="true" /> Saved on this device
                        </>
                      ) : (
                        <>
                          <Clock size={11} aria-hidden="true" /> This session only
                        </>
                      )}
                    </span>
                  </span>
                  {isActive && <Check size={15} className="menu-check" aria-hidden="true" />}
                </button>
                <div className="menu-account-actions">
                  <button
                    type="button"
                    className="icon-button icon-button-sm"
                    onClick={() => onToggleRemember(acc.login, !acc.remember)}
                    disabled={!acc.remember && !canPersist}
                    aria-label={acc.remember ? `Keep @${acc.login} for this session only` : `Save @${acc.login} on this device`}
                    title={acc.remember ? 'Keep for this session only' : 'Save on this device (encrypted)'}
                  >
                    {acc.remember ? <Clock size={14} /> : <HardDrive size={14} />}
                  </button>
                  <button
                    type="button"
                    className="icon-button icon-button-sm icon-button-danger"
                    onClick={() => onRemove(acc.login)}
                    aria-label={`Remove @${acc.login} and its key`}
                    title="Remove account and key"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}

          <div className="menu-sep" role="separator" />

          <button type="button" role="menuitem" className="menu-item" onClick={run(onAdd)}>
            <Plus size={15} aria-hidden="true" /> Add account
          </button>
          {active && (
            <button type="button" role="menuitem" className="menu-item" onClick={run(onSignOut)}>
              <LogOut size={15} aria-hidden="true" /> Use sample data
            </button>
          )}
          {accounts.length > 0 && (
            <button
              type="button"
              role="menuitem"
              className="menu-item menu-item-danger"
              onClick={() => (confirmClear ? (setOpen(false), onClearAll()) : setConfirmClear(true))}
            >
              <Trash2 size={15} aria-hidden="true" />
              {confirmClear ? 'Click again to erase every key' : 'Clear all saved keys'}
            </button>
          )}

          <p className="menu-foot">
            <ShieldCheck size={12} aria-hidden="true" />
            {canPersist
              ? 'Keys are encrypted (AES-256-GCM) with a non-extractable device key.'
              : 'Encrypted storage unavailable — keys are kept in memory only.'}
          </p>
        </div>
      )}
    </div>
  );
}
