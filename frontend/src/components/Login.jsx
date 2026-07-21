import { useState } from 'react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        throw new Error('Login failed. Please check your credentials.');
      }
      
      const data = await response.json();
      localStorage.setItem('token', data.access_token);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white border border-gray-200 rounded-2xl shadow-sm">
      <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">Sign in to your account</h2>
      {error && (
        <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-colors" 
            placeholder="name@company.com" 
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input 
            type="password" 
            id="password" 
            name="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-colors" 
            placeholder="••••••••" 
          />
        </div>
        <button 
          type="submit" 
          className="w-full px-4 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all active:scale-[0.98]"
        >
          Login
        </button>
      </form>
    </div>
  )
}
