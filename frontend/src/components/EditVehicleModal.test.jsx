import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EditVehicleModal from './EditVehicleModal';
import { ToastProvider } from '../context/ToastContext';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('EditVehicleModal Component', () => {
    const mockVehicle = {
        id: 1,
        make: 'Toyota',
        model: 'Corolla',
        year: 2021,
        price: 20000,
        vin: '12345ABC'
    };

    beforeEach(() => {
        vi.restoreAllMocks();
        vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
            if (key === 'token') return 'fake-jwt-token';
            return null;
        });
    });

    it('renders with pre-populated form fields', () => {
        render(
            <ToastProvider>
                <EditVehicleModal 
                    isOpen={true} 
                    vehicle={mockVehicle} 
                    onClose={vi.fn()} 
                    onSuccess={vi.fn()} 
                />
            </ToastProvider>
        );

        expect(screen.getByLabelText(/make/i)).toHaveValue('Toyota');
        expect(screen.getByLabelText(/model/i)).toHaveValue('Corolla');
        expect(screen.getByLabelText(/year/i)).toHaveValue(2021);
        expect(screen.getByLabelText(/price/i)).toHaveValue(20000);
        expect(screen.getByLabelText(/vin/i)).toHaveValue('12345ABC');
    });

    it('submits updated data, shows success toast, calls onClose and onSuccess', async () => {
        const mockOnClose = vi.fn();
        const mockOnSuccess = vi.fn();

        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ ...mockVehicle, price: 21000 })
            })
        );

        render(
            <ToastProvider>
                <EditVehicleModal 
                    isOpen={true} 
                    vehicle={mockVehicle} 
                    onClose={mockOnClose} 
                    onSuccess={mockOnSuccess} 
                />
            </ToastProvider>
        );

        // Edit price
        fireEvent.change(screen.getByLabelText(/price/i), { target: { value: '21000' } });

        // Submit
        fireEvent.click(screen.getByRole('button', { name: /save/i }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                '/api/vehicles/1',
                expect.objectContaining({
                    method: 'PUT',
                    headers: expect.objectContaining({
                        'Authorization': 'Bearer fake-jwt-token',
                        'Content-Type': 'application/json'
                    }),
                    body: JSON.stringify({
                        make: 'Toyota',
                        model: 'Corolla',
                        category: '2021',
                        price: 21000,
                        quantity: 1
                    })
                })
            );
        });

        await waitFor(() => {
            expect(screen.getByText(/successfully/i)).toBeInTheDocument();
        });

        expect(mockOnClose).toHaveBeenCalledTimes(1);
        expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    });

    it('shows error toast on API failure and remains open', async () => {
        const mockOnClose = vi.fn();
        const mockOnSuccess = vi.fn();

        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: false,
                json: () => Promise.resolve({ detail: 'Error' })
            })
        );

        render(
            <ToastProvider>
                <EditVehicleModal 
                    isOpen={true} 
                    vehicle={mockVehicle} 
                    onClose={mockOnClose} 
                    onSuccess={mockOnSuccess} 
                />
            </ToastProvider>
        );

        fireEvent.click(screen.getByRole('button', { name: /save/i }));

        await waitFor(() => {
            expect(screen.getByText(/failed/i)).toBeInTheDocument();
        });

        expect(mockOnClose).not.toHaveBeenCalled();
        expect(mockOnSuccess).not.toHaveBeenCalled();
    });
});
