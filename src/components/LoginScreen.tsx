import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, ArrowRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';

export const LoginScreen: React.FC = () => {
  const { signIn } = useAuth();
  const [showIntro, setShowIntro] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [isLoading, setIsLoading] = useState(false);
  const [hasCheckedStorage, setHasCheckedStorage] = useState(false);

  useEffect(() => {
    setShowIntro(true);
    // Wait for intro to finish playing
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 3500);
    setHasCheckedStorage(true);
    return () => clearTimeout(timer);
  }, []);

  const toggleMode = () => {
    const newMode = mode === 'signin' ? 'signup' : 'signin';
    setMode(newMode);
    if (newMode === 'signup') {
      setShowIntro(true);
      setTimeout(() => setShowIntro(false), 3500);
    }
  };

  const handleAuth = async () => {
    setIsLoading(true);
    try {
      await signIn();
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  if (!hasCheckedStorage) return null;

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#faf9fb] text-[#1d1b20] overflow-hidden selection:bg-[#6750a4] selection:text-white">
      
      {/* Cinematic Splash / Preloader */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(8px)" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#09090b]"
          >
            {/* Geometric glow */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute w-[400px] h-[400px] bg-[#6750a4]/30 blur-[100px] rounded-full"
            />
            
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative flex flex-col items-center justify-center"
            >
              <div className="relative mb-8 w-24 h-24 flex items-center justify-center">
                {/* SVG Path drawing animation */}
                <motion.svg
                  className="w-full h-full text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <motion.path
                    d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                  />
                  <motion.path
                    d="m9 12 2 2 4-4"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeInOut", delay: 1.2 }}
                  />
                </motion.svg>
              </div>

              <motion.h1 
                initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: 1.2, duration: 0.8, ease: "easeOut" }}
                className="text-3xl font-bold text-white tracking-tight"
              >
                TrustLine
              </motion.h1>
              <motion.div 
                initial={{ opacity: 0, width: "0%" }}
                animate={{ opacity: 1, width: "100%" }}
                transition={{ delay: 1.6, duration: 1, ease: "easeInOut" }}
                className="h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent w-full mt-4"
              />
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8, duration: 0.8 }}
                className="text-[#a1a1aa] text-[10px] tracking-[0.2em] uppercase font-bold mt-4"
              >
                {mode === 'signup' ? 'Provisioning Local Vault...' : 'Initializing Engine'}
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Auth View */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: showIntro ? 0 : 1, y: showIntro ? 20 : 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: showIntro ? 0 : 0.2 }}
        className="w-full max-w-sm relative z-10 px-4"
      >
        <Card className="shadow-lg border-gray-100/80 rounded-[2rem] overflow-hidden">
          <CardHeader className="pb-4">
            <motion.div layout="position" className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 border border-gray-100 shadow-sm">
              <Shield className="w-6 h-6 text-[#1d1b20]" />
            </motion.div>
            <motion.div layout="position">
              <CardTitle className="text-2xl font-bold tracking-tight text-[#1d1b20]">
                {mode === 'signin' ? 'Welcome back' : 'Create account'}
              </CardTitle>
            </motion.div>
            <motion.div layout="position">
              <CardDescription className="text-sm leading-relaxed text-gray-500 mt-2">
                {mode === 'signin' 
                  ? 'Sign in to access your local threat detection engine and history.'
                  : 'Join TrustLine for on-device, privacy-first deepfake protection.'}
              </CardDescription>
            </motion.div>
          </CardHeader>
          
          <CardContent>
            {/* Conditional Features List for Sign Up */}
            <AnimatePresence mode="popLayout">
              {mode === 'signup' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-col gap-3.5 mb-6 text-left">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-5 h-5 rounded-full bg-[#f3edf7] flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-[#6750a4]" strokeWidth={3} />
                      </div>
                      <span>On-device threat detection</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-5 h-5 rounded-full bg-[#f3edf7] flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-[#6750a4]" strokeWidth={3} />
                      </div>
                      <span>Zero audio data retention</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-5 h-5 rounded-full bg-[#f3edf7] flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-[#6750a4]" strokeWidth={3} />
                      </div>
                      <span>End-to-end privacy guarantees</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div layout="position">
              <Button
                onClick={handleAuth}
                disabled={isLoading}
                className="w-full relative group overflow-hidden bg-[#1d1b20] text-white py-6 rounded-xl font-bold transition-all flex items-center justify-center gap-3 hover:bg-[#2d2a32]"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    {mode === 'signin' ? 'Sign in with Google' : 'Sign up with Google'}
                    <ArrowRight className="w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 ease-out" />
                  </>
                )}
              </Button>
            </motion.div>
          </CardContent>
        </Card>

        <motion.div 
          layout="position"
          className="mt-6 text-center"
        >
          <p className="text-sm font-medium text-gray-500">
            {mode === 'signin' ? "Don't have an account?" : "Already have an account?"}
            <button 
              onClick={toggleMode}
              className="ml-2 text-[#6750a4] font-semibold hover:text-[#563f91] transition-colors"
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};
