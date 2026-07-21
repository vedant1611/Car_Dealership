import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const LocationDisplay = () => {
    const location = useLocation();
    return <div data-testid="location-display">{location.pathname}</div>;
};

describe('Navbar Component', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        // Mock localStorage
        vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('fake-jwt-token');
        vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {});
    });

    it('renders logout button and navigates to / on click', () => {
        render(
            <MemoryRouter initialEntries={['/dashboard']}>
                <Navbar />
                <Routes>
                    <Route path="/dashboard" element={<div />} />
                    <Route path="/" element={<LocationDisplay />} />
                </Routes>
            </MemoryRouter>
        );

        const logoutButton = screen.getByRole('button', { name: /logout/i });
        expect(logoutButton).toBeInTheDocument();

        fireEvent.click(logoutButton);

        // Assert localStorage.removeItem was called
        expect(Storage.prototype.removeItem).toHaveBeenCalledWith('token');

        // Assert navigation to /
        expect(screen.getByTestId('location-display')).toHaveTextContent('/');
    });
});
