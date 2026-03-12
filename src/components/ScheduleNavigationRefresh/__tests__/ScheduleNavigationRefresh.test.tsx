import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import ScheduleNavigationRefresh from '../ScheduleNavigationRefresh';

const mockLoadScheduleStub = vi.fn(() => Promise.resolve());
vi.mock('../../../utils/ScheduleLoader', () => ({
  loadScheduleStub: (...args: unknown[]) => mockLoadScheduleStub(...args),
}));

let mockPathname = '/schedules';
vi.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: mockPathname }),
}));

describe('ScheduleNavigationRefresh', () => {
  it('calls loadScheduleStub when navigating to /schedules', () => {
    mockPathname = '/schedules';
    render(<ScheduleNavigationRefresh />);
    expect(mockLoadScheduleStub).toHaveBeenCalledOnce();
  });

  it('does not call loadScheduleStub for non-schedule paths', () => {
    mockPathname = '/mission/brief';
    mockLoadScheduleStub.mockClear();
    render(<ScheduleNavigationRefresh />);
    expect(mockLoadScheduleStub).not.toHaveBeenCalled();
  });
});
