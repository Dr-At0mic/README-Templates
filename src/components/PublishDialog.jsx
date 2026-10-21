import { useEffect, useState } from 'react';
import { CheckCircle2, ExternalLink, FileText, Image, AlertTriangle } from 'lucide-react';
import Dialog from './Dialog';
import { inspectProfileRepo, publishProfile } from '../lib/github';

export default function PublishDialog({ open, onClose, token, login, output, templateName }) {
  const [repo, setRepo] = useState(null);
  const [phase, setPhase] = useState('checking'); // checking | ready | publishing | done | error
  const [step, setStep] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setMessage(`Update profile README (${templateName})`);
    setPhase('checking');
    setError('');
    setResult(null);
    inspectProfileRepo(token, login)
      .then((info) => !cancelled && (setRepo(info), setPhase('ready')))
      .catch((err) => !cancelled && (setError(err.message), setPhase('error')));
    return () => {
      cancelled = true;
    };
  }, [open, token, login, templateName]);

  const files = [
    { path: 'README.md', content: output.markdown },
    ...Object.entries(output.assets).map(([path, content]) => ({ path, content })),
  ];

  const publish = async () => {
    setPhase('publishing');
    setError('');
    try {
      const res = await publishProfile(token, { login, files, message }, setStep);
      setResult(res);
      setPhase('done');
    } catch (err) {
      setError(err.message);
      setPhase('error');
    }
  };

  const blocked = repo?.exists && repo.isPrivate;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      width={520}
      title={phase === 'done' ? 'Published' : 'Publish to GitHub'}
      description={
        phase === 'done' ? null : (
          <>
            Commits to <code>{login}/{login}</code> — the repo GitHub shows on your profile.
          </>
        )
      }
      footer={
        phase === 'done' ? (
          <>
            <button type="button" className="button" onClick={onClose}>
              Close
            </button>
            <a className="button button-primary" href={result.profileUrl} target="_blank" rel="noreferrer">
              View profile <ExternalLink size={14} aria-hidden="true" />
            </a>
          </>
        ) : (
          <>
            <button type="button" className="button" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="button button-accent"
              onClick={publish}
              disabled={!(phase === 'ready' || (phase === 'error' && repo)) || blocked || !message.trim()}
            >
              {phase === 'publishing' ? step || 'Publishing…' : 'Publish'}
            </button>
          </>
        )
      }
    >
      {phase === 'done' ? (
        <div className="stack">
          <p className="success-line">
            <CheckCircle2 size={16} aria-hidden="true" /> {files.length} files committed to{' '}
            <code>{login}/{login}</code>.
          </p>
          <p className="note">
            GitHub can take a minute to refresh the profile page.{' '}
            {result.commitUrl && (
              <a href={result.commitUrl} target="_blank" rel="noreferrer">
                View commit
              </a>
            )}
          </p>
        </div>
      ) : (
        <div className="stack">
          <div className="status-box" aria-live="polite">
            {phase === 'checking' && <span className="muted">Checking {login}/{login}…</span>}
            {repo && !repo.exists && (
              <span>
                Repo doesn’t exist yet — it will be <strong>created as public</strong>.
              </span>
            )}
            {repo?.exists && !repo.isPrivate && (
              <span>
                {repo.hasReadme ? (
                  <>
                    <strong>Replaces the existing README.md</strong> on <code>{repo.defaultBranch}</code>. The old version
                    stays in git history.
                  </>
                ) : (
                  <>
                    Repo found — adds README.md on <code>{repo.defaultBranch}</code>.
                  </>
                )}
              </span>
            )}
            {blocked && (
              <span className="field-error">
                <AlertTriangle size={14} aria-hidden="true" /> {login}/{login} is private. Profile READMEs only appear
                from a public repo — make it public on GitHub first.
              </span>
            )}
          </div>

          <div>
            <p className="label">Files in this commit</p>
            <ul className="file-list">
              {files.map((f) => (
                <li key={f.path}>
                  {f.path.endsWith('.md') ? <FileText size={14} aria-hidden="true" /> : <Image size={14} aria-hidden="true" />}
                  <code>{f.path}</code>
                  <span className="muted">{(new Blob([f.content]).size / 1024).toFixed(1)} KB</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="field">
            <label htmlFor="commit-message">Commit message</label>
            <input id="commit-message" value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>

          {error && <p className="field-error">{error}</p>}
        </div>
      )}
    </Dialog>
  );
}
