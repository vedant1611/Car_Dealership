import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Login Component', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('renders email, password inputs and a submit button', () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /submit|login/i })).toBeInTheDocument();
    });

    it('submits the form and calls the login API', async () => {
        // Mock the fetch API
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ access_token: "fake-jwt-token", token_type: "bearer" }),
            })
        );

        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );
        
        // Simulate user typing
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
        
        // Simulate click
        fireEvent.click(screen.getByRole('button', { name: /login/i }));
        
        // Assert API call
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/auth/login', expect.objectContaining({
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
            }));
        });
    });
});
