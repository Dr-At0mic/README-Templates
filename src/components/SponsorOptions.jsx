import { groupSponsors } from '../lib/sponsors';

// Sponsor settings in the sidebar's Support section. Everything here depends on what GitHub returned, so
// it stays out of the way for people with no Sponsors profile.
export default function SponsorOptions({ profile, form, onChange }) {
  const data = profile.sponsorData;
  const sponsors = data?.sponsors ?? [];
  const groups = groupSponsors(sponsors);
  const counts = [
    groups.top.length && `${groups.top.length} top`,
    groups.regular.length && `${groups.regular.length} sponsoring`,
    groups.oneTime.length && `${groups.oneTime.length} one-time`,
  ].filter(Boolean);
  const hasOwnLink = (profile.links || []).some((l) => l.id === 'githubsponsors');
  const canShowWall = sponsors.length > 0 || Boolean(data?.goal);

  return (
    <>
      {data?.unavailable && <p className="field-help">Couldn't read your sponsors with this key, so the sponsor options are hidden.</p>}

      {data?.hasListing && !hasOwnLink && form === 'profile' && (
        <label className="checkbox">
          <input type="checkbox" checked={profile.sponsorBadge !== false} onChange={(e) => onChange({ sponsorBadge: e.target.checked })} />
          Show my GitHub Sponsors badge
        </label>
      )}

      {canShowWall && (
        <div className="field">
          <label className="checkbox">
            <input type="checkbox" checked={Boolean(profile.sponsorWall)} onChange={(e) => onChange({ sponsorWall: e.target.checked })} />
            {form === 'sponsors' ? 'Thank my sponsors on this page' : 'Thank my sponsors in the README'}
          </label>
          <p className="field-help">
            {counts.length > 0 && `${counts.join(', ')}. `}
            Grouped by amount, without showing any amounts. Private sponsors are never included.
          </p>
        </div>
      )}

      {form === 'sponsors' && (
        <div className="field">
          <label htmlFor="sponsor-pitch">Why sponsor me</label>
          <textarea
            id="sponsor-pitch"
            rows={4}
            value={profile.sponsorPitch ?? ''}
            onChange={(e) => onChange({ sponsorPitch: e.target.value })}
            placeholder={profile.intro || 'What will sponsorship let you do?'}
          />
          <p className="field-help">The main text on your Sponsors page. Uses your intro if left empty. Markdown works.</p>
        </div>
      )}
    </>
  );
}
