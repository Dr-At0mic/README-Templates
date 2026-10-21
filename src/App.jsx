import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import TopBar from './components/TopBar';
import EditorPanel from './components/EditorPanel';
import TemplateGallery from './components/TemplateGallery';
import PreviewPanel from './components/PreviewPanel';
import ConnectDialog from './components/ConnectDialog';
import PublishDialog from './components/PublishDialog';
import { TEMPLATES, findTemplate } from './templates';
import { SAMPLE_PROFILE } from './data/sampleProfile';
import { fetchProfile } from './lib/github';
import { loadPref, savePref } from './lib/storage';
import {
  VaultError,
  clearVault,
  getToken,
  listAccounts,
  purgeLegacyPlaintext,
  removeAccount,
  saveAccount,
  setRemember,
  vaultAvailable,
} from './lib/vault';

const keyOf = (login) => login.toLowerCase();

export default function App() {
  const [templateId, setTemplateId] = useState(() => findTemplate(loadPref('template', '')).id);
  const template = findTemplate(templateId);

  // Two views: the editor (#/) and the template gallery (#/templates). Hash routing keeps the
  // browser's Back button working without a router dependency.
  const [route, setRoute] = useState(() => window.location.hash);
  useEffect(() => {
    const onHash = () => setRoute(window.location.hash);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const showGallery = route === '#/templates';
  const openGallery = () => {
    window.location.hash = '#/templates';
  };
  const closeGallery = useCallback(() => {
    if (window.history.length > 1 && window.location.hash === '#/templates') window.history.back();
    else window.location.hash = '';
  }, []);

  const chooseTemplate = (id) => {
    setTemplateId(id);
    savePref('template', id);
    closeGallery();
  };

  // Accounts. Decrypted tokens and per-account drafts live only in memory, keyed by lowercased login,
  // so switching accounts can never mix one account's token or edits with another's.
  const tokens = useRef(new Map());
  const drafts = useRef(new Map());
  const memoryOnly = useRef(new Map()); // accounts that couldn't be encrypted to storage
  const sampleDraft = useRef(SAMPLE_PROFILE);
  const requestSeq = useRef(0);

  const readAccounts = () => {
    const stored = listAccounts();
    const extra = [...memoryOnly.current.values()].filter((m) => !stored.some((s) => keyOf(s.login) === keyOf(m.login)));
    return [...stored, ...extra];
  };

  const [accounts, setAccounts] = useState(() => {
    purgeLegacyPlaintext();
    return readAccounts();
  });
  const refreshAccounts = () => setAccounts(readAccounts());

  const [activeLogin, setActiveLogin] = useState(null);
  // Data rule: static sample data when no account is active, live GitHub data when one is.
  const [profile, setProfile] = useState(SAMPLE_PROFILE);
  const [loading, setLoading] = useState(false);
  const [connectOpen, setConnectOpen] = useState(false);
  const [connectBusy, setConnectBusy] = useState(false);
  const [connectError, setConnectError] = useState('');
  const [publishOpen, setPublishOpen] = useState(false);
  const [banner, setBanner] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(() => loadPref('sidebar', 'open') === 'open');

  const signOut = useCallback(() => {
    requestSeq.current++;
    setActiveLogin(null);
    savePref('active', null);
    setPublishOpen(false);
    setLoading(false);
    setProfile(sampleDraft.current);
  }, []);

  const activate = useCallback(
    async (login) => {
      const seq = ++requestSeq.current;
      const key = keyOf(login);
      setActiveLogin(login);
      savePref('active', login);
      setPublishOpen(false);

      const draft = drafts.current.get(key);
      if (draft) {
        setProfile(draft);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const token = tokens.current.get(key) ?? (await getToken(login));
        tokens.current.set(key, token);
        const live = await fetchProfile(token);
        if (seq !== requestSeq.current) return; // user switched again meanwhile
        if (keyOf(live.login) !== key) throw new Error(`The saved key for @${login} now belongs to @${live.login}. Re-add it.`);
        drafts.current.set(key, live);
        setProfile(live);
      } catch (err) {
        if (seq !== requestSeq.current) return;
        if (err instanceof VaultError || err.status === 401) {
          removeAccount(login);
          tokens.current.delete(key);
          memoryOnly.current.delete(key);
          refreshAccounts();
          setBanner(`${err.message} @${login} was removed — add it again with a fresh token.`);
        } else {
          setBanner(`Couldn't load @${login}: ${err.message}`);
        }
        signOut();
      } finally {
        if (seq === requestSeq.current) setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [signOut]
  );

  // Restore the last active account (if its key is still saved).
  useEffect(() => {
    const last = loadPref('active', null);
    const match = last && accounts.find((a) => keyOf(a.login) === keyOf(last));
    if (match) activate(match.login);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddAccount = async (token, remember) => {
    setConnectBusy(true);
    setConnectError('');
    try {
      const live = await fetchProfile(token);
      const key = keyOf(live.login);
      const meta = { login: live.login, name: live.name, avatarUrl: live.avatarUrl };
      tokens.current.set(key, token);
      drafts.current.set(key, live);

      if (vaultAvailable) {
        try {
          await saveAccount(meta, token, remember);
          memoryOnly.current.delete(key);
        } catch (err) {
          memoryOnly.current.set(key, { ...meta, remember: false });
          setBanner(`Couldn't encrypt the key to browser storage (${err.message}). @${live.login} is kept in memory for this tab only.`);
        }
      } else {
        memoryOnly.current.set(key, { ...meta, remember: false });
      }

      refreshAccounts();
      setConnectOpen(false);
      activate(live.login);
    } catch (err) {
      setConnectError(err.message);
    } finally {
      setConnectBusy(false);
    }
  };

  const handleToggleRemember = async (login, remember) => {
    const key = keyOf(login);
    try {
      if (memoryOnly.current.has(key)) {
        const meta = memoryOnly.current.get(key);
        await saveAccount(meta, tokens.current.get(key), remember);
        memoryOnly.current.delete(key);
      } else {
        setRemember(login, remember);
      }
    } catch (err) {
      setBanner(err.message);
    }
    refreshAccounts();
  };

  const handleRemove = (login) => {
    const key = keyOf(login);
    removeAccount(login);
    tokens.current.delete(key);
    drafts.current.delete(key);
    memoryOnly.current.delete(key);
    refreshAccounts();
    if (activeLogin && keyOf(activeLogin) === key) signOut();
  };

  const handleClearAll = async () => {
    await clearVault();
    tokens.current.clear();
    drafts.current.clear();
    memoryOnly.current.clear();
    refreshAccounts();
    signOut();
    setBanner('All saved keys and the device encryption key were erased.');
  };

  const updateProfile = (patch) =>
    setProfile((p) => {
      const next = { ...p, ...patch };
      if (next.source === 'github') drafts.current.set(keyOf(next.login), next);
      else sampleDraft.current = next;
      return next;
    });

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((open) => {
      savePref('sidebar', open ? 'closed' : 'open');
      return !open;
    });
  }, []);

  // Ctrl/Cmd+B toggles the sidebar, as in most editors.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b' && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleSidebar]);

  const connected =
    Boolean(activeLogin) && !loading && profile.source === 'github' && keyOf(profile.login) === keyOf(activeLogin);
  const activeToken = activeLogin ? tokens.current.get(keyOf(activeLogin)) : null;

  const output = useMemo(() => template.render(profile), [template, profile]);
  const openConnect = () => {
    setConnectError('');
    setConnectOpen(true);
  };

  return (
    <div className="app">
      <TopBar
        connected={connected}
        loading={loading}
        onAddAccount={openConnect}
        onPublish={() => setPublishOpen(true)}
        accountMenu={{
          accounts,
          activeLogin,
          canPersist: vaultAvailable,
          onSwitch: activate,
          onAdd: openConnect,
          onSignOut: signOut,
          onToggleRemember: handleToggleRemember,
          onRemove: handleRemove,
          onClearAll: handleClearAll,
        }}
      />

      {banner && (
        <div className="banner" role="status">
          {banner}
          <button type="button" className="link-button" onClick={() => setBanner('')}>
            Dismiss
          </button>
        </div>
      )}

      {showGallery && (
        <TemplateGallery
          templates={TEMPLATES}
          activeId={template.id}
          profile={profile}
          onUse={chooseTemplate}
          onClose={closeGallery}
        />
      )}

      <main className={`workspace${sidebarOpen ? '' : ' is-collapsed'}`} hidden={showGallery}>
        <EditorPanel
          id="editor-panel"
          hidden={!sidebarOpen}
          template={template}
          onBrowseTemplates={openGallery}
          profile={profile}
          onChange={updateProfile}
          connected={connected}
          onConnect={openConnect}
        />
        <PreviewPanel
          output={output}
          login={profile.login}
          animated={Boolean(template.animated)}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={toggleSidebar}
        />
      </main>

      <ConnectDialog
        open={connectOpen}
        onClose={() => setConnectOpen(false)}
        onConnect={handleAddAccount}
        error={connectError}
        busy={connectBusy}
        canPersist={vaultAvailable}
        hasAccounts={accounts.length > 0}
      />

      {connected && activeToken && (
        <PublishDialog
          key={keyOf(activeLogin)}
          open={publishOpen}
          onClose={() => setPublishOpen(false)}
          token={activeToken}
          login={profile.login}
          output={output}
          templateName={template.name}
        />
      )}
    </div>
  );
}
