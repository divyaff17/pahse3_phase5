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
// Direct imports for QR hygiene pages to avoid lazy loading issues
import QRHygienePage from "./pages/QRHygienePage";
import QRScannerPage from "./pages/QRScannerPage";
import ProductIntakePage from "./pages/ProductIntakePage";
import AdminHygieneDashboard from "./pages/AdminHygieneDashboard";
import QRHygieneTestPage from "./pages/QRHygieneTestPage";
import ProductQRGalleryPage from "./pages/ProductQRGalleryPage";
import MobileProductDetailPage from "./pages/MobileProductDetailPage";
import OfflinePage from "./pages/OfflinePage";
import NotFound from "./pages/NotFound";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { FlyToCartProvider } from "./context/FlyToCartContext";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { StyleAssistant } from "./components/StyleAssistant";
import { OfflineIndicator } from "./components/OfflineIndicator";
import { InstallPrompt } from "./components/InstallPrompt";
import { SyncNotifications } from "./components/SyncNotifications";
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
              <SyncNotifications />

              <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                  <Route path="/" element={
                    <PageTransition>
                      <Index />
                    </PageTransition>
                  } />
                  {/* QR Hygiene Routes - Place before dynamic routes to ensure they match correctly */}
                  <Route path="/qr-hygiene" element={
                    <PageTransition>
                      <QRHygienePage />
                    </PageTransition>
                  } />
                  <Route path="/qr-scanner" element={
                    <PageTransition>
                      <QRScannerPage />
                    </PageTransition>
                  } />
                  <Route path="/product-intake" element={
                    <PageTransition>
                      <ProductIntakePage />
                    </PageTransition>
                  } />
                  <Route path="/admin/hygiene" element={
                    <PageTransition>
                      <AdminHygieneDashboard />
                    </PageTransition>
                  } />
                  <Route path="/products/qr-gallery" element={
                    <PageTransition>
                      <ProductQRGalleryPage />
                    </PageTransition>
                  } />
                  <Route path="/test-qr" element={
                    <QRHygieneTestPage />
                  } />
                  <Route path="/product/:productId" element={
                    <PageTransition>
                      <MobileProductDetailPage />
                    </PageTransition>
                  } />
                  {/* Other static routes */}
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
                  {/* Dynamic routes - should come after specific routes */}
                  <Route path="/collections" element={
                    <PageTransition>
                      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                        <CollectionsPage />
                      </Suspense>
                    </PageTransition>
                  } />
                  <Route path="/mood/:moodId" element={
                    <PageTransition>
                      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                        <MoodPage />
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
                  {/* Offline page for PWA */}
                  <Route path="/offline" element={
                    <PageTransition>
                      <OfflinePage />
                    </PageTransition>
                  } />
                  {/* 404 - must be last */}
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
