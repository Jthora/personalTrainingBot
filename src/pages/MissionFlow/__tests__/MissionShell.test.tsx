import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import MissionShell from '../MissionShell';

// Stub all child components
vi.mock('../../../components/Header/Header', () => ({ default: () => <header data-testid="header" /> }));
vi.mock('../../../components/CelebrationLayer/CelebrationLayer', () => ({ default: () => <div data-testid="celebration" /> }));
vi.mock('../../../components/MissionHeader/MissionHeader', () => ({ default: () => <div data-testid="mission-header" /> }));
vi.mock('../../../components/MissionActionPalette/MissionActionPalette', () => ({
  default: ({ isOpen, onClose, onSelect }: { isOpen: boolean; onClose: () => void; onSelect: (a: { path: string; search?: string; id: string }) => void }) =>
    isOpen ? <div data-testid="palette"><button onClick={onClose}>close-palette</button><button onClick={() => onSelect({ path: '/mission/triage', id: 'tab:/mission/triage' })}>pick-triage</button></div> : null,
}));
vi.mock('../../../components/MissionIntakePanel/MissionIntakePanel', () => ({
  default: ({ onStartBriefing, onDismiss }: { onStartBriefing: () => void; onDismiss: () => void }) =>
    <div data-testid="intake"><button onClick={onStartBriefing}>Start</button><button onClick={onDismiss}>Dismiss</button></div>,
}));
vi.mock('../../../components/ArchetypePicker/ArchetypePicker', () => ({
  default: ({ onSelect, onSkip }: { onSelect: (a: { id: string; recommendedHandler: string }) => void; onSkip: () => void }) =>
    <div data-testid="archetype-picker"><button onClick={() => onSelect({ id: 'arch-1', recommendedHandler: 'h-1' })}>Pick</button><button onClick={onSkip}>Skip</button></div>,
}));
vi.mock('../../../components/HandlerPicker/HandlerPicker', () => ({
  default: ({ onSelect, onBack }: { onSelect: (h: { id: string }) => void; onBack: () => void }) =>
    <div data-testid="handler-picker"><button onClick={() => onSelect({ id: 'h-1' })}>Select</button><button onClick={onBack}>Back</button></div>,
}));

const mockNavigate = vi.fn();
let mockPathname = '/mission/brief';
vi.mock('react-router-dom', () => ({
  Outlet: () => <div data-testid="outlet" />,
  useLocation: () => ({ pathname: mockPathname }),
  useNavigate: () => mockNavigate,
}));

vi.mock('../../../utils/telemetry', () => ({ trackEvent: vi.fn() }));
vi.mock('../../../hooks/useMissionFlowContinuity', () => ({ useMissionFlowContinuity: () => ({ routeSearch: '' }) }));
vi.mock('../../../hooks/useIsMobile', () => ({ default: () => false }));
vi.mock('../../../store/missionFlow/continuity', () => ({
  readMissionFlowContext: vi.fn(() => ({ operationId: 'op-1', caseId: 'c-1', signalId: 's-1' })),
}));
vi.mock('../../../store/OperativeProfileStore', () => ({
  default: { get: vi.fn(() => ({ archetypeId: 'test', handlerId: 'h1' })), set: vi.fn() },
}));
vi.mock('../../../utils/missionTelemetryContracts', () => ({
  buildMissionTransitionPayload: vi.fn(() => ({})),
  missionRoutePaths: ['/mission/brief', '/mission/triage', '/mission/case', '/mission/signal', '/mission/checklist', '/mission/debrief', '/mission/stats', '/mission/plan'],
}));
vi.mock('../../../utils/mission/iconography', () => ({
  missionEntityIcons: { operation: '📋', lead: '🔍', case: '📁', signal: '📡', artifact: '✅', debrief: '📝' },
}));
vi.mock('../../../utils/archetypeHints', () => ({
  getArchetypeHints: vi.fn(() => null),
}));

describe('MissionShell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = '/mission/brief';
    window.localStorage.clear();
    // Mark onboarding and intake as seen to skip gates by default
    window.localStorage.setItem('mission:guidance-overlay:v1', 'seen');
    window.localStorage.setItem('mission:intake:v1', 'seen');
  });

  it('renders Header, CelebrationLayer, and Outlet', () => {
    render(<MissionShell />);
    expect(screen.getByTestId('header')).toBeTruthy();
    expect(screen.getByTestId('celebration')).toBeTruthy();
    expect(screen.getByTestId('outlet')).toBeTruthy();
  });

  it('renders step tools with current/next step badges', () => {
    render(<MissionShell />);
    expect(screen.getByText(/Current Step:.*Brief/)).toBeTruthy();
    expect(screen.getByText(/Next Step:.*Triage/)).toBeTruthy();
  });

  it('renders main content area with Outlet', () => {
    render(<MissionShell />);
    const main = screen.getByRole('main');
    expect(main).toBeTruthy();
    expect(main.id).toBe('main-content');
    expect(screen.getByTestId('outlet')).toBeTruthy();
  });

  it('renders MissionHeader when not onboarding', () => {
    render(<MissionShell />);
    expect(screen.getByTestId('mission-header')).toBeTruthy();
  });

  it('Mark Step Complete toggles button text', () => {
    render(<MissionShell />);
    const btn = screen.getByText('Mark Step Complete');
    fireEvent.click(btn);
    expect(screen.getByText('✓ Step Complete')).toBeTruthy();
  });

  it('Continue to next step navigates', () => {
    render(<MissionShell />);
    fireEvent.click(screen.getByText(/Continue to Triage/));
    expect(mockNavigate).toHaveBeenCalledWith(expect.objectContaining({ pathname: '/mission/triage' }));
  });

  it('⌘K keyboard shortcut opens action palette', () => {
    render(<MissionShell />);
    expect(screen.queryByTestId('palette')).toBeNull();
    act(() => {
      fireEvent.keyDown(window, { key: 'k', metaKey: true });
    });
    expect(screen.getByTestId('palette')).toBeTruthy();
  });

  it('renders operator assistant guidance card', () => {
    render(<MissionShell />);
    expect(screen.getByRole('region', { name: /Operator assistant guidance/ })).toBeTruthy();
    expect(screen.getByText(/SOP prompt:/)).toBeTruthy();
  });
});
