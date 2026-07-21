import { render, screen, waitFor } from '@testing-library/react';
import InventoryDashboard from './InventoryDashboard';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('InventoryDashboard Component', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        // Mock localStorage
        vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
            if (key === 'token') return 'fake-jwt-token';
            return null;
        });
    });

    it('fetches and displays a list of vehicles', async () => {
        const mockVehicles = [
            { id: 1, make: 'Toyota', model: 'Camry', year: 2023, price: 25000, quantity: 5 },
            { id: 2, make: 'Honda', model: 'Civic', year: 2022, price: 22000, quantity: 3 }
        ];

        // Mock fetch
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockVehicles),
            })
        );

        render(<InventoryDashboard />);

        // Wait for the vehicles to be rendered
        await waitFor(() => {
            expect(screen.getByText(/Toyota/i)).toBeInTheDocument();
            expect(screen.getByText(/Camry/i)).toBeInTheDocument();
            
            expect(screen.getByText(/Honda/i)).toBeInTheDocument();
            expect(screen.getByText(/Civic/i)).toBeInTheDocument();
        });

        // Assert fetch was called with correct headers
        expect(global.fetch).toHaveBeenCalledWith(
            '/api/vehicles',
            expect.objectContaining({
                headers: expect.objectContaining({
                    'Authorization': 'Bearer fake-jwt-token'
                })
            })
        );
    });
});
