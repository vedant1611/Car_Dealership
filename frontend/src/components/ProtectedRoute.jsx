import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
    // We check for 'token' here as that is the key we used in Login.jsx and InventoryDashboard.jsx
    const token = localStorage.getItem('token');
    
    if (!token) {
        return <Navigate to="/" replace />;
    }
    
    return children;
}
