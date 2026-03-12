import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SurfaceLoader from '../SurfaceLoader';

describe('SurfaceLoader', () => {
  it('renders spinner with correct ARIA attributes', () => {
    render(<SurfaceLoader />);
    const el = screen.getByRole('status', { name: 'Loading surface' });
    expect(el).toBeTruthy();
  });
});
