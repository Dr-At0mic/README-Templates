// Data presets: named snapshots of what the user types into the editor, kept on this device so it
// never has to be retyped. Only editable fields go in a preset. Measured data (repos, contributions,
// languages, followers) and account identity (login, source, avatar) stay out, so applying a preset
// can't replace live GitHub numbers with stale ones or point a README at another account.

import { loadPref, savePref } from './storage';

// The two forms never share data: each has its own presets and its own default.
const PREFS = { profile: 'presets', sponsors: 'sponsor-presets' };
const TEXT_FIELDS = ['name', 'headline', 'location', 'intro', 'now', 'website', 'email', 'sponsorPitch'];

const EMPTY = { defaultId: null, items: [] };

export const MAX_PRESET_NAME = 40;

// Template options with empty values dropped: a field typed into and then cleared equals one never set.
function cleanTemplateData(data) {
  const out = {};
  for (const [templateId, values] of Object.entries(data || {})) {
    const kept = Object.entries(values || {}).filter(([, value]) => value);
    if (kept.length) out[templateId] = Object.fromEntries(kept);
  }
  return out;
}

export function pickFields(profile) {
  const fields = {};
  for (const key of TEXT_FIELDS) fields[key] = profile[key] ?? '';
  fields.links = (profile.links || []).map(({ id, value }) => ({ id, value: (value || '').trim() })).filter((l) => l.value);
  fields.sponsorWall = Boolean(profile.sponsorWall);
  fields.sponsorBadge = profile.sponsorBadge !== false;
  fields.templateData = cleanTemplateData(profile.templateData);
  fields.featured = [...(profile.featured || [])];
  return fields;
}

// The editable part of `profile` once `fields` are applied to it. A key missing from `fields` (a preset
// saved before that field existed) keeps the current value. Featured names are matched against this
// profile's repos, and if none match (a preset saved under another account) the current picks stay.
export function mergeFields(profile, fields) {
  const merged = pickFields({ ...profile, ...fields });
  if (fields.featured) {
    const wanted = new Set(fields.featured);
    const matched = profile.repos.map((r) => r.name).filter((name) => wanted.has(name));
    merged.featured = matched.length || wanted.size === 0 ? matched : [...(profile.featured || [])];
  }
  return merged;
}

// Order-independent, so `isDirty` only reports changes the user can actually see.
function canonical({ templateData, featured, links, ...text }) {
  const sortEntries = (obj) => Object.entries(obj).sort(([a], [b]) => a.localeCompare(b));
  return JSON.stringify([
    sortEntries(text),
    sortEntries(templateData).map(([id, values]) => [id, sortEntries(values)]),
    [...featured].sort(),
    links.map((l) => [l.id, l.value]),
  ]);
}

export function isDirty(profile, fields) {
  return canonical(pickFields(profile)) !== canonical(mergeFields(profile, fields));
}

// Presets saved before the links list kept X and LinkedIn as separate fields.
function migrate(preset) {
  const { twitter, linkedin, ...fields } = preset.fields;
  if (fields.links || (twitter === undefined && linkedin === undefined)) return { ...preset, fields };
  const links = [
    { id: 'x', value: twitter || '' },
    { id: 'linkedin', value: linkedin || '' },
  ].filter((l) => l.value);
  return { ...preset, fields: { ...fields, links } };
}

export function loadPresets(scope = 'profile') {
  try {
    const data = JSON.parse(loadPref(PREFS[scope], ''));
    const items = Array.isArray(data.items)
      ? data.items.filter((p) => p && typeof p.id === 'string' && typeof p.name === 'string' && p.fields && typeof p.fields === 'object').map(migrate)
      : [];
    return { defaultId: items.some((p) => p.id === data.defaultId) ? data.defaultId : null, items };
  } catch {
    return EMPTY;
  }
}

// Writes return the new store, or null when it couldn't be saved, so the UI never claims a false save.
const commit = (scope, store) => (savePref(PREFS[scope], JSON.stringify(store)) ? store : null);

export function createPreset(scope, name, profile, makeDefault) {
  const store = loadPresets(scope);
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const items = [...store.items, { id, name, fields: pickFields(profile) }];
  const saved = commit(scope, { defaultId: makeDefault ? id : store.defaultId, items });
  return saved && { store: saved, id };
}

export function updatePreset(scope, id, profile) {
  const store = loadPresets(scope);
  const items = store.items.map((p) => (p.id === id ? { ...p, fields: pickFields(profile) } : p));
  return commit(scope, { ...store, items });
}

export function deletePreset(scope, id) {
  const store = loadPresets(scope);
  return commit(scope, {
    defaultId: store.defaultId === id ? null : store.defaultId,
    items: store.items.filter((p) => p.id !== id),
  });
}

export function setDefaultPreset(scope, id) {
  return commit(scope, { ...loadPresets(scope), defaultId: id });
}

// The form's starting data: its default preset if it has one, otherwise the loaded data as it came.
function startingFields(raw, scope) {
  const { defaultId, items } = loadPresets(scope);
  const preset = items.find((p) => p.id === defaultId);
  return preset ? { ...mergeFields(raw, preset.fields), presetId: preset.id } : { ...pickFields(raw), presetId: null };
}

// Prepares freshly loaded data (sample or GitHub) for the editor. It remembers the original values, so
// the user can return to them, and starts each form from its own default preset. The Sponsors form's
// editable data lives in `sponsorPage`; measured data stays shared at the top level.
export function startProfile(raw) {
  return {
    ...raw,
    baseFields: pickFields(raw),
    ...startingFields(raw, 'profile'),
    sponsorPage: startingFields(raw, 'sponsors'),
  };
}

// What the editor and the renderers see for a form.
export const profileForForm = (profile, form) => (form === 'sponsors' ? { ...profile, ...profile.sponsorPage } : profile);

// The profile README's details, for starting a Sponsors page from them. Choices that only mean something
// in the Sponsors form stay out.
export function copyableFields(profile) {
  const { sponsorPitch, sponsorWall, sponsorBadge, ...fields } = pickFields(profile);
  return fields;
}
