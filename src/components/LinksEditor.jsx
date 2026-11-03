import { useEffect, useRef, useState } from 'react';
import { Check, Plus, X } from 'lucide-react';
import Dialog from './Dialog';
import { LINK_TYPES, badgeColors, linkType, resolveLink } from '../lib/links';

export function BrandTile({ type }) {
  const { background, ink } = badgeColors(type.color);
  const shape = type.stroked
    ? { fill: 'none', stroke: ink, strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' }
    : { fill: ink };
  return (
    <span className="brand-tile" style={{ background }} aria-hidden="true">
      <svg viewBox="0 0 24 24" width="14" height="14">
        <path d={type.path} {...shape} />
      </svg>
    </span>
  );
}

// One editor section's links (social or support). Only links the user added take up sidebar space; the
// full list stays in the picker.
export default function LinksEditor({ group, title, hint, addLabel, profile, onChange }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState('');
  const searchRef = useRef(null);
  const focusNext = useRef(null);

  const links = profile.links || [];
  const rows = links.filter((l) => linkType(l.id)?.group === group);
  const added = new Set(links.map((l) => l.id));

  const q = query.trim().toLowerCase();
  const choices = LINK_TYPES.filter((t) => t.group === group && t.label.toLowerCase().includes(q));

  // Both run after Dialog's own effect has opened or closed it, when these inputs can take focus.
  useEffect(() => {
    if (pickerOpen) searchRef.current?.focus();
  }, [pickerOpen]);

  useEffect(() => {
    if (!focusNext.current) return;
    document.getElementById(`link-${focusNext.current}`)?.focus();
    focusNext.current = null;
  });

  const openPicker = () => {
    setQuery('');
    setPickerOpen(true);
  };

  const add = (type) => {
    focusNext.current = type.id;
    onChange({ links: [...links, { id: type.id, value: type.prefill?.(profile) ?? '' }] });
    setPickerOpen(false);
  };

  const setValue = (id, value) => onChange({ links: links.map((l) => (l.id === id ? { ...l, value } : l)) });
  const remove = (id) => onChange({ links: links.filter((l) => l.id !== id) });

  return (
    <>
      {title && <h2 className="section-title">{title}</h2>}
      {hint && rows.length === 0 && <p className="field-help">{hint}</p>}

      {rows.length > 0 && (
        <ul className="link-rows">
          {rows.map(({ id, value }) => {
            const type = linkType(id);
            const invalid = value.trim() !== '' && !resolveLink(type, value);
            return (
              <li key={id} className="link-row">
                <div className="link-row-main">
                  <BrandTile type={type} />
                  <input
                    id={`link-${id}`}
                    value={value}
                    onChange={(e) => setValue(id, e.target.value)}
                    placeholder={type.placeholder ?? 'username'}
                    aria-label={type.label}
                    aria-invalid={invalid || undefined}
                    autoComplete="off"
                    spellCheck="false"
                  />
                  <button
                    type="button"
                    className="icon-button icon-button-sm"
                    onClick={() => remove(id)}
                    aria-label={`Remove ${type.label}`}
                    title={`Remove ${type.label}`}
                  >
                    <X size={14} aria-hidden="true" />
                  </button>
                </div>
                {invalid && <p className="field-error">This doesn't look like a valid {type.label} link, so it's left out of the README.</p>}
              </li>
            );
          })}
        </ul>
      )}

      <div>
        <button type="button" className="button" onClick={openPicker}>
          <Plus size={14} aria-hidden="true" /> {addLabel}
        </button>
      </div>

      <Dialog open={pickerOpen} onClose={() => setPickerOpen(false)} title={addLabel} width={560}>
        <div className="stack">
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            aria-label="Search platforms"
            autoComplete="off"
          />
          {choices.length === 0 ? (
            <p className="note">Nothing matches "{query}".</p>
          ) : (
            <ul className="link-grid">
              {choices.map((type) => {
                const isAdded = added.has(type.id);
                return (
                  <li key={type.id}>
                    <button type="button" className="link-choice" disabled={isAdded} onClick={() => add(type)}>
                      <BrandTile type={type} />
                      <span className="link-choice-label">{type.label}</span>
                      {isAdded && <Check size={14} aria-label="Already added" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </Dialog>
    </>
  );
}
