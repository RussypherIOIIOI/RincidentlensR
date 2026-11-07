import type { Metadata } from 'next';
import { SiteFooter, SiteHeader } from '../components/site';

export const metadata: Metadata = {
  title: 'Page not found · IncidentLens',
};

export default function NotFound() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="band not-found" tabIndex={-1}>
        <div className="band-inner">
          <p className="eyebrow">Error 404 · No matching record</p>
          <h1>This page has no source record.</h1>
          <p className="not-found-lead">
            The address does not match anything in IncidentLens. The three investigations are on the
            home page.
          </p>
          <a className="btn btn-primary" href="/#workspace">
            Open the investigation
          </a>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
