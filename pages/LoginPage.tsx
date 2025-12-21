import React, { useState } from 'react';
import { Beaker } from 'lucide-react';
import { Button, Input, Card } from '../components/Components';
import { apiService } from '../services/apiService';

interface LoginPageProps {
  onLogin: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!username || !password) {
        setError('Please enter username and password');
        return;
      }

      const response = await apiService.login(username, password);
      // Store token and username in localStorage
      localStorage.setItem('auth_token', response.token || '');
      localStorage.setItem('username', username);
      onLogin();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!username || !password) {
        setError('Please enter username and password');
        return;
      }

      if (username.length < 3) {
        setError('Username must be at least 3 characters');
        return;
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }

      await apiService.register(username, password);
      setError('');
      setIsSignUp(false);
      setUsername('');
      setPassword('');
      alert('Account created! You can now login.');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#daf0ee' }}>
      <div className="w-full max-w-md">
        <Card>
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#daf0ee' }}>
              <Beaker className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">MedLab</h1>
          </div>
          
          <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-4">
            <Input 
              type="text"
              label="Username" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              placeholder="Enter username" 
              disabled={loading} 
            />
            <Input 
              label="Password" 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="Enter password" 
              disabled={loading} 
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (isSignUp ? 'Creating Account...' : 'Signing In...') : (isSignUp ? 'Create Account' : 'Sign In')}
            </Button>
          </form>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setUsername('');
                setPassword('');
              }}
              className="w-full text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              {isSignUp ? '← Back to Login' : 'Create new account →'}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};


