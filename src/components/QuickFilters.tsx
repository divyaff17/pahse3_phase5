import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, DollarSign, Zap, Calendar, Ruler, Palette, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickFiltersProps {
    isOpen?: boolean;
    onClose?: () => void;
    onFiltersChange?: (filters: FilterState) => void;
    initialFilters?: Partial<FilterState>;
}

export interface FilterState {
    occasions: string[];
    sizes: string[];
    colors: string[];
    priceRange: string | null;
    deliveryTime: string | null;
    availabilityDate: Date | null;
}

const OCCASIONS = [
    { name: "Party", emoji: "🎉" },
    { name: "Wedding", emoji: "💒" },
    { name: "Work", emoji: "💼" },
    { name: "Casual", emoji: "☕" },
    { name: "Vacation", emoji: "🌴" },
    { name: "Date Night", emoji: "❤️" },
];

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const COLORS = [
    { name: "Red", hex: "#EF4444" },
    { name: "Blue", hex: "#3B82F6" },
    { name: "Green", hex: "#10B981" },
    { name: "Black", hex: "#000000" },
    { name: "White", hex: "#FFFFFF" },
    { name: "Pink", hex: "#EC4899" },
    { name: "Purple", hex: "#8B5CF6" },
    { name: "Yellow", hex: "#F59E0B" },
    { name: "Navy", hex: "#1E3A5F" },
    { name: "Beige", hex: "#D4C5B9" },
];

const DELIVERY_TIMES = ["< 30 min", "< 60 min", "< 2 hrs", "Same Day"];

const PRICE_RANGES = ["Under ₹500", "₹500-₹1000", "₹1000-₹2000", "Above ₹2000"];

const QuickFilters = ({
    isOpen = false,
    onClose,
    onFiltersChange,
    initialFilters,
}: QuickFiltersProps) => {
    const [filters, setFilters] = useState<FilterState>({
        occasions: initialFilters?.occasions || [],
        sizes: initialFilters?.sizes || [],
        colors: initialFilters?.colors || [],
        priceRange: initialFilters?.priceRange || null,
        deliveryTime: initialFilters?.deliveryTime || null,
        availabilityDate: initialFilters?.availabilityDate || null,
    });

    const [localOpen, setLocalOpen] = useState(false);
    const panelOpen = isOpen || localOpen;

    // Notify parent of filter changes
    useEffect(() => {
        onFiltersChange?.(filters);
    }, [filters, onFiltersChange]);

    const toggleArrayFilter = useCallback(
        (filterType: "occasions" | "sizes" | "colors", value: string) => {
            setFilters((prev) => ({
                ...prev,
                [filterType]: prev[filterType].includes(value)
                    ? prev[filterType].filter((f) => f !== value)
                    : [...prev[filterType], value],
            }));
        },
        []
    );

    const setSingleFilter = useCallback(
        (filterType: "priceRange" | "deliveryTime", value: string) => {
            setFilters((prev) => ({
                ...prev,
                [filterType]: prev[filterType] === value ? null : value,
            }));
        },
        []
    );

    const clearAllFilters = useCallback(() => {
        setFilters({
            occasions: [],
            sizes: [],
            colors: [],
            priceRange: null,
            deliveryTime: null,
            availabilityDate: null,
        });
    }, []);

    const handleClose = () => {
        setLocalOpen(false);
        onClose?.();
    };

    const activeFilterCount =
        filters.occasions.length +
        filters.sizes.length +
        filters.colors.length +
        (filters.priceRange ? 1 : 0) +
        (filters.deliveryTime ? 1 : 0) +
        (filters.availabilityDate ? 1 : 0);

    const allSelectedFilters = [
        ...filters.occasions,
        ...filters.sizes,
        ...filters.colors,
        ...(filters.priceRange ? [filters.priceRange] : []),
        ...(filters.deliveryTime ? [filters.deliveryTime] : []),
    ];

    const removeFilter = (filter: string) => {
        if (filters.occasions.includes(filter)) {
            toggleArrayFilter("occasions", filter);
        } else if (filters.sizes.includes(filter)) {
            toggleArrayFilter("sizes", filter);
        } else if (filters.colors.includes(filter)) {
            toggleArrayFilter("colors", filter);
        } else if (filters.priceRange === filter) {
            setSingleFilter("priceRange", filter);
        } else if (filters.deliveryTime === filter) {
            setSingleFilter("deliveryTime", filter);
        }
    };

    return (
        <>
            <AnimatePresence>
                {panelOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                            onClick={handleClose}
                        />

                        {/* Panel */}
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 bottom-0 w-full md:w-[420px] bg-background z-50 shadow-2xl overflow-y-auto"
                        >
                            <div className="p-4 sm:p-6">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <Sparkles className="w-6 h-6 text-primary" />
                                        <h2 className="text-xl sm:text-2xl font-bold">Filters</h2>
                                        {activeFilterCount > 0 && (
                                            <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
                                                {activeFilterCount}
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={handleClose}
                                        className="w-12 h-12 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
                                        aria-label="Close filters"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                {/* Selected Filters Chips */}
                                {allSelectedFilters.length > 0 && (
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm font-semibold text-muted-foreground">
                                                Selected ({activeFilterCount})
                                            </span>
                                            <button
                                                onClick={clearAllFilters}
                                                className="text-sm text-primary font-semibold hover:underline"
                                            >
                                                Clear All
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {allSelectedFilters.map((filter) => (
                                                <motion.div
                                                    key={filter}
                                                    initial={{ scale: 0.8, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    exit={{ scale: 0.8, opacity: 0 }}
                                                    className="bg-gradient-to-r from-primary to-secondary text-white px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2"
                                                >
                                                    {filter}
                                                    <button
                                                        onClick={() => removeFilter(filter)}
                                                        className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Occasions */}
                                <div className="mb-8">
                                    <h3 className="font-bold mb-4 flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-primary" />
                                        Occasion
                                    </h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {OCCASIONS.map((occasion) => (
                                            <motion.button
                                                key={occasion.name}
                                                onClick={() => toggleArrayFilter("occasions", occasion.name)}
                                                className={cn(
                                                    "px-4 py-3 rounded-xl font-semibold text-sm transition-all flex items-center gap-2",
                                                    filters.occasions.includes(occasion.name)
                                                        ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg"
                                                        : "bg-muted hover:bg-muted/80"
                                                )}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <span>{occasion.emoji}</span>
                                                {occasion.name}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                {/* Sizes - Critical for fashion */}
                                <div className="mb-8">
                                    <h3 className="font-bold mb-4 flex items-center gap-2">
                                        <Ruler className="w-5 h-5 text-primary" />
                                        Size
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {SIZES.map((size) => (
                                            <motion.button
                                                key={size}
                                                onClick={() => toggleArrayFilter("sizes", size)}
                                                className={cn(
                                                    "w-14 h-14 rounded-xl font-bold text-sm transition-all flex items-center justify-center",
                                                    filters.sizes.includes(size)
                                                        ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg"
                                                        : "bg-muted hover:bg-muted/80"
                                                )}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                {size}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                {/* Colors */}
                                <div className="mb-8">
                                    <h3 className="font-bold mb-4 flex items-center gap-2">
                                        <Palette className="w-5 h-5 text-primary" />
                                        Color
                                    </h3>
                                    <div className="flex flex-wrap gap-3">
                                        {COLORS.map((color) => (
                                            <motion.button
                                                key={color.name}
                                                onClick={() => toggleArrayFilter("colors", color.name)}
                                                className={cn(
                                                    "w-10 h-10 rounded-full transition-all border-2",
                                                    filters.colors.includes(color.name)
                                                        ? "ring-4 ring-primary ring-offset-2 border-primary"
                                                        : "border-border hover:border-muted-foreground"
                                                )}
                                                style={{ backgroundColor: color.hex }}
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                title={color.name}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Price Range */}
                                <div className="mb-8">
                                    <h3 className="font-bold mb-4 flex items-center gap-2">
                                        <DollarSign className="w-5 h-5 text-primary" />
                                        Price Range
                                    </h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {PRICE_RANGES.map((range) => (
                                            <motion.button
                                                key={range}
                                                onClick={() => setSingleFilter("priceRange", range)}
                                                className={cn(
                                                    "px-4 py-3 rounded-xl font-semibold text-sm transition-all text-left",
                                                    filters.priceRange === range
                                                        ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg"
                                                        : "bg-muted hover:bg-muted/80"
                                                )}
                                                whileHover={{ scale: 1.01 }}
                                                whileTap={{ scale: 0.99 }}
                                            >
                                                {range}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                {/* Delivery Time */}
                                <div className="mb-8">
                                    <h3 className="font-bold mb-4 flex items-center gap-2">
                                        <Zap className="w-5 h-5 text-primary" />
                                        Delivery Time
                                    </h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {DELIVERY_TIMES.map((time) => (
                                            <motion.button
                                                key={time}
                                                onClick={() => setSingleFilter("deliveryTime", time)}
                                                className={cn(
                                                    "px-4 py-3 rounded-xl font-semibold text-sm transition-all",
                                                    filters.deliveryTime === time
                                                        ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg"
                                                        : "bg-muted hover:bg-muted/80"
                                                )}
                                                whileHover={{ scale: 1.01 }}
                                                whileTap={{ scale: 0.99 }}
                                            >
                                                {time}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                {/* Apply Button */}
                                <div className="sticky bottom-0 pt-4 pb-2 bg-background">
                                    <motion.button
                                        className="w-full btn-primary text-base py-4 font-bold"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleClose}
                                    >
                                        Apply Filters
                                        {activeFilterCount > 0 && (
                                            <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-sm">
                                                {activeFilterCount}
                                            </span>
                                        )}
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default QuickFilters;
