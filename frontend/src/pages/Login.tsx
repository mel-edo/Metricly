import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EyeIcon, EyeOffIcon, ServerIcon, ShieldCheckIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [animateBackground, setAnimateBackground] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  // Theme support will be added later
  // const { theme, setTheme } = useTheme();

  const { login } = useAuth();

  // Glowing orb positions - now with 5 orbs
  const [orb1Position, setOrb1Position] = useState({ x: '25%', y: '0' });
  const [orb2Position, setOrb2Position] = useState({ x: '75%', y: '100%' });
  const [orb3Position, setOrb3Position] = useState({ x: '33%', y: '33%' });
  const [orb4Position, setOrb4Position] = useState({ x: '60%', y: '20%' });
  const [orb5Position, setOrb5Position] = useState({ x: '15%', y: '80%' });

  // Background animation trigger
  useEffect(() => {
    setAnimateBackground(true);

    // Start the random movement of the glowing orbs
    const moveOrbs = () => {
      // Random position within reasonable bounds
      const getRandomPosition = () => {
        return {
          x: `${10 + Math.random() * 80}%`,
          y: `${10 + Math.random() * 80}%`
        };
      };

      // Move each orb to a new random position
      setOrb1Position(getRandomPosition());
      setOrb2Position(getRandomPosition());
      setOrb3Position(getRandomPosition());
      setOrb4Position(getRandomPosition());
      setOrb5Position(getRandomPosition());
    };

    // Initial movement
    moveOrbs();

    // Set interval for continuous slow movement
    const interval = setInterval(moveOrbs, 15000); // Move every 15 seconds

    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      toast({
        title: "Validation Error",
        description: "Please enter both username and password",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      await login(username, password);
      toast({
        title: "Login Successful",
        description: "Welcome to Metricly",
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-metricly-background bg-[url('/bg-pattern.svg')] relative overflow-hidden ${
      animateBackground ? 'animate-fade-in' : 'opacity-0'
    }`}>
      {/* Enhanced abstract background elements with animation and transition movement */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Animated floating orbs */}
        <div
          className="absolute w-96 h-96 rounded-full bg-mauve/10 filter blur-3xl animate-pulse-subtle"
          style={{
            left: orb1Position.x,
            top: orb1Position.y,
            transition: 'all 15s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        ></div>
        <div
          className="absolute w-80 h-80 rounded-full bg-blue/10 filter blur-3xl animate-pulse-subtle"
          style={{
            left: orb2Position.x,
            top: orb2Position.y,
            animationDelay: '1s',
            transition: 'all 15s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        ></div>
        <div
          className="absolute w-64 h-64 rounded-full bg-metricly-accent/10 filter blur-3xl animate-pulse-subtle"
          style={{
            left: orb3Position.x,
            top: orb3Position.y,
            animationDelay: '0.5s',
            transition: 'all 15s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        ></div>
        <div
          className="absolute w-56 h-56 rounded-full bg-green/10 filter blur-3xl animate-pulse-subtle"
          style={{
            left: orb4Position.x,
            top: orb4Position.y,
            animationDelay: '0.7s',
            transition: 'all 15s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        ></div>
        <div
          className="absolute w-72 h-72 rounded-full bg-pink/10 filter blur-3xl animate-pulse-subtle"
          style={{
            left: orb5Position.x,
            top: orb5Position.y,
            animationDelay: '1.2s',
            transition: 'all 15s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        ></div>
      </div>

      <div className="w-full max-w-md p-4 animate-scale-in z-10">
        <div className="flex justify-center mb-6">
          <div className="text-transparent bg-gradient-to-r from-blue via-lavender to-mauve bg-clip-text text-4xl font-bold">Metricly</div>
        </div>

        <Card className="glass-card border-metricly-accent/20 backdrop-blur-lg bg-metricly-secondary/80">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              Sign in to monitor your servers and containers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-metricly-secondary/50 border-metricly-secondary/80 pl-10 text-text placeholder:text-subtext0 focus-visible:ring-lavender/50"
                  />
                  <ServerIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                </div>
              </div>
              <div className="space-y-2 relative">
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-metricly-secondary/50 border-metricly-secondary/80 pl-10 pr-10 text-text placeholder:text-subtext0 focus-visible:ring-lavender/50"
                  />
                  <ShieldCheckIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue via-lavender to-mauve text-metricly-background hover:opacity-90 transition-all"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Secure container and system monitoring
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
