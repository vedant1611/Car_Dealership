import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { describe, it, expect, vi } from 'vitest';

// Mock the child components
vi.mock('./components/Login', () => ({
    default: () => <div data-testid="login-mock">Mocked Login</div>
}));

vi.mock('./components/InventoryDashboard', () => ({
    default: () => <div data-testid="dashboard-mock">Mocked Dashboard</div>
}));

describe('App Routing', () => {
    it('renders the Login component on the root route /', () => {
        render(
            <MemoryRouter initialEntries={['/']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByTestId('login-mock')).toBeInTheDocument();
    });

    it('renders the InventoryDashboard component on the /dashboard route', () => {
        render(
            <MemoryRouter initialEntries={['/dashboard']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByTestId('dashboard-mock')).toBeInTheDocument();
    });
});
