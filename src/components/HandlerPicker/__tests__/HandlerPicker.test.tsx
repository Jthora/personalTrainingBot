import { render, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import HandlerPicker from '../HandlerPicker';

vi.mock('../../../utils/telemetry', () => ({
    trackEvent: vi.fn(),
}));

// Mock handler icon imports — Vitest resolves .png to a string stub
vi.mock('../../../assets/images/icons/handlers/tiger_fitness_god-icon.png', () => ({ default: 'tiger.png' }));
vi.mock('../../../assets/images/icons/handlers/jono_thora-icon.png', () => ({ default: 'jono.png' }));
vi.mock('../../../assets/images/icons/handlers/tara_van_dekar-icon.png', () => ({ default: 'tara.png' }));
vi.mock('../../../assets/images/icons/handlers/agent_simon-icon.png', () => ({ default: 'simon.png' }));
vi.mock('../../../assets/images/icons/handlers/StarcomCommander_01.png', () => ({ default: 'raynor.png' }));

describe('HandlerPicker', () => {
    const onSelect = vi.fn();
    const onBack = vi.fn();

    beforeEach(() => {
        onSelect.mockReset();
        onBack.mockReset();
    });

    it('renders all 5 handler cards', () => {
        const { getAllByRole } = render(
            <HandlerPicker onSelect={onSelect} />,
        );
        expect(getAllByRole('radio')).toHaveLength(5);
    });

    it('shows handler names', () => {
        const { getByText } = render(
            <HandlerPicker onSelect={onSelect} />,
        );
        expect(getByText('Commander Tygan')).toBeTruthy();
        expect(getByText('Agent Simon')).toBeTruthy();
        expect(getByText('Captain Raynor')).toBeTruthy();
    });

    it('shows recommended badge on the recommended handler', () => {
        const { getByTestId } = render(
            <HandlerPicker onSelect={onSelect} recommendedHandlerId="tiger_fitness_god" />,
        );
        const card = getByTestId('handler-card-tiger_fitness_god');
        expect(card.textContent).toContain('Recommended');
    });

    it('does not show recommended badge when no recommendedHandlerId', () => {
        const { queryByTestId } = render(
            <HandlerPicker onSelect={onSelect} />,
        );
        expect(queryByTestId('recommended-badge')).toBeNull();
    });

    it('pre-selects recommended handler by default', () => {
        const { getByTestId } = render(
            <HandlerPicker onSelect={onSelect} recommendedHandlerId="agent_simon" />,
        );
        const card = getByTestId('handler-card-agent_simon');
        expect(card.getAttribute('aria-checked')).toBe('true');
    });

    it('confirm button works after selection', () => {
        const { getByTestId } = render(
            <HandlerPicker onSelect={onSelect} />,
        );
        fireEvent.click(getByTestId('handler-card-jono_thora'));
        fireEvent.click(getByTestId('handler-confirm'));
        expect(onSelect).toHaveBeenCalledTimes(1);
        expect(onSelect.mock.calls[0][0].id).toBe('jono_thora');
    });

    it('renders back button when onBack provided', () => {
        const { getByTestId } = render(
            <HandlerPicker onSelect={onSelect} onBack={onBack} />,
        );
        fireEvent.click(getByTestId('handler-back'));
        expect(onBack).toHaveBeenCalledTimes(1);
    });

    it('does not render back button when onBack omitted', () => {
        const { queryByTestId } = render(
            <HandlerPicker onSelect={onSelect} />,
        );
        expect(queryByTestId('handler-back')).toBeNull();
    });

    it('respects initialHandlerId', () => {
        const { getByTestId } = render(
            <HandlerPicker onSelect={onSelect} initialHandlerId="tara_van_dekar" />,
        );
        const card = getByTestId('handler-card-tara_van_dekar');
        expect(card.getAttribute('aria-checked')).toBe('true');
    });

    it('keyboard Enter selects a handler', () => {
        const { getByTestId } = render(
            <HandlerPicker onSelect={onSelect} />,
        );
        const card = getByTestId('handler-card-star_commander_raynor');
        fireEvent.keyDown(card, { key: 'Enter' });
        expect(card.getAttribute('aria-checked')).toBe('true');
    });
});
