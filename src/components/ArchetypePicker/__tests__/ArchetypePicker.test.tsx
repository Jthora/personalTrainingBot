import { render, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ArchetypePicker from '../ArchetypePicker';
import { getArchetypeCatalog } from '../../../data/archetypes';

vi.mock('../../../utils/telemetry', () => ({
    trackEvent: vi.fn(),
}));

describe('ArchetypePicker', () => {
    const onSelect = vi.fn();
    const onSkip = vi.fn();

    beforeEach(() => {
        onSelect.mockReset();
        onSkip.mockReset();
    });

    it('renders all 8 archetype cards', () => {
        const { getAllByRole } = render(
            <ArchetypePicker onSelect={onSelect} />,
        );
        const radios = getAllByRole('radio');
        expect(radios).toHaveLength(8);
    });

    it('shows archetype names', () => {
        const catalog = getArchetypeCatalog();
        const { getByText } = render(
            <ArchetypePicker onSelect={onSelect} />,
        );
        for (const a of catalog) {
            expect(getByText(a.name)).toBeTruthy();
        }
    });

    it('confirm button is disabled until selection', () => {
        const { getByTestId } = render(
            <ArchetypePicker onSelect={onSelect} />,
        );
        const btn = getByTestId('archetype-confirm') as HTMLButtonElement;
        expect(btn.disabled).toBe(true);
    });

    it('selecting a card enables confirm', () => {
        const { getByTestId } = render(
            <ArchetypePicker onSelect={onSelect} />,
        );
        fireEvent.click(getByTestId('archetype-card-rescue_ranger'));
        const btn = getByTestId('archetype-confirm') as HTMLButtonElement;
        expect(btn.disabled).toBe(false);
    });

    it('confirming calls onSelect with the archetype definition', () => {
        const { getByTestId } = render(
            <ArchetypePicker onSelect={onSelect} />,
        );
        fireEvent.click(getByTestId('archetype-card-cyber_sentinel'));
        fireEvent.click(getByTestId('archetype-confirm'));
        expect(onSelect).toHaveBeenCalledTimes(1);
        expect(onSelect.mock.calls[0][0].id).toBe('cyber_sentinel');
    });

    it('renders skip button when onSkip is provided', () => {
        const { getByTestId } = render(
            <ArchetypePicker onSelect={onSelect} onSkip={onSkip} />,
        );
        fireEvent.click(getByTestId('archetype-skip'));
        expect(onSkip).toHaveBeenCalledTimes(1);
    });

    it('does not render skip button when onSkip is omitted', () => {
        const { queryByTestId } = render(
            <ArchetypePicker onSelect={onSelect} />,
        );
        expect(queryByTestId('archetype-skip')).toBeNull();
    });

    it('respects initialArchetypeId', () => {
        const { getByTestId } = render(
            <ArchetypePicker onSelect={onSelect} initialArchetypeId="psi_operative" />,
        );
        const card = getByTestId('archetype-card-psi_operative');
        expect(card.getAttribute('aria-checked')).toBe('true');
        const btn = getByTestId('archetype-confirm') as HTMLButtonElement;
        expect(btn.disabled).toBe(false);
    });

    it('shows core module badges on each card', () => {
        const { getByTestId } = render(
            <ArchetypePicker onSelect={onSelect} />,
        );
        const card = getByTestId('archetype-card-rescue_ranger');
        // Search & Rescue has core modules: combat, counter_biochem, fitness, investigation
        expect(card.textContent).toContain('combat');
        expect(card.textContent).toContain('fitness');
    });

    it('keyboard Enter selects a card', () => {
        const { getByTestId } = render(
            <ArchetypePicker onSelect={onSelect} />,
        );
        const card = getByTestId('archetype-card-shadow_agent');
        fireEvent.keyDown(card, { key: 'Enter' });
        expect(card.getAttribute('aria-checked')).toBe('true');
    });
});
