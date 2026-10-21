import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, ExternalLink, RefreshCw } from 'lucide-react';
import Dialog from './Dialog';
import { RELEASES_URL, canUpdate, checkForUpdate, installUpdate } from '../lib/updater';

// Desktop only: "Check for updates" in the top bar. Checks quietly once at launch and marks the
// button when a newer release exists; the dialog then shows the notes and installs it.
export default function UpdateButton() {
  const [open, setOpen] = useState(false);
  const [update, setUpdate] = useState(null);
  const [phase, setPhase] = useState('idle'); // idle | checking | none | available | installing | error
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!canUpdate()) return;
    let cancelled = false;
    // A failed launch check (offline, no release yet) stays silent; the button still works.
    checkForUpdate()
      .then((found) => !cancelled && found && (setUpdate(found), setPhase('available')))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!canUpdate()) return null;

  const check = async () => {
    setPhase('checking');
    setError('');
    try {
      const found = await checkForUpdate();
      setUpdate(found);
      setPhase(found ? 'available' : 'none');
    } catch (err) {
      setError(String(err?.message ?? err));
      setPhase('error');
    }
  };

  const openDialog = () => {
    setOpen(true);
    if (phase !== 'available' && phase !== 'installing') check();
  };

  const install = async () => {
    setPhase('installing');
    setProgress(null);
    setError('');
    try {
      await installUpdate(update, setProgress);
    } catch (err) {
      setError(String(err?.message ?? err));
      setPhase('error');
    }
  };

  const installing = phase === 'installing';
  const percent = progress == null ? null : Math.round(progress * 100);

  return (
    <>
      <button
        type="button"
        className="button button-ghost update-button"
        onClick={openDialog}
        title={update ? `Version ${update.version} is available` : 'Check for a newer version of the app'}
      >
        <RefreshCw size={15} aria-hidden="true" />
        {update ? 'Update available' : 'Check for updates'}
        {update && <span className="update-dot" aria-hidden="true" />}
      </button>

      <Dialog
        open={open}
        onClose={() => !installing && setOpen(false)}
        width={460}
        title={phase === 'available' || installing ? `Update to ${update.version}` : 'Check for updates'}
        description={update ? `You have version ${update.currentVersion}.` : null}
        footer={
          <>
            <button type="button" className="button" onClick={() => setOpen(false)} disabled={installing}>
              {phase === 'available' ? 'Later' : 'Close'}
            </button>
            {(phase === 'available' || installing) && (
              <button type="button" className="button button-accent" onClick={install} disabled={installing}>
                {installing ? (percent == null ? 'Downloading…' : `Downloading ${percent}%`) : 'Install and restart'}
              </button>
            )}
            {phase === 'error' && (
              <button type="button" className="button button-primary" onClick={update ? install : check}>
                Try again
              </button>
            )}
          </>
        }
      >
        <div className="stack" aria-live="polite">
          {phase === 'checking' && <p className="muted">Checking GitHub for a newer release…</p>}
          {phase === 'none' && (
            <p className="success-line">
              <CheckCircle2 size={16} aria-hidden="true" /> You’re on the latest version.
            </p>
          )}
          {(phase === 'available' || installing) && (
            <>
              {update.body ? <p className="update-notes">{update.body}</p> : <p className="muted">No release notes.</p>}
              {installing && (
                <div
                  className="update-progress"
                  role="progressbar"
                  aria-label="Download progress"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={percent ?? undefined}
                >
                  <span style={{ width: `${percent ?? 100}%` }} className={percent == null ? 'is-indeterminate' : ''} />
                </div>
              )}
              <p className="note">
                The download is checked against the app’s signing key before it installs. The app restarts when it’s
                done; your saved accounts and edits are kept.
              </p>
            </>
          )}
          {phase === 'error' && (
            <>
              <p className="field-error">
                <AlertTriangle size={14} aria-hidden="true" /> {error || 'The update failed.'}
              </p>
              <p className="note">
                You can also download the latest version yourself from{' '}
                <a href={RELEASES_URL} target="_blank" rel="noreferrer">
                  GitHub Releases <ExternalLink size={12} aria-hidden="true" />
                </a>
              </p>
            </>
          )}
        </div>
      </Dialog>
    </>
  );
}
