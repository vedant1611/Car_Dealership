import { Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import InventoryDashboard from './components/InventoryDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
              <Login />
            </div>
          } />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <div className="p-4">
                  <InventoryDashboard />
                </div>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
    </div>
  )
}

export default App;
