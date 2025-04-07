
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

const Login = () => {
  const { user, loading, signIn, createInitialAdmin } = useAuth();
  const [initialAdminLoading, setInitialAdminLoading] = useState(false);
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn(loginData.email, loginData.password);
  };

  const handleCreateInitialAdmin = async () => {
    try {
      setInitialAdminLoading(true);
      await createInitialAdmin();
    } finally {
      setInitialAdminLoading(false);
    }
  };

  // If user is already logged in, redirect to admin page
  if (user) {
    return <Navigate to="/admin" />;
  }

  return (
    <Layout>
      <div className="container my-12">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-uba-gray">UBA QueueEase Admin</h1>
              <p className="text-gray-600">Login to manage the queue system</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input 
                  id="login-email"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input 
                  id="login-password"
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-uba-red hover:bg-uba-red/90"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
            
            <div className="mt-6 text-center text-sm">
              <div className="flex items-center justify-center gap-2 text-amber-700 bg-amber-50 p-3 rounded-md mb-4">
                <AlertCircle size={16} />
                <p>First time? Create the initial admin account below.</p>
              </div>
              
              <Button 
                variant="outline"
                className="w-full mt-2"
                onClick={handleCreateInitialAdmin}
                disabled={initialAdminLoading}
              >
                {initialAdminLoading ? 'Creating...' : 'Create Initial Admin User'}
              </Button>
              
              <p className="mt-4 text-gray-600">
                Only authorized admins can access this system.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
