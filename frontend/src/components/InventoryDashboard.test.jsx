import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import InventoryDashboard from './InventoryDashboard';
import { ToastProvider } from '../context/ToastContext';
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

        render(
            <ToastProvider>
                <InventoryDashboard />
            </ToastProvider>
        );

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

    it('opens CreateVehicleModal, submits data, closes modal, and shows success toast', async () => {
        // Mock fetch for both the initial GET and the subsequent POST
        global.fetch = vi.fn((url, options) => {
            if (options && options.method === 'POST') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ id: 3, make: 'Ford', model: 'Mustang', year: '2024', price: '45000', vin: 'F123' })
                });
            }
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve([]),
            });
        });

        render(
            <ToastProvider>
                <InventoryDashboard />
            </ToastProvider>
        );

        // Wait for initial render
        await waitFor(() => {
            expect(screen.getByText(/No vehicles found/i)).toBeInTheDocument();
        });

        // 1) Dashboard renders 'Add Vehicle' button
        const addVehicleBtn = screen.getByRole('button', { name: /add vehicle/i });
        expect(addVehicleBtn).toBeInTheDocument();

        // 2) Clicking it opens the CreateVehicleModal
        fireEvent.click(addVehicleBtn);
        
        const modalHeading = screen.getByText(/add new vehicle/i);
        expect(modalHeading).toBeInTheDocument();

        // 3) Simulate submitting modal form
        fireEvent.change(screen.getByLabelText(/make/i), { target: { value: 'Ford' } });
        fireEvent.change(screen.getByLabelText(/model/i), { target: { value: 'Mustang' } });
        fireEvent.change(screen.getByLabelText(/year/i), { target: { value: '2024' } });
        fireEvent.change(screen.getByLabelText(/price/i), { target: { value: '45000' } });
        fireEvent.change(screen.getByLabelText(/vin/i), { target: { value: 'F123' } });

        const submitBtn = screen.getByRole('button', { name: /save/i });
        fireEvent.click(submitBtn);

        // 4) Assert POST request to /api/vehicles
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                '/api/vehicles',
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.objectContaining({
                        'Authorization': 'Bearer fake-jwt-token',
                        'Content-Type': 'application/json'
                    }),
                    body: JSON.stringify({
                        make: 'Ford',
                        model: 'Mustang',
                        year: '2024',
                        price: '45000',
                        vin: 'F123'
                    })
                })
            );
        });

        // 5) Assert modal closes
        await waitFor(() => {
            expect(screen.queryByText(/add new vehicle/i)).not.toBeInTheDocument();
        });

        // 6) Assert success toast appears
        await waitFor(() => {
            expect(screen.getByText(/vehicle created successfully/i)).toBeInTheDocument();
        });
    });

    it('shows an error toast and keeps modal open when creation fails', async () => {
        // Mock fetch for GET success and POST failure
        global.fetch = vi.fn((url, options) => {
            if (options && options.method === 'POST') {
                return Promise.resolve({
                    ok: false,
                    json: () => Promise.resolve({ detail: 'Invalid vehicle data' })
                });
            }
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve([]),
            });
        });

        render(
            <ToastProvider>
                <InventoryDashboard />
            </ToastProvider>
        );

        // Wait for initial render
        await waitFor(() => {
            expect(screen.getByText(/No vehicles found/i)).toBeInTheDocument();
        });

        // Open modal
        fireEvent.click(screen.getByRole('button', { name: /add vehicle/i }));
        
        // Fill form
        fireEvent.change(screen.getByLabelText(/make/i), { target: { value: 'Ford' } });
        fireEvent.change(screen.getByLabelText(/model/i), { target: { value: 'Mustang' } });
        fireEvent.change(screen.getByLabelText(/year/i), { target: { value: '2024' } });
        fireEvent.change(screen.getByLabelText(/price/i), { target: { value: '45000' } });
        fireEvent.change(screen.getByLabelText(/vin/i), { target: { value: 'F123' } });

        // Submit
        fireEvent.click(screen.getByRole('button', { name: /save/i }));

        // Assert error toast
        await waitFor(() => {
            expect(screen.getByText(/failed to create vehicle/i)).toBeInTheDocument();
        });

        // Assert modal remains open
        expect(screen.getByText(/add new vehicle/i)).toBeInTheDocument();
    });
});
