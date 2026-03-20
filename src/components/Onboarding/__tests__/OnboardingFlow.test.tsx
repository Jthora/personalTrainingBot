import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import OnboardingFlow from '../OnboardingFlow';
import type { OnboardingState } from '../../../hooks/useOnboardingState';

// Stub child components
vi.mock('../GuidanceOverlay', () => ({
  default: ({ onFastPath, onChooseFocus }: { onFastPath: () => void; onChooseFocus: () => void }) => (
    <div data-testid="guidance-overlay">
      <button onClick={onFastPath}>fast-path</button>
      <button onClick={onChooseFocus}>choose-focus</button>
    </div>
  ),
}));
vi.mock('../../../components/ArchetypePicker/ArchetypePicker', () => ({
  default: ({ onSelect, onSkip }: { onSelect: (a: { id: string; recommendedHandler: string }) => void; onSkip: () => void }) => (
    <div data-testid="archetype-picker">
      <button onClick={() => onSelect({ id: 'arch-1', recommendedHandler: 'h-1' } as any)}>pick-archetype</button>
      <button onClick={onSkip}>skip-archetype</button>
    </div>
  ),
}));
vi.mock('../../../components/HandlerPicker/HandlerPicker', () => ({
  default: ({ onSelect, onBack }: { onSelect: (h: { id: string }) => void; onBack: () => void }) => (
    <div data-testid="handler-picker">
      <button onClick={() => onSelect({ id: 'h-1' } as any)}>pick-handler</button>
      <button onClick={onBack}>back-to-archetype</button>
    </div>
  ),
}));
vi.mock('../../../components/MissionIntakePanel/MissionIntakePanel', () => ({
  default: ({ onStartBriefing, onDismiss }: { onStartBriefing: () => void; onDismiss: () => void }) => (
    <div data-testid="intake-panel">
      <button onClick={onStartBriefing}>start-briefing</button>
      <button onClick={onDismiss}>dismiss-intake</button>
    </div>
  ),
}));

function makeState(overrides: Partial<OnboardingState> = {}): OnboardingState {
  return {
    step: 'done',
    isOnboarding: false,
    pendingArchetype: null,
    dismissGuidance: vi.fn(),
    selectArchetype: vi.fn(),
    skipArchetype: vi.fn(),
    selectHandler: vi.fn(),
    goBackToArchetype: vi.fn(),
    dismissIntake: vi.fn(),
    ...overrides,
  };
}

describe('OnboardingFlow', () => {
  const onStartBriefing = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when step is done', () => {
    const { container } = render(
      <OnboardingFlow state={makeState()} onStartBriefing={onStartBriefing} />,
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders GuidanceOverlay on guidance step', () => {
    render(
      <OnboardingFlow
        state={makeState({ step: 'guidance', isOnboarding: true })}
        onStartBriefing={onStartBriefing}
      />,
    );
    expect(screen.getByTestId('guidance-overlay')).toBeTruthy();
  });

  it('fast-path calls dismissGuidance with fast-path', () => {
    const dismissGuidance = vi.fn();
    render(
      <OnboardingFlow
        state={makeState({ step: 'guidance', isOnboarding: true, dismissGuidance })}
        onStartBriefing={onStartBriefing}
      />,
    );
    fireEvent.click(screen.getByText('fast-path'));
    expect(dismissGuidance).toHaveBeenCalledWith('fast-path');
  });

  it('choose-focus calls dismissGuidance with choose-focus', () => {
    const dismissGuidance = vi.fn();
    render(
      <OnboardingFlow
        state={makeState({ step: 'guidance', isOnboarding: true, dismissGuidance })}
        onStartBriefing={onStartBriefing}
      />,
    );
    fireEvent.click(screen.getByText('choose-focus'));
    expect(dismissGuidance).toHaveBeenCalledWith('choose-focus');
  });

  it('renders ArchetypePicker on archetype step', () => {
    render(
      <OnboardingFlow
        state={makeState({ step: 'archetype', isOnboarding: true })}
        onStartBriefing={onStartBriefing}
      />,
    );
    expect(screen.getByTestId('archetype-picker')).toBeTruthy();
  });

  it('archetype pick calls selectArchetype', () => {
    const selectArchetype = vi.fn();
    render(
      <OnboardingFlow
        state={makeState({ step: 'archetype', isOnboarding: true, selectArchetype })}
        onStartBriefing={onStartBriefing}
      />,
    );
    fireEvent.click(screen.getByText('pick-archetype'));
    expect(selectArchetype).toHaveBeenCalled();
  });

  it('archetype skip calls skipArchetype', () => {
    const skipArchetype = vi.fn();
    render(
      <OnboardingFlow
        state={makeState({ step: 'archetype', isOnboarding: true, skipArchetype })}
        onStartBriefing={onStartBriefing}
      />,
    );
    fireEvent.click(screen.getByText('skip-archetype'));
    expect(skipArchetype).toHaveBeenCalled();
  });

  it('renders HandlerPicker on handler step with pendingArchetype', () => {
    render(
      <OnboardingFlow
        state={makeState({
          step: 'handler',
          isOnboarding: true,
          pendingArchetype: { id: 'a1', recommendedHandler: 'h-rec' } as any,
        })}
        onStartBriefing={onStartBriefing}
      />,
    );
    expect(screen.getByTestId('handler-picker')).toBeTruthy();
  });

  it('handler pick calls selectHandler', () => {
    const selectHandler = vi.fn();
    render(
      <OnboardingFlow
        state={makeState({
          step: 'handler',
          isOnboarding: true,
          pendingArchetype: { id: 'a1', recommendedHandler: 'h-rec' } as any,
          selectHandler,
        })}
        onStartBriefing={onStartBriefing}
      />,
    );
    fireEvent.click(screen.getByText('pick-handler'));
    expect(selectHandler).toHaveBeenCalled();
  });

  it('handler back calls goBackToArchetype', () => {
    const goBackToArchetype = vi.fn();
    render(
      <OnboardingFlow
        state={makeState({
          step: 'handler',
          isOnboarding: true,
          pendingArchetype: { id: 'a1', recommendedHandler: 'h-rec' } as any,
          goBackToArchetype,
        })}
        onStartBriefing={onStartBriefing}
      />,
    );
    fireEvent.click(screen.getByText('back-to-archetype'));
    expect(goBackToArchetype).toHaveBeenCalled();
  });

  it('renders nothing for handler step without pendingArchetype', () => {
    const { container } = render(
      <OnboardingFlow
        state={makeState({ step: 'handler', isOnboarding: true, pendingArchetype: null })}
        onStartBriefing={onStartBriefing}
      />,
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders MissionIntakePanel on intake step', () => {
    render(
      <OnboardingFlow
        state={makeState({ step: 'intake', isOnboarding: true })}
        onStartBriefing={onStartBriefing}
      />,
    );
    expect(screen.getByTestId('intake-panel')).toBeTruthy();
  });

  it('intake start-briefing calls dismissIntake then onStartBriefing', () => {
    const dismissIntake = vi.fn();
    render(
      <OnboardingFlow
        state={makeState({ step: 'intake', isOnboarding: true, dismissIntake })}
        onStartBriefing={onStartBriefing}
      />,
    );
    fireEvent.click(screen.getByText('start-briefing'));
    expect(dismissIntake).toHaveBeenCalled();
    expect(onStartBriefing).toHaveBeenCalled();
  });

  it('intake dismiss calls dismissIntake without onStartBriefing', () => {
    const dismissIntake = vi.fn();
    render(
      <OnboardingFlow
        state={makeState({ step: 'intake', isOnboarding: true, dismissIntake })}
        onStartBriefing={onStartBriefing}
      />,
    );
    fireEvent.click(screen.getByText('dismiss-intake'));
    expect(dismissIntake).toHaveBeenCalled();
    expect(onStartBriefing).not.toHaveBeenCalled();
  });
});
