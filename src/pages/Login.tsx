import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Github, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{username?: string; password?: string}>({});
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Username: only letters, numbers, underscore, dot, dash. 3–30 chars.
  const usernameRegex = /^[A-Za-z0-9_.-]{3,30}$/;

  // Password: minimum 8 chars, at least one letter and one number.
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

  const validate = () => {
    let newErrors: {username?: string; password?: string} = {};

    if (!usernameRegex.test(username)) {
      newErrors.username =
        "Invalid username. Only letters, numbers, _, ., - allowed (3–30 chars).";
    }
    if (!passwordRegex.test(password)) {
      newErrors.password =
        "Password must be at least 8 chars, contain letters and numbers.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      toast({
        title: isSignUp ? "Account Created!" : "Login Successful!",
        description: `Welcome to HoverFly ${isSignUp ? '- your account has been created' : 'surveillance system'}`,
      });
      // Redirect to dashboard
      navigate("/");
    }
  };

  const handleGoogleSuccess = (credentialResponse: any) => {
    console.log("Google Credential:", credentialResponse);
    toast({
      title: "Google Login Successful!",
      description: "Welcome to HoverFly surveillance system",
    });
    navigate("/");
  };

  const handleGoogleError = () => {
    toast({
      title: "Google Login Failed",
      description: "Please try again or use manual login",
      variant: "destructive",
    });
  };

  const handleGithubLogin = () => {
    // Simulate GitHub OAuth flow
    toast({
      title: "GitHub Login Successful!",
      description: "Welcome to HoverFly surveillance system",
    });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-success/5 to-secondary/10 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="card-tactical border-primary/20">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center"
            >
              <span className="text-2xl font-bold text-white">H</span>
            </motion.div>
            <CardTitle className="text-2xl font-bold text-foreground">
              {isSignUp ? "Join HoverFly" : "Welcome to HoverFly"}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {isSignUp 
                ? "Create your account for advanced aerial intelligence" 
                : "Access your elite surveillance dashboard"
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Manual Username/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-foreground">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.trim())}
                  placeholder="Enter your username"
                  className="border-primary/20 focus:border-primary"
                  required
                />
                {errors.username && (
                  <p className="text-critical text-sm">{errors.username}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="border-primary/20 focus:border-primary"
                  required
                />
                {errors.password && (
                  <p className="text-critical text-sm">{errors.password}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full btn-command"
              >
                {isSignUp ? "Create Account" : "Access Dashboard"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            {/* OAuth Buttons */}
            <div className="space-y-3">
              {/* Google Login */}
              <div className="w-full">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  size="large"
                  width="100%"
                  theme="outline"
                />
              </div>

              {/* GitHub Login */}
              <Button
                variant="outline"
                className="w-full border-border/50 hover:border-primary/30"
                onClick={handleGithubLogin}
              >
                <Github className="mr-2 h-4 w-4" />
                Continue with GitHub
              </Button>
            </div>

            {/* Toggle Sign Up / Login */}
            <div className="text-center pt-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}
                <Button
                  variant="link"
                  className="pl-1 h-auto p-0 text-primary hover:text-primary/80"
                  onClick={() => setIsSignUp(!isSignUp)}
                >
                  {isSignUp ? "Sign in" : "Sign up"}
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}