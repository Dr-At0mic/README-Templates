import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import Dialog from './Dialog';

const TOKEN_URL =
  'https://github.com/settings/tokens/new?scopes=public_repo,read:user&description=README%20Templates';

export default function ConnectDialog({ open, onClose, onConnect, error, busy, canPersist, hasAccounts }) {
  const [token, setToken] = useState('');
  const [remember, setRemember] = useState(false);

  // Never keep a pasted token around between openings.
  useEffect(() => {
    if (!open) setToken('');
  }, [open]);

  const submit = (e) => {
    e.preventDefault();
    if (token.trim()) onConnect(token.trim(), remember && canPersist);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={hasAccounts ? 'Add another GitHub account' : 'Connect GitHub'}
      description="The token decides the account: it is added as whoever created the token."
      footer={
        <>
          <button type="button" className="button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="connect-form" className="button button-primary" disabled={!token.trim() || busy}>
            {busy ? 'Verifying…' : hasAccounts ? 'Add account' : 'Connect'}
          </button>
        </>
      }
    >
      <form id="connect-form" onSubmit={submit} className="stack">
        <div className="field">
          <label htmlFor="token">Personal access token</label>
          <input
            id="token"
            type="password"
            autoComplete="off"
            spellCheck={false}
            placeholder="ghp_… or github_pat_…"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            aria-invalid={Boolean(error)}
            aria-describedby="token-help"
            autoFocus
          />
          {error && <p className="field-error">{error}</p>}
          <p id="token-help" className="field-help">
            Classic token with <code>public_repo</code> and <code>read:user</code>, or a fine‑grained token with
            Contents and Administration write access to your <code>username/username</code> repo.{' '}
            <a href={TOKEN_URL} target="_blank" rel="noreferrer">
              Create one <ExternalLink size={12} aria-hidden="true" />
            </a>
          </p>
          {hasAccounts && (
            <p className="field-help">
              For a different account, open that link in a private window (or after switching accounts on github.com) so
              the token is created by the right user. Adding an account that's already here just replaces its key.
            </p>
          )}
        </div>

        <label className={`checkbox${canPersist ? '' : ' is-disabled'}`}>
          <input
            type="checkbox"
            checked={remember && canPersist}
            disabled={!canPersist}
            onChange={(e) => setRemember(e.target.checked)}
          />
          <span>Save on this device (encrypted)</span>
        </label>

        <p className="note">
          {canPersist
            ? 'Saved keys are encrypted with AES-256-GCM using a per-device key the browser never exposes. Unchecked, the key is kept for this tab session only. Tokens are only ever sent to api.github.com.'
            : 'Encrypted storage is unavailable (VITE_VAULT_SECRET missing or WebCrypto blocked), so the key is kept in memory for this tab only.'}{' '}
          Without an account the studio uses static sample data and makes no network requests.
        </p>
      </form>
    </Dialog>
  );
}
