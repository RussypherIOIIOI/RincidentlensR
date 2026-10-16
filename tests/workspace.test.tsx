// @vitest-environment jsdom
import { afterEach, describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Workspace } from '@/components/workspace';
import { loadScenarios } from '@/server/scenarios';
const scenarios = loadScenarios();
const liveArtifact = {
  ...scenarios[0].artifact,
  origin: 'live-generated',
  generatedAt: '2026-02-18T11:00:00.000Z',
  model: 'MOCK-MODEL',
};
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
describe('investigation workspace', () => {
  it('opens a saved report and switches immediately between all three scenarios', async () => {
    render(<Workspace scenarios={scenarios} liveEnabled={false} />);
    expect(screen.getByRole('heading', { level: 1, name: scenarios[0].title })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Database outage/ }));
    expect(screen.getByRole('heading', { level: 1, name: scenarios[1].title })).toBeInTheDocument();
    expect(screen.getByText(scenarios[1].artifact.report.summary[0].text)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Expired credential/ }));
    expect(
      screen.getByText(scenarios[2].artifact.report.missingInformation[0].text),
    ).toBeInTheDocument();
  });
  it('focuses and highlights a source when a citation is activated with the keyboard', async () => {
    render(<Workspace scenarios={scenarios} liveEnabled={false} />);
    const link = screen.getAllByRole('link', { name: 'View source s001-e03' })[0];
    link.focus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(document.getElementById('evidence-s001-e03')).toHaveFocus());
    expect(document.getElementById('evidence-s001-e03')).toHaveAttribute('data-selected', 'true');
  });
  it('resolves runbook citations to untimed reference context', async () => {
    render(<Workspace scenarios={scenarios} liveEnabled={false} />);
    await userEvent.click(screen.getAllByRole('link', { name: 'View source s001-r01' })[0]);
    await waitFor(() => expect(document.getElementById('evidence-s001-r01')).toHaveFocus());
    expect(screen.getByRole('heading', { name: 'Runbook reference' })).toBeInTheDocument();
  });
  it('keeps live generation disabled in the default demo', () => {
    const fetcher = vi.fn();
    vi.stubGlobal('fetch', fetcher);
    render(<Workspace scenarios={scenarios} liveEnabled={false} />);
    expect(screen.getByRole('button', { name: 'Generate live report' })).toBeDisabled();
    expect(fetcher).not.toHaveBeenCalled();
    expect(screen.getByText('AI-authored example · No live request')).toBeInTheDocument();
  });
  it('prevents duplicate generation and displays a valid live report', async () => {
    let resolve!: (response: Response) => void;
    const fetcher = vi.fn<(url: string, init: RequestInit) => Promise<Response>>(
      () =>
        new Promise<Response>((r) => {
          resolve = r;
        }),
    );
    vi.stubGlobal('fetch', fetcher);
    render(<Workspace scenarios={scenarios} liveEnabled />);
    const button = screen.getByRole('button', { name: 'Generate live report' });
    fireEvent.click(button);
    fireEvent.click(button);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(JSON.parse(String(fetcher.mock.calls[0][1].body))).toEqual({
      scenarioId: 'scenario-001',
    });
    await act(async () => resolve(Response.json({ artifact: liveArtifact })));
    await waitFor(() => expect(screen.getByText('Live-generated report')).toBeInTheDocument());
  });
  it('never lets a late response replace a newly selected scenario', async () => {
    let resolve!: (response: Response) => void;
    vi.stubGlobal(
      'fetch',
      vi.fn(
        () =>
          new Promise<Response>((r) => {
            resolve = r;
          }),
      ),
    );
    render(<Workspace scenarios={scenarios} liveEnabled />);
    await userEvent.click(screen.getByRole('button', { name: 'Generate live report' }));
    await userEvent.click(screen.getByRole('button', { name: /Database outage/ }));
    await act(async () => resolve(Response.json({ artifact: liveArtifact })));
    expect(screen.getByText(scenarios[1].artifact.report.summary[0].text)).toBeInTheDocument();
    expect(screen.queryByText('Live-generated report')).not.toBeInTheDocument();
  });
  it('preserves the valid report when generation fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json(
          {
            error: {
              code: 'UPSTREAM_UNAVAILABLE',
              message: 'Generation is unavailable. Try again later.',
            },
          },
          { status: 502 },
        ),
      ),
    );
    render(<Workspace scenarios={scenarios} liveEnabled />);
    await userEvent.click(screen.getByRole('button', { name: 'Generate live report' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Generation is unavailable');
    expect(screen.getByText(scenarios[0].artifact.report.summary[0].text)).toBeInTheDocument();
  });
  it('rejects a server response belonging to another scenario', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json({ artifact: { ...liveArtifact, scenarioId: 'scenario-002' } }),
      ),
    );
    render(<Workspace scenarios={scenarios} liveEnabled />);
    await userEvent.click(screen.getByRole('button', { name: 'Generate live report' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('could not be validated');
    expect(screen.getByText(scenarios[0].artifact.report.summary[0].text)).toBeInTheDocument();
  });
});

it('preserves the report and gives a safe message when a proxy returns non-JSON', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(
      async () =>
        new Response('<html>MOCK proxy failure</html>', {
          status: 502,
          headers: { 'content-type': 'text/html' },
        }),
    ),
  );
  render(<Workspace scenarios={scenarios} liveEnabled />);
  await userEvent.click(screen.getByRole('button', { name: 'Generate live report' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Generation is unavailable');
  expect(screen.getByText(scenarios[0].artifact.report.summary[0].text)).toBeInTheDocument();
});
