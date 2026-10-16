import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'IncidentLens — Evidence-first investigations',
  description:
    'Explore three synthetic incidents through chronological evidence, transparent reports, and clickable source references.',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
