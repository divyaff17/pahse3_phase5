// src/components/SmartSearchOverlay.tsx
import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Clock, TrendingUp, ArrowRight, Heart, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import SignupModal from "@/components/SignupModal";

interface SmartSearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    onSearch: (query: string) => void;
}

interface Product {
    id: string;
    title: string;
    image: string;
    occasion: string;
    price: string;
    rentalPrice: string;
    mood: string;
}

// All searchable products - consolidated from all moods
const ALL_PRODUCTS: Product[] = [
    // Casual Products
    { id: "c1", title: "Premium Sweatshirt", image: "/src/images/Mens Products/Mens Products/New - Sweatshirt HC/IMG_3934.JPG", occasion: "Everyday comfort", price: "₹3,999", rentalPrice: "₹599", mood: "casual" },
    { id: "c2", title: "Casual Sweatshirt", image: "/src/images/Mens Products/Mens Products/New - Sweatshirt HC/IMG_3935.JPG", occasion: "Weekend ready", price: "₹3,499", rentalPrice: "₹499", mood: "casual" },
    { id: "c3", title: "Cozy Grey Sweatshirt", image: "/src/images/Mens Products/Mens Products/New - Sweatshirt HC/IMG_3959 3.JPG", occasion: "Relaxed style", price: "₹3,299", rentalPrice: "₹479", mood: "casual" },
    { id: "c4", title: "Classic Solid Tee", image: "/src/images/Mens Products/Mens Products/New - T shirts HC/Solids/IMG_3936 2.JPG", occasion: "Essential basic", price: "₹1,999", rentalPrice: "₹299", mood: "casual" },
    { id: "c5", title: "Navy Blue Tee", image: "/src/images/Mens Products/Mens Products/New - T shirts HC/Solids/IMG_3937 2.JPG", occasion: "Office casual", price: "₹1,999", rentalPrice: "₹299", mood: "casual" },
    { id: "c6", title: "Olive Green Tee", image: "/src/images/Mens Products/Mens Products/New - T shirts HC/Solids/IMG_3938 2.JPG", occasion: "Nature vibes", price: "₹1,999", rentalPrice: "₹299", mood: "casual" },
    { id: "c7", title: "Floral Day Dress", image: "/src/images/Womens Products/Womens Products/Dresses/IMG_3839.jpg", occasion: "Brunch perfect", price: "₹4,999", rentalPrice: "₹749", mood: "casual" },
    { id: "c8", title: "Light Summer Dress", image: "/src/images/Womens Products/Womens Products/Dresses/IMG_3879.jpg", occasion: "Coffee date", price: "₹4,499", rentalPrice: "₹699", mood: "casual" },

    // Party Products
    { id: "p1", title: "Elegant Party Dress", image: "/src/images/Womens Products/Womens Products/Dresses/IMG_3702.jpg", occasion: "Dance floor ready", price: "₹6,999", rentalPrice: "₹999", mood: "party" },
    { id: "p2", title: "Chic Evening Dress", image: "/src/images/Womens Products/Womens Products/Dresses/IMG_3720.jpg", occasion: "VIP vibes", price: "₹7,499", rentalPrice: "₹1,099", mood: "party" },
    { id: "p3", title: "Glamorous Night Dress", image: "/src/images/Womens Products/Womens Products/Dresses/IMG_3703.jpg", occasion: "Night out glam", price: "₹7,999", rentalPrice: "₹1,199", mood: "party" },
    { id: "p4", title: "Bold Statement Dress", image: "/src/images/Womens Products/Womens Products/Dresses/IMG_3706.jpg", occasion: "Party queen", price: "₹8,499", rentalPrice: "₹1,249", mood: "party" },
    { id: "p5", title: "Stunning Party Look", image: "/src/images/Womens Products/Womens Products/Dresses/IMG_3715.jpg", occasion: "Club ready", price: "₹7,299", rentalPrice: "₹1,049", mood: "party" },
    { id: "p6", title: "Midnight Glam Dress", image: "/src/images/Womens Products/Womens Products/Dresses/IMG_3716.jpg", occasion: "After party", price: "₹8,999", rentalPrice: "₹1,299", mood: "party" },
    { id: "p7", title: "Printed Party Tee", image: "/src/images/Mens Products/Mens Products/New - T shirts HC/Printed/IMG_3955.jpg", occasion: "Casual party", price: "₹2,499", rentalPrice: "₹399", mood: "party" },

    // Cocktail Products
    { id: "ct1", title: "Designer Cocktail Dress", image: "/src/images/Womens Products/Womens Products/Dresses/IMG_3714.jpg", occasion: "Cocktail hour", price: "₹10,999", rentalPrice: "₹1,599", mood: "cocktail" },
    { id: "ct2", title: "Midnight Glamour", image: "/src/images/Womens Products/Womens Products/Dresses/IMG_3725.jpg", occasion: "After party", price: "₹9,499", rentalPrice: "₹1,399", mood: "cocktail" },
    { id: "ct3", title: "Elegant Midi", image: "/src/images/Womens Products/Womens Products/Dresses/IMG_3726.jpg", occasion: "Sophisticated charm", price: "₹11,499", rentalPrice: "₹1,699", mood: "cocktail" },
    { id: "ct4", title: "Classic Cocktail", image: "/src/images/Womens Products/Womens Products/Dresses/IMG_3728.jpg", occasion: "Timeless beauty", price: "₹9,999", rentalPrice: "₹1,499", mood: "cocktail" },
    { id: "ct5", title: "Luxe Evening Dress", image: "/src/images/Womens Products/Womens Products/Dresses/IMG_3729.jpg", occasion: "Black tie ready", price: "₹12,999", rentalPrice: "₹1,899", mood: "cocktail" },
    { id: "ct6", title: "Satin Elegance", image: "/src/images/Womens Products/Womens Products/Dresses/IMG_3752.jpg", occasion: "Gala night", price: "₹13,499", rentalPrice: "₹1,999", mood: "cocktail" },

    // Formal Products
    { id: "f1", title: "Classic Men's Blazer", image: "/src/images/Mens Products/Mens Products/Thrift- Blazzer/IMG_7929 2.jpg", occasion: "Office elegance", price: "₹12,999", rentalPrice: "₹1,899", mood: "formal" },
    { id: "f2", title: "Power Blazer", image: "/src/images/Mens Products/Mens Products/Thrift- Blazzer/3XL.  IMG_7926 2.jpg", occasion: "Boardroom boss", price: "₹14,999", rentalPrice: "₹2,199", mood: "formal" },
    { id: "f3", title: "Executive Blazer", image: "/src/images/Mens Products/Mens Products/Thrift- Blazzer/40.   IMG_7922 2.jpg", occasion: "Meeting ready", price: "₹13,499", rentalPrice: "₹1,999", mood: "formal" },
    { id: "f4", title: "Formal Jacket", image: "/src/images/Mens Products/Mens Products/Thrift- Blazzer/4XL.  IMG_7924 2.jpg", occasion: "Professional chic", price: "₹11,999", rentalPrice: "₹1,799", mood: "formal" },
    { id: "f5", title: "Formal Day Dress", image: "/src/images/Womens Products/Womens Products/Dresses/M.  IMG_3708.jpg", occasion: "Corporate style", price: "₹8,999", rentalPrice: "₹1,299", mood: "formal" },
    { id: "f6", title: "Office Elegance", image: "/src/images/Womens Products/Womens Products/Dresses/M.  IMG_3709.jpg", occasion: "Business meeting", price: "₹9,499", rentalPrice: "₹1,399", mood: "formal" },

    // Streetwear Products
    { id: "s1", title: "Thrift Denim Jacket", image: "/src/images/Thrift - Jackets/Thrift - Jackets/IMG_7905 2.jpg", occasion: "Eco-chic style", price: "₹4,999", rentalPrice: "₹699", mood: "street" },
    { id: "s2", title: "Vintage Jacket", image: "/src/images/Thrift - Jackets/Thrift - Jackets/IMG_7920 2.jpg", occasion: "Retro vibes", price: "₹5,499", rentalPrice: "₹799", mood: "street" },
    { id: "s3", title: "Classic Thrift Find", image: "/src/images/Thrift - Jackets/Thrift - Jackets/L.   IMG_7911 2.jpg", occasion: "One of a kind", price: "₹4,499", rentalPrice: "₹649", mood: "street" },
    { id: "s4", title: "Urban Jacket", image: "/src/images/Thrift - Jackets/Thrift - Jackets/L.   IMG_7913 2.jpg", occasion: "Street style", price: "₹5,299", rentalPrice: "₹779", mood: "street" },
    { id: "s5", title: "Edgy Denim", image: "/src/images/Thrift - Jackets/Thrift - Jackets/L.   IMG_7917 2.jpg", occasion: "Urban explorer", price: "₹4,799", rentalPrice: "₹699", mood: "street" },
    { id: "s6", title: "Casual Street Jacket", image: "/src/images/Thrift - Jackets/Thrift - Jackets/L.  IMG_7941 2.jpg", occasion: "City walks", price: "₹5,999", rentalPrice: "₹879", mood: "street" },

    // Vacation Products
    { id: "v1", title: "Summer Midi Dress", image: "/src/images/Womens Products/Womens Products/Dresses/IMG_3752.jpg", occasion: "Vacation ready", price: "₹5,999", rentalPrice: "₹849", mood: "vacation" },
    { id: "v2", title: "Beach Day Dress", image: "/src/images/Womens Products/Womens Products/Dresses/S IMG_3755.jpg", occasion: "Tropical vibes", price: "₹5,499", rentalPrice: "₹799", mood: "vacation" },
    { id: "v3", title: "Resort Chic", image: "/src/images/Womens Products/Womens Products/Dresses/S IMG_3756.jpg", occasion: "Island hopping", price: "₹5,299", rentalPrice: "₹779", mood: "vacation" },
    { id: "v4", title: "Poolside Look", image: "/src/images/Womens Products/Womens Products/Dresses/S.  IMG_3719.jpg", occasion: "Resort ready", price: "₹4,999", rentalPrice: "₹749", mood: "vacation" },
    { id: "v5", title: "Coastal Breeze", image: "/src/images/Womens Products/Womens Products/Dresses/S.  IMG_3727.jpg", occasion: "Beach walk", price: "₹5,199", rentalPrice: "₹759", mood: "vacation" },
    { id: "v6", title: "Sunset Dress", image: "/src/images/Womens Products/Womens Products/Dresses/S.  IMG_3754.jpg", occasion: "Evening stroll", price: "₹5,399", rentalPrice: "₹789", mood: "vacation" },
];

const TRENDING_SEARCHES = [
    "Party dresses",
    "Blazer",
    "Summer vacation",
    "Cocktail dress",
    "Sweatshirt",
    "Formal wear",
];

const STORAGE_KEY = "popclozet_recent_searches";

export default function SmartSearchOverlay({
    isOpen,
    onClose,
    onSearch,
}: SmartSearchOverlayProps) {
    const [query, setQuery] = useState("");
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [isSignupOpen, setIsSignupOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Search results based on query
    const searchResults = useMemo(() => {
        if (!query.trim() || query.length < 2) return [];

        const lowerQuery = query.toLowerCase();

        return ALL_PRODUCTS.filter(product => {
            const titleMatch = product.title.toLowerCase().includes(lowerQuery);
            const occasionMatch = product.occasion.toLowerCase().includes(lowerQuery);
            const moodMatch = product.mood.toLowerCase().includes(lowerQuery);

            // Also match against common keywords
            const keywords: Record<string, string[]> = {
                'dress': ['dress', 'gown', 'outfit'],
                'shirt': ['tee', 'shirt', 't-shirt'],
                'jacket': ['blazer', 'jacket', 'coat'],
                'party': ['party', 'club', 'night'],
                'office': ['formal', 'office', 'business', 'corporate'],
                'beach': ['vacation', 'beach', 'resort', 'summer'],
                'casual': ['casual', 'everyday', 'comfort', 'relaxed'],
            };

            let keywordMatch = false;
            for (const [key, synonyms] of Object.entries(keywords)) {
                if (synonyms.some(s => lowerQuery.includes(s) || s.includes(lowerQuery))) {
                    if (product.title.toLowerCase().includes(key) ||
                        product.occasion.toLowerCase().includes(key) ||
                        product.mood.toLowerCase().includes(key)) {
                        keywordMatch = true;
                        break;
                    }
                }
            }

            return titleMatch || occasionMatch || moodMatch || keywordMatch;
        }).slice(0, 8); // Limit to 8 results
    }, [query]);

    // Determine matched mood for "View All" button
    const matchedMood = useMemo(() => {
        if (!query.trim()) return null;
        const lowerQuery = query.toLowerCase();
        const moods = ['casual', 'party', 'cocktail', 'formal', 'street', 'vacation'];
        const moodAliases: Record<string, string> = {
            'office': 'formal',
            'work': 'formal',
            'business': 'formal',
            'club': 'party',
            'night': 'party',
            'beach': 'vacation',
            'summer': 'vacation',
            'resort': 'vacation',
            'streetwear': 'street',
            'urban': 'street',
        };

        for (const mood of moods) {
            if (lowerQuery.includes(mood)) return mood;
        }
        for (const [alias, mood] of Object.entries(moodAliases)) {
            if (lowerQuery.includes(alias)) return mood;
        }
        return null;
    }, [query]);

    // Load recent searches from localStorage
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setRecentSearches(JSON.parse(stored).slice(0, 5));
            }
        } catch (e) {
            console.warn("Could not load recent searches", e);
        }
    }, [isOpen]);

    // Focus input when overlay opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
        // Clear query when overlay closes
        if (!isOpen) {
            setQuery("");
        }
    }, [isOpen]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };
        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose]);

    const saveSearch = (term: string) => {
        try {
            const updated = [term, ...recentSearches.filter((s) => s !== term)].slice(
                0,
                5
            );
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            setRecentSearches(updated);
        } catch (e) {
            console.warn("Could not save search", e);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            saveSearch(query.trim());
            // Navigate to collections with the matched mood or default
            const targetMood = matchedMood || 'casual';
            window.location.hash = `/collections/${targetMood}`;
            onClose();
        }
    };

    const handleSuggestionClick = (term: string) => {
        setQuery(term);
        saveSearch(term);
    };

    const handleViewAllResults = () => {
        if (query.trim()) {
            saveSearch(query.trim());
        }
        const targetMood = matchedMood || 'casual';
        window.location.hash = `/collections/${targetMood}`;
        onClose();
    };

    const handleProductClick = () => {
        setIsSignupOpen(true);
    };

    const clearRecentSearches = () => {
        localStorage.removeItem(STORAGE_KEY);
        setRecentSearches([]);
    };

    const showSearchResults = query.length >= 2;

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[100] bg-[#F6F0E0]/98 dark:bg-[#1A1A1A]/98 backdrop-blur-xl overflow-y-auto"
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-3 rounded-full bg-white/80 dark:bg-[#282828]/80 hover:bg-white dark:hover:bg-[#282828] transition-colors shadow-lg z-10"
                            aria-label="Close search"
                        >
                            <X className="w-6 h-6 text-black dark:text-[#FAFAFA]" />
                        </button>

                        <div className="container-custom max-w-4xl mx-auto pt-16 pb-20 px-4">
                            {/* Header */}
                            <motion.div
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="text-center mb-8"
                            >
                                <div className="inline-flex items-center gap-2 bg-[#E3BBE6] dark:bg-[#302038] text-black dark:text-[#FAFAFA] px-4 py-2 rounded-full mb-4">
                                    <Sparkles className="w-4 h-4" />
                                    <span className="text-sm font-bold">Smart Search</span>
                                </div>
                                <h2 className="text-2xl md:text-3xl font-playfair font-bold text-black dark:text-[#FAFAFA]">
                                    Find Your Perfect Outfit
                                </h2>
                            </motion.div>

                            {/* Search Input */}
                            <motion.form
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                onSubmit={handleSubmit}
                                className="relative mb-8"
                            >
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-black/40 dark:text-[#FAFAFA]/40" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search by name, mood, or occasion..."
                                    className={cn(
                                        "w-full py-5 pl-14 pr-32 text-lg rounded-2xl",
                                        "bg-white dark:bg-[#282828] border-2 border-black/10 dark:border-[#FAFAFA]/10",
                                        "focus:outline-none focus:border-[#EB76C2] focus:ring-4 focus:ring-[#EB76C2]/20",
                                        "placeholder:text-black/40 dark:placeholder:text-[#FAFAFA]/40",
                                        "text-black dark:text-[#FAFAFA]",
                                        "transition-all duration-200 shadow-lg"
                                    )}
                                />
                                {query && (
                                    <button
                                        type="submit"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 px-5 py-2.5 bg-[#EB76C2] text-white rounded-xl font-bold text-sm hover:bg-[#d966b3] transition-colors shadow-md"
                                    >
                                        Search
                                    </button>
                                )}
                            </motion.form>

                            {/* Search Results */}
                            <AnimatePresence mode="wait">
                                {showSearchResults && searchResults.length > 0 ? (
                                    <motion.div
                                        key="results"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="mb-10"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-black dark:text-[#FAFAFA]">
                                                Found {searchResults.length} results for "{query}"
                                            </h3>
                                            <button
                                                onClick={handleViewAllResults}
                                                className="text-sm font-bold text-[#EB76C2] hover:underline flex items-center gap-1"
                                            >
                                                View All Results
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {searchResults.map((product, index) => (
                                                <motion.div
                                                    key={product.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    onClick={handleProductClick}
                                                    className="group bg-white dark:bg-[#282828] rounded-2xl border border-black/5 dark:border-[#FAFAFA]/5 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
                                                >
                                                    {/* Image */}
                                                    <div className="relative aspect-[3/4] overflow-hidden">
                                                        <img
                                                            src={product.image}
                                                            alt={product.title}
                                                            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
                                                        />
                                                        {/* Mood Badge */}
                                                        <div className="absolute top-2 right-2 px-2 py-1 bg-[#E3BBE6]/90 dark:bg-[#302038]/90 backdrop-blur-sm rounded-full">
                                                            <span className="text-[10px] font-bold uppercase text-black dark:text-[#FAFAFA]">
                                                                {product.mood}
                                                            </span>
                                                        </div>
                                                        {/* Heart Button */}
                                                        <motion.button
                                                            className="absolute top-2 left-2 w-8 h-8 bg-white/90 dark:bg-[#282828]/90 backdrop-blur-sm rounded-full flex items-center justify-center text-black/50 dark:text-[#FAFAFA]/50 hover:text-[#EB76C2] transition-all shadow-md"
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setIsSignupOpen(true);
                                                            }}
                                                        >
                                                            <Heart className="w-4 h-4" />
                                                        </motion.button>
                                                    </div>

                                                    {/* Product Info */}
                                                    <div className="p-3">
                                                        <h4 className="font-bold text-sm text-black dark:text-[#FAFAFA] truncate">
                                                            {product.title}
                                                        </h4>
                                                        <p className="text-black/50 dark:text-[#FAFAFA]/50 text-xs mb-2 truncate">
                                                            {product.occasion}
                                                        </p>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm font-bold text-[#EB76C2]">
                                                                {product.rentalPrice}
                                                            </span>
                                                            <span className="text-[10px] text-black/40 dark:text-[#FAFAFA]/40 line-through">
                                                                {product.price}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                ) : showSearchResults && searchResults.length === 0 ? (
                                    <motion.div
                                        key="no-results"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="text-center py-10 mb-8"
                                    >
                                        <div className="w-16 h-16 bg-[#E3BBE6]/20 dark:bg-[#302038]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Search className="w-8 h-8 text-[#EB76C2]" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-black dark:text-[#FAFAFA] mb-2">
                                            No results found for "{query}"
                                        </h3>
                                        <p className="text-black/60 dark:text-[#FAFAFA]/60 text-sm">
                                            Try searching for "party dress", "blazer", or "vacation"
                                        </p>
                                    </motion.div>
                                ) : null}
                            </AnimatePresence>

                            {/* Trending Searches - Show when not searching */}
                            {!showSearchResults && (
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="mb-10"
                                >
                                    <div className="flex items-center gap-2 mb-4">
                                        <TrendingUp className="w-5 h-5 text-[#EB76C2]" />
                                        <h3 className="text-lg font-semibold text-black dark:text-[#FAFAFA]">Trending Searches</h3>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {TRENDING_SEARCHES.map((term) => (
                                            <button
                                                key={term}
                                                onClick={() => handleSuggestionClick(term)}
                                                className={cn(
                                                    "px-4 py-2.5 rounded-full text-sm font-medium",
                                                    "bg-white dark:bg-[#282828] border border-black/10 dark:border-[#FAFAFA]/10",
                                                    "hover:border-[#EB76C2] hover:bg-[#EB76C2]/10",
                                                    "transition-all duration-200",
                                                    "flex items-center gap-2 group shadow-sm",
                                                    "text-black dark:text-[#FAFAFA]"
                                                )}
                                            >
                                                {term}
                                                <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Recent Searches */}
                            {!showSearchResults && recentSearches.length > 0 && (
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="mb-10"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-5 h-5 text-black/50 dark:text-[#FAFAFA]/50" />
                                            <h3 className="text-lg font-semibold text-black dark:text-[#FAFAFA]">Recent Searches</h3>
                                        </div>
                                        <button
                                            onClick={clearRecentSearches}
                                            className="text-sm text-black/50 dark:text-[#FAFAFA]/50 hover:text-black dark:hover:text-[#FAFAFA] transition-colors"
                                        >
                                            Clear All
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {recentSearches.map((term, index) => (
                                            <motion.button
                                                key={term}
                                                initial={{ x: -10, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ delay: 0.3 + index * 0.05 }}
                                                onClick={() => handleSuggestionClick(term)}
                                                className={cn(
                                                    "w-full px-4 py-3 rounded-xl text-left",
                                                    "bg-white/50 dark:bg-[#282828]/50 hover:bg-white dark:hover:bg-[#282828]",
                                                    "flex items-center gap-3 group",
                                                    "transition-all duration-200 shadow-sm"
                                                )}
                                            >
                                                <Clock className="w-4 h-4 text-black/40 dark:text-[#FAFAFA]/40" />
                                                <span className="flex-1 font-medium text-black dark:text-[#FAFAFA]">{term}</span>
                                                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-black dark:text-[#FAFAFA]" />
                                            </motion.button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Browse by Occasion */}
                            {!showSearchResults && (
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <h3 className="text-lg font-semibold mb-4 text-black dark:text-[#FAFAFA]">Browse by Occasion</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {[
                                            { name: "Party", emoji: "🎉", moodId: "party" },
                                            { name: "Cocktail", emoji: "🍸", moodId: "cocktail" },
                                            { name: "Formal", emoji: "💼", moodId: "formal" },
                                            { name: "Vacation", emoji: "🌴", moodId: "vacation" },
                                            { name: "Streetwear", emoji: "👟", moodId: "street" },
                                            { name: "Casual", emoji: "☕", moodId: "casual" },
                                        ].map((cat) => (
                                            <button
                                                key={cat.name}
                                                onClick={() => {
                                                    onClose();
                                                    window.location.hash = `/collections/${cat.moodId}`;
                                                }}
                                                className={cn(
                                                    "p-4 rounded-2xl text-center",
                                                    "bg-white dark:bg-[#282828] border border-black/5 dark:border-[#FAFAFA]/5",
                                                    "hover:border-[#EB76C2] hover:shadow-lg hover:-translate-y-1",
                                                    "transition-all duration-300 shadow-sm"
                                                )}
                                            >
                                                <span className="text-2xl block mb-2">{cat.emoji}</span>
                                                <span className="font-medium text-sm text-black dark:text-[#FAFAFA]">{cat.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <SignupModal isOpen={isSignupOpen} onClose={() => setIsSignupOpen(false)} />
        </>
    );
}
