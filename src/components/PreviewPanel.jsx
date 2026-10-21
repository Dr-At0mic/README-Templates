import { useMemo, useState } from 'react';
import { Check, Copy, Download, Moon, PanelLeftClose, PanelLeftOpen, RotateCcw, Sun } from 'lucide-react';
import { renderPreview } from '../lib/preview';
import { download } from '../lib/download';

export default function PreviewPanel({ output, login, animated, sidebarOpen, onToggleSidebar }) {
  const [view, setView] = useState('preview');
  const [theme, setTheme] = useState('dark');
  const [copied, setCopied] = useState(false);
  const [replay, setReplay] = useState(0);

  const html = useMemo(() => renderPreview(output, theme, replay), [output, theme, replay]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(output.markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked; the Markdown tab is still selectable */
    }
  };

  return (
    <section className="preview" aria-label="README preview">
      <div className="preview-toolbar">
        <div className="toolbar-start">
        <button
          type="button"
          className="icon-button"
          onClick={onToggleSidebar}
          aria-controls="editor-panel"
          aria-expanded={sidebarOpen}
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          title={`${sidebarOpen ? 'Collapse' : 'Expand'} sidebar (Ctrl+B)`}
        >
          {sidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
        </button>
        <div className="segmented" role="tablist" aria-label="View">
          {['preview', 'markdown'].map((v) => (
            <button key={v} type="button" role="tab" aria-selected={view === v} onClick={() => setView(v)}>
              {v === 'preview' ? 'Preview' : 'Markdown'}
            </button>
          ))}
        </div>
        </div>

        <div className="toolbar-actions">
          {view === 'preview' && animated && (
            <button
              type="button"
              className="button button-ghost"
              onClick={() => setReplay((n) => n + 1)}
              title="Restart the animations"
            >
              <RotateCcw size={14} aria-hidden="true" /> Replay
            </button>
          )}
          {view === 'preview' && (
            <button
              type="button"
              className="icon-button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label={`Preview in GitHub ${theme === 'dark' ? 'light' : 'dark'} theme`}
              title={`GitHub ${theme === 'dark' ? 'light' : 'dark'} theme`}
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          )}
          <button type="button" className="button button-ghost" onClick={copy}>
            {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            type="button"
            className="button button-ghost"
            onClick={() => download('README.md', output.markdown, 'text/markdown')}
          >
            <Download size={14} aria-hidden="true" /> README.md
          </button>
        </div>
      </div>

      <div className="preview-scroll">
        {view === 'preview' ? (
          <div className={`gh-frame gh-${theme}`}>
            <div className="gh-frame-header">
              <span className="mono">
                {login} / README<span className="muted">.md</span>
              </span>
            </div>
            <article className="gh-markdown" dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        ) : (
          <div className="code-view">
            <pre>
              <code>{output.markdown}</code>
            </pre>
            <div className="asset-list">
              <p className="label">Artwork — commit next to README.md</p>
              <ul>
                {Object.entries(output.assets).map(([path, svg]) => (
                  <li key={path}>
                    <code>{path}</code>
                    <button
                      type="button"
                      className="link-button"
                      onClick={() => download(path.split('/').pop(), svg, 'image/svg+xml')}
                    >
                      Download
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
