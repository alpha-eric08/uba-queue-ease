
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/layout/Layout';

const Login = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });
  
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignupData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      if (loginData.email && loginData.password) {
        toast({
          title: 'Login Successful',
          description: 'You have been logged in successfully.',
        });
        
        // Redirect to dashboard or home
        window.location.href = '/';
      } else {
        toast({
          title: 'Login Failed',
          description: 'Please enter both email and password.',
          variant: 'destructive',
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Validate form
    if (!signupData.name || !signupData.email || !signupData.phone || !signupData.password) {
      toast({
        title: 'Registration Failed',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }
    
    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: 'Registration Failed',
        description: 'Passwords do not match.',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: 'Registration Successful',
        description: 'Your account has been created successfully.',
      });
      
      // Redirect to dashboard or home
      window.location.href = '/';
      setIsLoading(false);
    }, 1000);
  };

  return (
    <Layout>
      <div className="container my-12">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-uba-gray">Welcome to UBA QueueEase</h1>
              <p className="text-gray-600">Login or create an account to continue</p>
            </div>
            
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
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
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password">Password</Label>
                      <Link to="/forgot-password" className="text-xs text-uba-red hover:underline">
                        Forgot Password?
                      </Link>
                    </div>
                    <Input 
                      id="login-password"
                      type="password"
                      name="password"
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-uba-red hover:bg-uba-red/90"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Logging in...' : 'Login'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input 
                      id="signup-name"
                      name="name"
                      placeholder="Enter your full name"
                      value={signupData.name}
                      onChange={handleSignupChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input 
                      id="signup-email"
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={signupData.email}
                      onChange={handleSignupChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">Phone Number</Label>
                    <Input 
                      id="signup-phone"
                      name="phone"
                      placeholder="Enter your phone number"
                      value={signupData.phone}
                      onChange={handleSignupChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input 
                      id="signup-password"
                      type="password"
                      name="password"
                      placeholder="Create a password"
                      value={signupData.password}
                      onChange={handleSignupChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                    <Input 
                      id="signup-confirm-password"
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm your password"
                      value={signupData.confirmPassword}
                      onChange={handleSignupChange}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-uba-red hover:bg-uba-red/90"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            
            <div className="mt-6 text-center text-sm">
              <p className="text-gray-600">
                By continuing, you agree to UBA's{' '}
                <Link to="/terms" className="text-uba-red hover:underline">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-uba-red hover:underline">Privacy Policy</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
