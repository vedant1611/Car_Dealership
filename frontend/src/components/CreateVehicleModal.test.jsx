import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateVehicleModal from './CreateVehicleModal';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('CreateVehicleModal Component', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('displays input fields and submits valid data via onSubmit prop', async () => {
        const mockOnSubmit = vi.fn();
        const mockOnClose = vi.fn();

        render(
            <CreateVehicleModal 
                isOpen={true} 
                onSubmit={mockOnSubmit} 
                onClose={mockOnClose} 
            />
        );

        // Verify input fields exist
        const makeInput = screen.getByLabelText(/make/i);
        const modelInput = screen.getByLabelText(/model/i);
        const yearInput = screen.getByLabelText(/year/i);
        const priceInput = screen.getByLabelText(/price/i);
        const vinInput = screen.getByLabelText(/vin/i);

        expect(makeInput).toBeInTheDocument();
        expect(modelInput).toBeInTheDocument();
        expect(yearInput).toBeInTheDocument();
        expect(priceInput).toBeInTheDocument();
        expect(vinInput).toBeInTheDocument();

        // Fill out the form
        fireEvent.change(makeInput, { target: { value: 'Toyota' } });
        fireEvent.change(modelInput, { target: { value: 'Corolla' } });
        fireEvent.change(yearInput, { target: { value: '2024' } });
        fireEvent.change(priceInput, { target: { value: '25000' } });
        fireEvent.change(vinInput, { target: { value: '12345ABCDE' } });

        // Submit the form
        // Assuming the submit button will have text like 'Save' or 'Create' or type="submit"
        const form = makeInput.closest('form');
        fireEvent.submit(form);

        // Verify onSubmit was called with structured data
        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
                make: 'Toyota',
                model: 'Corolla',
                year: '2024',
                price: '25000',
                vin: '12345ABCDE'
            }));
        });
    });

    it('triggers onClose callback when the Cancel button is clicked', () => {
        const mockOnSubmit = vi.fn();
        const mockOnClose = vi.fn();

        render(
            <CreateVehicleModal 
                isOpen={true} 
                onSubmit={mockOnSubmit} 
                onClose={mockOnClose} 
            />
        );

        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        fireEvent.click(cancelButton);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
});
