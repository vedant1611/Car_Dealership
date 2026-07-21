import { render, screen, fireEvent } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Dummy component to test the AuthContext
const DummyAuthConsumer = () => {
    const { token, login, logout } = useAuth();
    
    return (
        <div>
            <div data-testid="token-state">{token ? 'authenticated' : 'unauthenticated'}</div>
            <button data-testid="login-btn" onClick={() => login('mock-jwt-token')}>Login</button>
            <button data-testid="logout-btn" onClick={logout}>Logout</button>
        </div>
    );
};

describe('AuthContext', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        localStorage.clear();
        vi.spyOn(Storage.prototype, 'setItem');
        vi.spyOn(Storage.prototype, 'removeItem');
    });

    it('identifies unauthenticated state when no token is in localStorage', () => {
        vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
        
        render(
            <AuthProvider>
                <DummyAuthConsumer />
            </AuthProvider>
        );

        expect(screen.getByTestId('token-state')).toHaveTextContent('unauthenticated');
    });

    it('updates context state and sets token in localStorage on login', () => {
        vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
        
        render(
            <AuthProvider>
                <DummyAuthConsumer />
            </AuthProvider>
        );

        const loginBtn = screen.getByTestId('login-btn');
        fireEvent.click(loginBtn);

        expect(screen.getByTestId('token-state')).toHaveTextContent('authenticated');
        expect(Storage.prototype.setItem).toHaveBeenCalledWith('token', 'mock-jwt-token');
    });

    it('clears context state and removes token from localStorage on logout', () => {
        // Start authenticated
        vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('existing-token');
        
        render(
            <AuthProvider>
                <DummyAuthConsumer />
            </AuthProvider>
        );

        expect(screen.getByTestId('token-state')).toHaveTextContent('authenticated');

        const logoutBtn = screen.getByTestId('logout-btn');
        fireEvent.click(logoutBtn);

        expect(screen.getByTestId('token-state')).toHaveTextContent('unauthenticated');
        expect(Storage.prototype.removeItem).toHaveBeenCalledWith('token');
    });
});
