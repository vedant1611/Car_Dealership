import { render, screen, fireEvent } from '@testing-library/react';
import { ToastProvider, useToast } from './ToastContext';
import { describe, it, expect } from 'vitest';

const DummyToastConsumer = () => {
    const { addToast } = useToast();
    
    return (
        <div>
            <div data-testid="dummy-child">Child Content</div>
            <button onClick={() => addToast('Operation successful!', 'success')}>
                Trigger Success
            </button>
            <button onClick={() => addToast('Operation failed!', 'error')}>
                Trigger Error
            </button>
        </div>
    );
};

describe('ToastContext', () => {
    it('renders its children correctly', () => {
        render(
            <ToastProvider>
                <div data-testid="child">Child Content</div>
            </ToastProvider>
        );

        expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('triggers and renders a success toast', () => {
        render(
            <ToastProvider>
                <DummyToastConsumer />
            </ToastProvider>
        );

        const successBtn = screen.getByRole('button', { name: /trigger success/i });
        fireEvent.click(successBtn);

        const toastMessage = screen.getByText('Operation successful!');
        expect(toastMessage).toBeInTheDocument();
    });

    it('triggers and renders an error toast', () => {
        render(
            <ToastProvider>
                <DummyToastConsumer />
            </ToastProvider>
        );

        const errorBtn = screen.getByRole('button', { name: /trigger error/i });
        fireEvent.click(errorBtn);

        const toastMessage = screen.getByText('Operation failed!');
        expect(toastMessage).toBeInTheDocument();
    });

    it('allows a toast message to be manually dismissed', () => {
        render(
            <ToastProvider>
                <DummyToastConsumer />
            </ToastProvider>
        );

        const successBtn = screen.getByRole('button', { name: /trigger success/i });
        fireEvent.click(successBtn);

        const toastMessage = screen.getByText('Operation successful!');
        expect(toastMessage).toBeInTheDocument();

        // Assuming the close button will have aria-label="Close" or text "Close"
        const closeBtn = screen.getByRole('button', { name: /close/i });
        fireEvent.click(closeBtn);

        expect(toastMessage).not.toBeInTheDocument();
    });
});
