// Template registry. Each entry exposes render(profile) → { markdown, assets }, `tags` and
// `hero(profile, theme)` for the gallery, plus optional `fields` (template-specific inputs),
// `animated` (shows the Replay control) and `dedication` ({ text, url }, shown on its gallery card).
import { adhd } from './adhd';
import { breakdown } from './breakdown';
import { dollhouse } from './dollhouse';
import { fathom } from './fathom';
import { pacman } from './pacman';
import { pulsar } from './pulsar';
import { shonen } from './shonen';
import { singularity } from './singularity';

export const TEMPLATES = [pulsar, shonen, singularity, dollhouse, adhd, fathom, breakdown, pacman];
export const DEFAULT_TEMPLATE = pulsar;
export const findTemplate = (id) => TEMPLATES.find((t) => t.id === id) || DEFAULT_TEMPLATE;
