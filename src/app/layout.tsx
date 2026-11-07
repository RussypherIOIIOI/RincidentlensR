import type { Metadata, Viewport } from 'next';
import { preload } from 'react-dom';
import './globals.css';

// Self-hosted TMC type stack (all SIL OFL 1.1). Families keep their real names so the
// brand token stacks apply unchanged. Preload the faces used above the fold.
const criticalFonts = [
  '/fonts/poppins-latin-600-normal.woff2',
  '/fonts/lora-latin-400-normal.woff2',
  '/fonts/space-grotesk-latin-500-normal.woff2',
  '/fonts/MatrixSans-Regular.woff2',
];

export const metadata: Metadata = {
  title: 'IncidentLens — Evidence-first investigations · The Meredith Collective',
  description:
    'Explore three synthetic incidents through a chronological evidence timeline and reports whose every statement links back to its source record. A portfolio project from The Meredith Collective.',
  applicationName: 'IncidentLens',
  openGraph: {
    title: 'IncidentLens — Trace every claim back to its evidence',
    description:
      'Three synthetic incidents, inspectable reports, and citations that resolve to the exact source record.',
    siteName: 'The Meredith Collective',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#08070d',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  for (const href of criticalFonts)
    preload(href, { as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' });
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
