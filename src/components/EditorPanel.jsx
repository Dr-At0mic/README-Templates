import { Info, LayoutGrid } from 'lucide-react';

const MAX_FEATURED = 4;

function Field({ id, label, help, children }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
      {help && <p className="field-help">{help}</p>}
    </div>
  );
}

export default function EditorPanel({ id, hidden, template, onBrowseTemplates, profile, onChange, connected, onConnect }) {
  const set = (key) => (e) => onChange({ [key]: e.target.value });
  const templateValues = profile.templateData?.[template.id] || {};
  const setTemplateField = (key) => (e) =>
    onChange({ templateData: { ...profile.templateData, [template.id]: { ...templateValues, [key]: e.target.value } } });

  const toggleFeatured = (name) => {
    const has = profile.featured.includes(name);
    if (!has && profile.featured.length >= MAX_FEATURED) return;
    // Keep the order the repos are listed in, so the README order is predictable.
    const next = profile.repos.map((r) => r.name).filter((n) => (n === name ? !has : profile.featured.includes(n)));
    onChange({ featured: next });
  };

  return (
    // `inert` (not `hidden`) keeps the panel in layout so the collapse can animate,
    // while still removing it from tab order and the accessibility tree.
    <aside id={id} className="editor" aria-label="README content" inert={hidden || undefined}>
      <section className="template-card">
        <p className="eyebrow">Template</p>
        <div className="template-current">
          <div className="template-current-text">
            <span className="template-name">{template.name}</span>
            {template.animated && <span className="badge">Animated</span>}
          </div>
          <button type="button" className="button" onClick={onBrowseTemplates}>
            <LayoutGrid size={14} aria-hidden="true" /> Browse
          </button>
        </div>
      </section>

      {!connected && (
        <div className="notice">
          <Info size={15} aria-hidden="true" />
          <p>
            Showing static sample data.{' '}
            <button type="button" className="link-button" onClick={onConnect}>
              Connect GitHub
            </button>{' '}
            to draw the artwork from your real contributions and repos.
          </p>
        </div>
      )}

      <section className="editor-section">
        <h2 className="section-title">Identity</h2>
        <Field id="name" label="Name">
          <input id="name" value={profile.name} onChange={set('name')} />
        </Field>
        <Field id="headline" label="Headline" help="One specific line about what you build. Shown in the header and as text.">
          <input id="headline" value={profile.headline} onChange={set('headline')} maxLength={120} />
        </Field>
        <Field id="location" label="Location">
          <input id="location" value={profile.location} onChange={set('location')} />
        </Field>
      </section>

      {template.fields?.length > 0 && (
        <section className="editor-section">
          <h2 className="section-title">{template.name} options</h2>
          {template.fields.map((f) => (
            <Field key={f.key} id={`tf-${f.key}`} label={f.label} help={f.help}>
              <input
                id={`tf-${f.key}`}
                value={templateValues[f.key] || ''}
                onChange={setTemplateField(f.key)}
                placeholder={f.placeholder?.(profile)}
                maxLength={f.maxLength}
              />
            </Field>
          ))}
        </section>
      )}

      <section className="editor-section">
        <h2 className="section-title">About</h2>
        <Field id="intro" label="Intro" help="Two or three sentences in your own voice. Markdown works.">
          <textarea id="intro" rows={4} value={profile.intro} onChange={set('intro')} />
        </Field>
        <Field id="now" label="Now" help="What you're working on at the moment. Leave empty to hide.">
          <input id="now" value={profile.now} onChange={set('now')} />
        </Field>
      </section>

      <section className="editor-section">
        <h2 className="section-title">Links</h2>
        <Field id="website" label="Website">
          <input id="website" type="url" value={profile.website} onChange={set('website')} placeholder="https://" />
        </Field>
        <Field id="email" label="Email">
          <input id="email" type="email" value={profile.email} onChange={set('email')} />
        </Field>
        <div className="field-row">
          <Field id="twitter" label="X handle">
            <input id="twitter" value={profile.twitter} onChange={set('twitter')} placeholder="handle" />
          </Field>
          <Field id="linkedin" label="LinkedIn URL">
            <input id="linkedin" type="url" value={profile.linkedin} onChange={set('linkedin')} placeholder="https://" />
          </Field>
        </div>
      </section>

      <section className="editor-section">
        <div className="section-head">
          <h2 className="section-title">Selected work</h2>
          <span className="counter">
            {profile.featured.length}/{MAX_FEATURED}
          </span>
        </div>
        {profile.repos.length === 0 ? (
          <p className="field-help">No public repositories found.</p>
        ) : (
          <ul className="repo-list">
            {profile.repos.map((repo) => {
              const checked = profile.featured.includes(repo.name);
              const disabled = !checked && profile.featured.length >= MAX_FEATURED;
              return (
                <li key={repo.name}>
                  <label className={`repo-option${disabled ? ' is-disabled' : ''}`}>
                    <input type="checkbox" checked={checked} disabled={disabled} onChange={() => toggleFeatured(repo.name)} />
                    <span className="repo-text">
                      <span className="repo-name">{repo.name}</span>
                      <span className="repo-meta">
                        {[repo.language, repo.stars ? `★ ${repo.stars.toLocaleString('en-US')}` : ''].filter(Boolean).join(' · ')}
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="editor-section">
        <h2 className="section-title">Stack</h2>
        <p className="field-help">
          {connected ? 'Measured from your public, non-fork repositories.' : 'Sample values.'} Drawn as strata in the README.
        </p>
        <ul className="lang-list">
          {profile.languages.slice(0, 5).map((l) => (
            <li key={l.name}>
              <span>{l.name}</span>
              <span className="lang-bar" aria-hidden="true">
                <span style={{ width: `${Math.max(2, l.share * 100)}%` }} />
              </span>
              <span className="mono muted">{Math.round(l.share * 100)}%</span>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
