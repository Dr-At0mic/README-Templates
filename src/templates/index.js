// Template registry. Each entry exposes render(profile) → { markdown, assets }, `tags` and
// `hero(profile, theme)` for the gallery, plus optional `fields` (template-specific inputs) and
// `animated` (shows the Replay control).
import { dollhouse } from './dollhouse';
import { pulsar } from './pulsar';
import { shonen } from './shonen';
import { singularity } from './singularity';

export const TEMPLATES = [pulsar, shonen, singularity, dollhouse];
export const DEFAULT_TEMPLATE = pulsar;
export const findTemplate = (id) => TEMPLATES.find((t) => t.id === id) || DEFAULT_TEMPLATE;
