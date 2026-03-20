import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotFound from '../NotFound';

describe('NotFound', () => {
  it('renders 404 page with branding and navigation', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>,
    );

    expect(screen.getByText('404')).toBeTruthy();
    expect(screen.getByText('Sector Not Found')).toBeTruthy();
    expect(screen.getByText(/coordinates you entered/)).toBeTruthy();

    const link = screen.getByRole('link', { name: /Return to Base/ });
    expect(link.getAttribute('href')).toBe('/train');
  });

  it('has accessible main landmark', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>,
    );

    expect(screen.getByRole('main')).toBeTruthy();
  });
});
