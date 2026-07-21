import { Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import InventoryDashboard from './components/InventoryDashboard';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<InventoryDashboard />} />
      </Routes>
    </div>
  )
}

export default App;
