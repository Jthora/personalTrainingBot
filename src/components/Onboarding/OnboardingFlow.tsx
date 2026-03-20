import GuidanceOverlay from './GuidanceOverlay';
import ArchetypePicker from '../../components/ArchetypePicker/ArchetypePicker';
import HandlerPicker from '../../components/HandlerPicker/HandlerPicker';
import MissionIntakePanel from '../../components/MissionIntakePanel/MissionIntakePanel';
import type { OnboardingState } from '../../hooks/useOnboardingState';

interface OnboardingFlowProps {
  /** Onboarding state from useOnboardingState hook */
  state: OnboardingState;
  /** Callback when intake "Start Briefing" is clicked */
  onStartBriefing: () => void;
}

/**
 * Shared onboarding flow orchestrator.
 * Renders the correct step based on the state machine in useOnboardingState.
 * Used by both AppShell and MissionLayout.
 */
const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ state, onStartBriefing }) => {
  const {
    step,
    pendingArchetype,
    dismissGuidance,
    selectArchetype,
    skipArchetype,
    selectHandler,
    goBackToArchetype,
    dismissIntake,
  } = state;

  switch (step) {
    case 'guidance':
      return (
        <GuidanceOverlay
          onFastPath={() => dismissGuidance('fast-path')}
          onChooseFocus={() => dismissGuidance('choose-focus')}
        />
      );

    case 'archetype':
      return (
        <ArchetypePicker
          onSelect={selectArchetype}
          onSkip={skipArchetype}
        />
      );

    case 'handler':
      return pendingArchetype ? (
        <HandlerPicker
          recommendedHandlerId={pendingArchetype.recommendedHandler}
          onSelect={selectHandler}
          onBack={goBackToArchetype}
        />
      ) : null;

    case 'intake':
      return (
        <MissionIntakePanel
          onStartBriefing={() => {
            dismissIntake();
            onStartBriefing();
          }}
          onDismiss={dismissIntake}
        />
      );

    default:
      return null;
  }
};

export default OnboardingFlow;
