import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import PageTransition from "./components/PageTransition";
import ScrollProgress from "./components/ScrollProgress";
import Index from "./pages/Index";
import { lazy, useEffect, useState, Suspense } from "react";
const CartPage = lazy(() => import("./pages/CartPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const HowItWorksPage = lazy(() => import("./pages/HowItWorksPage"));
const ChromaticClosetPage = lazy(() => import("./pages/ChromaticClosetPage"));
const MoodPage = lazy(() => import("./pages/MoodPage"));
const CollectionsPage = lazy(() => import("./pages/CollectionsPage"));
const GenderCategoryPage = lazy(() => import("./pages/GenderCategoryPage"));
import NotFound from "./pages/NotFound";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { FlyToCartProvider } from "./context/FlyToCartContext";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { StyleAssistant } from "./components/StyleAssistant";
import { OfflineIndicator } from "./components/OfflineIndicator";
import { InstallPrompt } from "./components/InstallPrompt";
import { useOfflineSync } from "./hooks/useOfflineSync";

const queryClient = new QueryClient();

function App() {
  const [showWelcome, setShowWelcome] = useState(false);
  const location = useLocation();

  // Enable offline sync functionality
  useOfflineSync();

  useEffect(() => {
    if (!showWelcome && typeof window !== "undefined") {
      sessionStorage.setItem("welcomeSeen", "true");
    }
  }, [showWelcome]);

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <WishlistProvider>
          <FlyToCartProvider>
            <TooltipProvider>
              <ScrollProgress />
              <Toaster />
              <Sonner />
              {showWelcome && (
                <WelcomeScreen onComplete={() => setShowWelcome(false)} />
              )}
              <StyleAssistant />
              <OfflineIndicator />
              <InstallPrompt />

              <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                  <Route path="/" element={
                    <PageTransition>
                      <Index />
                    </PageTransition>
                  } />
                  <Route path="/chromatic" element={
                    <PageTransition>
                      <ChromaticClosetPage />
                    </PageTransition>
                  } />
                  <Route path="/cart" element={
                    <PageTransition>
                      <CartPage />
                    </PageTransition>
                  } />
                  <Route path="/profile" element={
                    <PageTransition>
                      <ProfilePage />
                    </PageTransition>
                  } />
                  <Route path="/how-it-works" element={
                    <PageTransition>
                      <HowItWorksPage />
                    </PageTransition>
                  } />
                  <Route path="/mood/:moodId" element={
                    <PageTransition>
                      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                        <MoodPage />
                      </Suspense>
                    </PageTransition>
                  } />
                  <Route path="/collections" element={
                    <PageTransition>
                      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                        <CollectionsPage />
                      </Suspense>
                    </PageTransition>
                  } />
                  <Route path="/collections/:moodId" element={
                    <PageTransition>
                      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                        <CollectionsPage />
                      </Suspense>
                    </PageTransition>
                  } />
                  <Route path="/shop/:gender" element={
                    <PageTransition>
                      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                        <GenderCategoryPage />
                      </Suspense>
                    </PageTransition>
                  } />
                  <Route path="/shop/:gender/:event" element={
                    <PageTransition>
                      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                        <CollectionsPage />
                      </Suspense>
                    </PageTransition>
                  } />
                  <Route path="*" element={
                    <PageTransition>
                      <NotFound />
                    </PageTransition>
                  } />
                </Routes>
              </AnimatePresence>

            </TooltipProvider>
          </FlyToCartProvider>
        </WishlistProvider>
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;
