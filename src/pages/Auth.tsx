import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  RiGoogleFill, 
  RiGithubFill, 
  RiMailLine,
  RiEyeLine,
  RiEyeOffLine,
  RiUserLine,
  RiLockLine,
  RiArrowRightLine,
  RiShieldCheckLine,
  RiFlightTakeoffLine
} from 'react-icons/ri';
import { useToast } from '@/components/ui/use-toast';

const Auth = () => {
  const { loginWithRedirect, user, isAuthenticated, isLoading: auth0Loading } = useAuth0();
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isAuthenticated && user) {
      handleAuth0Login();
    }
  }, [isAuthenticated, user]);

  const handleAuth0Login = async () => {
    try {
      const result = await login(user);
      if (result.success) {
        toast({
          title: "Welcome to HoverFly Command Center!",
          description: "Access granted to elite aerial intelligence dashboard",
        });
        navigate('/');
      }
    } catch (error) {
      console.error('Login process error:', error);
      toast({
        title: "Authentication Failed",
        description: "Please try again or contact support",
        variant: "destructive",
      });
    }
  };

  const handleSocialLogin = (provider: string) => {
    loginWithRedirect({
      authorizationParams: {
        connection: provider === 'google' ? 'google-oauth2' : 'github',
        screen_hint: isLogin ? 'login' : 'signup'
      }
    });
  };

  const handleEmailAuth = () => {
    loginWithRedirect({
      authorizationParams: {
        screen_hint: isLogin ? 'login' : 'signup'
      }
    });
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (!isLogin) {
      if (!formData.name) {
        errors.name = 'Name is required';
      }
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // For demo purposes, redirect to Auth0 hosted pages
      handleEmailAuth();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  if (auth0Loading || (isAuthenticated && isLoading)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-success/5 to-secondary/10 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚁</div>
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Accessing HoverFly Command Center...</p>
        </div>
      </div>
    );
  }

  const features = [
    'Precision Drone Operations',
    'AI-Powered Crop Analysis', 
    'Real-time Threat Detection',
    'Elite Agricultural Intelligence'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-success/5 to-secondary/10">
      <div className="flex min-h-screen">
        {/* Left Panel - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-success to-secondary p-12 flex-col justify-center relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full"></div>
            <div className="absolute bottom-32 right-16 w-24 h-24 bg-white rounded-full"></div>
            <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-white rounded-full"></div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10"
          >
            {/* Logo */}
            <div className="flex items-center space-x-4 mb-12">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center">
                <RiFlightTakeoffLine className="w-10 h-10 text-success" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">HoverFly</h1>
                <p className="text-green-100">Elite Aerial Intelligence</p>
              </div>
            </div>

            {/* Headline */}
            <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
              Deploy Your Elite
              <span className="block text-green-200">Agricultural Intelligence</span>
            </h2>

            <p className="text-xl text-green-100 mb-12 leading-relaxed">
              Join the revolution in precision agriculture. Deploy advanced drones 
              and harness AI-powered intelligence for unmatched crop monitoring.
            </p>

            {/* Features List */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center space-x-3 text-white"
                >
                  <RiShieldCheckLine className="w-6 h-6 text-green-200" />
                  <span className="text-lg">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Panel - Auth Forms */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center space-x-3 mb-8 justify-center">
              <div className="w-12 h-12 bg-gradient-to-br from-success to-secondary rounded-xl flex items-center justify-center">
                <RiFlightTakeoffLine className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-success to-secondary bg-clip-text text-transparent">
                  HoverFly
                </h1>
              </div>
            </div>

            {/* Auth Toggle */}
            <div className="flex mb-8">
              <div className="flex bg-muted rounded-xl p-1 w-full">
                <button
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                    isLogin 
                      ? 'bg-background text-success shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                    !isLogin 
                      ? 'bg-background text-success shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Sign Up
                </button>
              </div>
            </div>

            {/* Auth Card */}
            <div className="card-glass rounded-3xl shadow-2xl p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={isLogin ? 'login' : 'signup'}
                  initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-foreground mb-2">
                      {isLogin ? 'Command Center Access' : 'Join HoverFly'}
                    </h2>
                    <p className="text-muted-foreground">
                      {isLogin 
                        ? 'Enter your agricultural intelligence dashboard'
                        : 'Create your elite pilot account'
                      }
                    </p>
                  </div>

                  {/* Social Login Buttons */}
                  <div className="space-y-4 mb-6">
                    {/* Google Login */}
                    <button
                      onClick={() => handleSocialLogin('google')}
                      className="w-full flex items-center justify-center space-x-3 bg-background border-2 border-border rounded-xl py-3 px-4 hover:border-primary/30 transition-all duration-300 hover:shadow-md group"
                    >
                      <RiGoogleFill className="w-5 h-5 text-red-500" />
                      <span className="font-medium text-foreground group-hover:text-primary">
                        Continue with Google
                      </span>
                    </button>

                    {/* GitHub Login */}
                    <button
                      onClick={() => handleSocialLogin('github')}
                      className="w-full flex items-center justify-center space-x-3 bg-foreground text-background rounded-xl py-3 px-4 hover:bg-foreground/90 transition-all duration-300 hover:shadow-md"
                    >
                      <RiGithubFill className="w-5 h-5" />
                      <span className="font-medium">Continue with GitHub</span>
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-background text-muted-foreground">or</span>
                    </div>
                  </div>

                  {/* Email Form */}
                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    {!isLogin && (
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Full Name
                        </label>
                        <div className="relative">
                          <RiUserLine className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300 bg-background text-foreground ${
                              formErrors.name ? 'border-critical' : 'border-border'
                            }`}
                            placeholder="Enter your full name"
                          />
                        </div>
                        {formErrors.name && (
                          <p className="text-critical text-xs mt-1">{formErrors.name}</p>
                        )}
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <RiMailLine className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300 bg-background text-foreground ${
                            formErrors.email ? 'border-critical' : 'border-border'
                          }`}
                          placeholder="Enter your email"
                        />
                      </div>
                      {formErrors.email && (
                        <p className="text-critical text-xs mt-1">{formErrors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <RiLockLine className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300 bg-background text-foreground ${
                            formErrors.password ? 'border-critical' : 'border-border'
                          }`}
                          placeholder="Enter your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <RiEyeOffLine className="w-5 h-5" /> : <RiEyeLine className="w-5 h-5" />}
                        </button>
                      </div>
                      {formErrors.password && (
                        <p className="text-critical text-xs mt-1">{formErrors.password}</p>
                      )}
                    </div>

                    {!isLogin && (
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <RiLockLine className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300 bg-background text-foreground ${
                              formErrors.confirmPassword ? 'border-critical' : 'border-border'
                            }`}
                            placeholder="Confirm your password"
                          />
                        </div>
                        {formErrors.confirmPassword && (
                          <p className="text-critical text-xs mt-1">{formErrors.confirmPassword}</p>
                        )}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full btn-command flex items-center justify-center space-x-2"
                    >
                      <span>{isLogin ? 'Access Command Center' : 'Create Account'}</span>
                      <RiArrowRightLine className="w-5 h-5" />
                    </button>
                  </form>

                  {isLogin && (
                    <div className="text-center mt-4">
                      <button className="text-primary hover:text-primary/80 text-sm hover:underline">
                        Forgot your password?
                      </button>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Terms */}
              <p className="text-xs text-muted-foreground text-center mt-8 leading-relaxed">
                By {isLogin ? 'signing in' : 'creating an account'}, you agree to our{' '}
                <a href="#" className="text-primary hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-primary hover:underline">Privacy Policy</a>
              </p>
            </div>

            {/* Demo Notice */}
            <div className="mt-8 text-center">
              <div className="bg-success/5 border border-success/20 rounded-xl p-4">
                <p className="text-sm text-success">
                  <strong>Demo Version:</strong> This is a fully functional authentication prototype. 
                  Click any login method to access the dashboard.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Auth;