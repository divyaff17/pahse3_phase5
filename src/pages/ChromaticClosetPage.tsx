import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navigation from "@/components/Navigation";
import ChromaGrid from "@/components/interactive/ChromaGrid";
import { PRODUCTS } from "@/config/products";
import { formatPrice } from "@/utils/format";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const COLORS = [
    { name: "All", hex: "#ffffff", gradient: "linear-gradient(to bottom right, #ffffff, #f3f4f6)" },
    { name: "Blue", hex: "#3b82f6", gradient: "linear-gradient(to bottom right, #1e3a8a, #3b82f6)" },
    { name: "Red", hex: "#ef4444", gradient: "linear-gradient(to bottom right, #7f1d1d, #ef4444)" },
    { name: "Black", hex: "#000000", gradient: "linear-gradient(to bottom right, #000000, #1f2937)" },
    { name: "Pink", hex: "#ec4899", gradient: "linear-gradient(to bottom right, #831843, #ec4899)" },
    { name: "Orange", hex: "#f97316", gradient: "linear-gradient(to bottom right, #7c2d12, #f97316)" },
    { name: "Grey", hex: "#6b7280", gradient: "linear-gradient(to bottom right, #374151, #9ca3af)" },
];

const ChromaticClosetPage = () => {
    const [activeColor, setActiveColor] = useState(COLORS[0]);

    const filteredItems = useMemo(() => {
        if (activeColor.name === "All") return PRODUCTS;
        return PRODUCTS.filter(p => p.color === activeColor.name);
    }, [activeColor]);

    const chromaItems = filteredItems.map((item, idx) => ({
        image: item.image,
        title: item.name,
        subtitle: `Rent for ${formatPrice(item.price)} / day`,
        handle: item.category,
        borderColor: activeColor.name === "All" ? ["#a855f7", "#06b6d4", "#f59e0b", "#ef4444"][idx % 4] : activeColor.hex,
        gradient: activeColor.name === "All"
            ? ["linear-gradient(145deg, #a855f7, #0f172a)", "linear-gradient(165deg, #06b6d4, #0b1221)"][idx % 2]
            : `linear-gradient(145deg, ${activeColor.hex}, #000000)`,
        url: `/collections?id=${item.id}`
    }));

    return (
        <div className="min-h-screen bg-background text-foreground overflow-hidden relative transition-colors duration-700">
            {/* Dynamic Background */}
            <div
                className="absolute inset-0 opacity-10 transition-all duration-1000 pointer-events-none"
                style={{ background: activeColor.gradient }}
            />

            <Navigation />

            <main className="pt-24 pb-10 h-screen flex flex-col">
                <div className="container-custom flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-8 z-10 relative">
                        <div className="flex items-center gap-4">
                            <Link to="/" className="p-2 rounded-full glass hover:bg-secondary/20 transition-colors">
                                <ArrowLeft className="w-6 h-6" />
                            </Link>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold">Chromatic <span className="text-gradient">Closet</span></h1>
                                <p className="text-muted-foreground">Shop by mood & color</p>
                            </div>
                        </div>

                        {/* Color Palette */}
                        <div className="flex gap-2 bg-background/50 backdrop-blur-xl p-2 rounded-full border border-border shadow-lg">
                            {COLORS.map((color) => (
                                <button
                                    key={color.name}
                                    onClick={() => setActiveColor(color)}
                                    className={`w-8 h-8 rounded-full border-2 transition-all duration-300 ${activeColor.name === color.name ? "scale-125 border-primary shadow-glow" : "border-transparent hover:scale-110"}`}
                                    style={{ backgroundColor: color.hex }}
                                    title={color.name}
                                    aria-label={`Filter by ${color.name}`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 relative min-h-[500px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeColor.name}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                transition={{ duration: 0.5 }}
                                className="absolute inset-0"
                            >
                                {chromaItems.length > 0 ? (
                                    <ChromaGrid
                                        items={chromaItems}
                                        columns={Math.min(3, chromaItems.length)}
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-muted-foreground">
                                        <p>No items found in {activeColor.name}</p>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ChromaticClosetPage;
