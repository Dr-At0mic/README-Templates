import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, Search } from 'lucide-react';

const toDataUri = (svg) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
// Thumbnails rest on their final frame; the template's keyframes are `from`-only, so killing
// animation shows the finished artwork. Hover/focus swaps in the live version.
const still = (svg) => svg.replace(/(<svg[^>]*>)/, '$1<style>*{animation:none!important}</style>');

function TemplateCard({ template, profile, theme, active, onUse }) {
  const [live, setLive] = useState(false);
  const svg = useMemo(() => template.hero(profile, theme), [template, profile, theme]);
  const srcStill = useMemo(() => toDataUri(still(svg)), [svg]);
  const srcLive = useMemo(() => toDataUri(svg), [svg]);
  const playable = Boolean(template.animated);

  return (
    <article
      className={`gallery-card${active ? ' is-active' : ''}`}
      onMouseEnter={() => playable && setLive(true)}
      onMouseLeave={() => setLive(false)}
      onFocus={() => playable && setLive(true)}
      onBlur={() => setLive(false)}
    >
      <div className="gallery-thumb">
        <img src={live ? srcLive : srcStill} alt={`${template.name} header preview with your profile`} loading="lazy" />
        {playable && <span className="gallery-hint">{live ? 'Playing' : 'Hover to play'}</span>}
      </div>
      <div className="gallery-body">
        <div className="gallery-head">
          <h2>{template.name}</h2>
          {active && (
            <span className="badge badge-live">
              <Check size={11} aria-hidden="true" /> In use
            </span>
          )}
        </div>
        <p>{template.tagline}</p>
        <div className="gallery-foot">
          <ul className="tag-list" aria-label="Tags">
            {template.tags?.map((tag) => (
              <li key={tag} className="badge">
                {tag}
              </li>
            ))}
          </ul>
          <button
            type="button"
            className={`button ${active ? '' : 'button-primary'}`}
            onClick={() => onUse(template.id)}
          >
            {active ? 'Back to editor' : 'Use template'}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function TemplateGallery({ templates, activeId, profile, onUse, onClose }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    // Esc leaves the gallery, unless it's closing a dialog or the account menu first.
    const onKey = (e) => e.key === 'Escape' && !document.querySelector('dialog[open], .menu') && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const filters = ['All', 'Animated', 'Static'];
  const matchesFilter = (t) => filter === 'All' || (filter === 'Animated') === Boolean(t.animated);
  const q = query.trim().toLowerCase();
  const shown = templates.filter(
    (t) =>
      matchesFilter(t) &&
      (!q || [t.name, t.tagline, ...(t.tags || [])].join(' ').toLowerCase().includes(q))
  );

  return (
    <main className="gallery" aria-labelledby="gallery-title">
      <div className="gallery-inner">
        <header className="gallery-header">
          <button type="button" className="button button-ghost" onClick={onClose}>
            <ArrowLeft size={15} aria-hidden="true" /> Editor
          </button>
          <div className="gallery-title-row">
            <h1 id="gallery-title">Templates</h1>
            <span className="counter">{templates.length}</span>
          </div>
          <p className="gallery-sub">
            Previews use your current profile{profile.source === 'sample' ? ' (sample data)' : ''}. Switching keeps
            everything you've written.
          </p>
        </header>

        <div className="gallery-controls">
          <label className="search">
            <Search size={15} aria-hidden="true" />
            <input
              type="search"
              placeholder="Search templates"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search templates"
            />
          </label>
          <div className="segmented" role="tablist" aria-label="Filter">
            {filters.map((f) => (
              <button key={f} type="button" role="tab" aria-selected={filter === f} onClick={() => setFilter(f)}>
                {f}
              </button>
            ))}
          </div>
          <div className="segmented" role="tablist" aria-label="Preview theme">
            {['dark', 'light'].map((t) => (
              <button key={t} type="button" role="tab" aria-selected={theme === t} onClick={() => setTheme(t)}>
                {t === 'dark' ? 'Dark' : 'Light'}
              </button>
            ))}
          </div>
        </div>

        {shown.length ? (
          <div className="gallery-grid">
            {shown.map((t) => (
              <TemplateCard
                key={t.id}
                template={t}
                profile={profile}
                theme={theme}
                active={t.id === activeId}
                onUse={onUse}
              />
            ))}
          </div>
        ) : (
          <p className="gallery-empty">No templates match “{query}”.</p>
        )}
      </div>
    </main>
  );
}
