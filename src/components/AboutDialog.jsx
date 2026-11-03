import { useState } from 'react';
import { ExternalLink, Info } from 'lucide-react';
import Dialog from './Dialog';
import { BrandTile } from './LinksEditor';
import { ABOUT } from '../data/about';
import { linkType } from '../lib/links';
import { version } from '../../package.json';

const hostAndPath = (url) => url.replace(/^https?:\/\//, '').replace(/\/$/, '');

export default function AboutDialog() {
  const [open, setOpen] = useState(false);
  const { developer, repo, support } = ABOUT;

  return (
    <>
      <button
        type="button"
        className="icon-button"
        onClick={() => setOpen(true)}
        aria-label="About README Templates and its developer"
        title="About"
      >
        <Info size={16} aria-hidden="true" />
      </button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="About README Templates"
        description={`Version ${version}. Free and open source under the MIT license.`}
      >
        <div className="stack">
          <section className="about-section">
            <p className="eyebrow">About the developer</p>
            <p className="about-name">{developer.name}</p>
            <p className="about-role">{developer.role}</p>
            <ul className="about-links">
              {[developer.website, developer.github, repo].map((url) => (
                <li key={url}>
                  <a href={url} target="_blank" rel="noreferrer">
                    {hostAndPath(url)} <ExternalLink size={12} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section className="about-section">
            <p className="eyebrow">Support this project</p>
            <p className="note">This app is free. If it helped your profile, you can back the work here.</p>
            <div className="about-support">
              {support.map(({ id, url }) => {
                const type = linkType(id);
                return (
                  <a key={id} className="button about-support-link" href={url} target="_blank" rel="noreferrer">
                    <BrandTile type={type} />
                    {type.label}
                  </a>
                );
              })}
            </div>
          </section>
        </div>
      </Dialog>
    </>
  );
}
