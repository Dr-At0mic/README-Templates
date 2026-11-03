import { useEffect, useRef, useState } from 'react';
import { Star, Trash2 } from 'lucide-react';
import Dialog from './Dialog';
import {
  MAX_PRESET_NAME,
  copyableFields,
  createPreset,
  deletePreset,
  isDirty,
  loadPresets,
  mergeFields,
  setDefaultPreset,
  updatePreset,
} from '../lib/presets';

const SAVE_FAILED = "Couldn't save to this device's storage, so this change will be lost when the app closes.";

// `scope` is the form this bar belongs to, with its own saved presets. `copySource` is the profile README's
// data, offered as a starting point in the Sponsors form.
export default function PresetBar({ scope = 'profile', profile, onChange, copySource }) {
  const [store, setStore] = useState(() => loadPresets(scope));
  const [dialog, setDialog] = useState(null); // { type: 'save' | 'delete' | 'copy' } or { type: 'switch', targetId }
  const [name, setName] = useState('');
  const [makeDefault, setMakeDefault] = useState(false);
  const [error, setError] = useState('');
  const [justSaved, setJustSaved] = useState(false);
  const nameRef = useRef(null);

  const active = store.items.find((p) => p.id === profile.presetId) ?? null;
  const isDefault = Boolean(active) && store.defaultId === active.id;
  const dirty = isDirty(profile, active ? active.fields : profile.baseFields);
  const sourceLabel = profile.source === 'github' ? 'GitHub profile' : 'Sample data';

  // Runs after Dialog's own effect has called showModal, when the input can take focus.
  useEffect(() => {
    if (dialog?.type === 'save') nameRef.current?.focus();
  }, [dialog]);

  useEffect(() => {
    if (!justSaved) return undefined;
    const timer = setTimeout(() => setJustSaved(false), 2500);
    return () => clearTimeout(timer);
  }, [justSaved]);

  const closeDialog = () => setDialog(null);

  // Applies a write's result, or reports that nothing was saved.
  const settle = (saved) => {
    if (!saved) {
      setError(SAVE_FAILED);
      return false;
    }
    setStore(saved);
    setError('');
    return true;
  };

  const applyTarget = (id) => {
    const preset = store.items.find((p) => p.id === id);
    onChange({ ...mergeFields(profile, preset ? preset.fields : profile.baseFields), presetId: preset ? preset.id : null });
    setJustSaved(false);
    setError('');
  };

  const onSelect = (e) => {
    const id = e.target.value;
    if (dirty) setDialog({ type: 'switch', targetId: id });
    else applyTarget(id);
  };

  const openSave = () => {
    setName('');
    setMakeDefault(!store.defaultId);
    setError('');
    setDialog({ type: 'save' });
  };

  const trimmed = name.trim();
  const nameTaken = store.items.some((p) => p.name.toLowerCase() === trimmed.toLowerCase());

  const submitSave = (e) => {
    e.preventDefault();
    if (!trimmed || nameTaken) return;
    const created = createPreset(scope, trimmed, profile, makeDefault);
    if (!settle(created?.store)) return;
    onChange({ presetId: created.id });
    setJustSaved(true);
    closeDialog();
  };

  const saveChanges = () => {
    if (settle(updatePreset(scope, active.id, profile))) setJustSaved(true);
  };

  const toggleDefault = () => settle(setDefaultPreset(scope, isDefault ? null : active.id));

  const confirmDelete = () => {
    if (!settle(deletePreset(scope, active.id))) return;
    onChange({ presetId: null });
    setJustSaved(false);
    closeDialog();
  };

  const copyDetails = () => {
    onChange(copyableFields(copySource));
    setJustSaved(false);
    closeDialog();
  };

  const confirmSwitch = () => {
    applyTarget(dialog.targetId);
    closeDialog();
  };

  const targetName = dialog?.type === 'switch' ? store.items.find((p) => p.id === dialog.targetId)?.name ?? sourceLabel : '';

  let hint = '';
  if (active && dirty) hint = 'Unsaved changes';
  else if (!active && store.items.length === 0) hint = 'Save your details once, then switch to them here.';
  else if (!active && dirty) hint = 'Unsaved changes';
  else if (justSaved) hint = 'Saved on this device';
  else if (isDefault) hint = 'Loads automatically when the app opens';

  return (
    <section className="preset-card">
      <label className="eyebrow" htmlFor="preset-select">
        {scope === 'sponsors' ? 'Sponsors data preset' : 'Data preset'}
      </label>
      <div className="preset-row">
        <select id="preset-select" value={active?.id ?? ''} onChange={onSelect}>
          <option value="">{sourceLabel}</option>
          {store.items.map((p) => (
            <option key={p.id} value={p.id}>
              {p.id === store.defaultId ? `${p.name} (default)` : p.name}
            </option>
          ))}
        </select>
        {active && (
          <>
            <button
              type="button"
              className={`icon-button${isDefault ? ' is-on' : ''}`}
              onClick={toggleDefault}
              aria-pressed={isDefault}
              aria-label={`Load ${active.name} automatically when the app opens`}
              title={isDefault ? 'Default preset. Click to stop loading it automatically' : 'Set as default: load automatically when the app opens'}
            >
              <Star size={16} fill={isDefault ? 'currentColor' : 'none'} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="icon-button icon-button-danger"
              onClick={() => {
                setError('');
                setDialog({ type: 'delete' });
              }}
              aria-label={`Delete preset ${active.name}`}
              title="Delete preset"
            >
              <Trash2 size={16} aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      <p className="preset-hint" role="status">
        {hint}
      </p>

      {(!active || dirty) && (
        <div className="preset-actions">
          {active && (
            <button type="button" className="button button-primary" onClick={saveChanges}>
              Update
            </button>
          )}
          <button type="button" className="button" onClick={openSave}>
            {active ? 'Save as new' : 'Save as preset'}
          </button>
        </div>
      )}

      {copySource && (
        <button type="button" className="link-button preset-copy" onClick={() => (dirty ? setDialog({ type: 'copy' }) : copyDetails())}>
          Copy details from my Profile README
        </button>
      )}

      {error && !dialog && <p className="field-error">{error}</p>}

      <Dialog
        open={dialog?.type === 'save'}
        onClose={closeDialog}
        title="Save data preset"
        description={
          scope === 'sponsors'
            ? 'Saves this Sponsors page data on this device, separately from your Profile README presets. GitHub stats always stay live.'
            : 'Saves your details, links, template options and selected work on this device. GitHub stats always stay live.'
        }
        footer={
          <>
            <button type="button" className="button" onClick={closeDialog}>
              Cancel
            </button>
            <button type="submit" form="preset-form" className="button button-primary" disabled={!trimmed || nameTaken}>
              Save preset
            </button>
          </>
        }
      >
        <form id="preset-form" className="stack" onSubmit={submitSave}>
          <div className="field">
            <label htmlFor="preset-name">Preset name</label>
            <input
              id="preset-name"
              ref={nameRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={MAX_PRESET_NAME}
              placeholder="Personal"
              autoComplete="off"
              aria-invalid={nameTaken || undefined}
            />
            {nameTaken && <p className="field-error">A preset with this name already exists.</p>}
            {error && <p className="field-error">{error}</p>}
          </div>
          <label className="checkbox">
            <input type="checkbox" checked={makeDefault} onChange={(e) => setMakeDefault(e.target.checked)} />
            Load automatically when the app opens
          </label>
        </form>
      </Dialog>

      <Dialog
        open={dialog?.type === 'delete'}
        onClose={closeDialog}
        title="Delete this preset?"
        description={`"${active?.name ?? ''}" will be removed from this device. What's in the editor now stays as it is.`}
        footer={
          <>
            <button type="button" className="button" onClick={closeDialog}>
              Cancel
            </button>
            <button type="button" className="button button-primary" onClick={confirmDelete}>
              Delete preset
            </button>
          </>
        }
      >
        {error && <p className="field-error">{error}</p>}
      </Dialog>

      <Dialog
        open={dialog?.type === 'copy'}
        onClose={closeDialog}
        title="Replace this Sponsors data?"
        description="Copying from your Profile README replaces what's in the editor, including edits you haven't saved. Your pitch and the Profile README itself aren't changed."
        footer={
          <>
            <button type="button" className="button" onClick={closeDialog}>
              Keep editing
            </button>
            <button type="button" className="button button-primary" onClick={copyDetails}>
              Replace and copy
            </button>
          </>
        }
      />

      <Dialog
        open={dialog?.type === 'switch'}
        onClose={closeDialog}
        title="Discard unsaved changes?"
        description={`Switching to "${targetName}" replaces what's in the editor, including edits you haven't saved.`}
        footer={
          <>
            <button type="button" className="button" onClick={closeDialog}>
              Keep editing
            </button>
            <button type="button" className="button button-primary" onClick={confirmSwitch}>
              Discard and switch
            </button>
          </>
        }
      />
    </section>
  );
}
