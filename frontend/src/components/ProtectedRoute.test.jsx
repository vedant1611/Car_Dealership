import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Helper component to check the current location after navigation
const LocationDisplay = () => {
    const location = useLocation();
    return <div data-testid="location-display">{location.pathname}</div>;
};

describe('ProtectedRoute Component', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('redirects to the root route (/) and does not render content if user is not logged in', () => {
        // Mock localStorage to simulate logged out state (no token)
        vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);

        render(
            <MemoryRouter initialEntries={['/dashboard']}>
                <Routes>
                    <Route 
                        path="/dashboard" 
                        element={
                            <ProtectedRoute>
                                <div data-testid="protected-content">Protected Content</div>
                            </ProtectedRoute>
                        } 
                    />
                    <Route path="/" element={<LocationDisplay />} />
                </Routes>
            </MemoryRouter>
        );

        // Should NOT render protected content
        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
        
        // Should have redirected to / (so LocationDisplay renders "/")
        expect(screen.getByTestId('location-display')).toHaveTextContent('/');
    });
});
