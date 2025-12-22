import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import AnnouncementTicker from "@/components/AnnouncementTicker";
import { Shirt, PartyPopper, Wine, Briefcase, Footprints, Palmtree, Heart, Church } from "lucide-react";
import { GenderCategory, EventCategory } from "@/config/products";

interface EventCategoryCard {
    id: EventCategory;
    label: string;
    icon: React.ReactNode;
    description: string;
    gradient: string;
}

const EVENT_CATEGORIES: EventCategoryCard[] = [
    { id: "casual", label: "Casual", icon: <Shirt className="w-8 h-8" />, description: "Everyday comfort & style", gradient: "from-blue-400 to-cyan-500" },
    { id: "party", label: "Party", icon: <PartyPopper className="w-8 h-8" />, description: "Dance floor ready", gradient: "from-pink-400 to-rose-500" },
    { id: "cocktail", label: "Cocktail", icon: <Wine className="w-8 h-8" />, description: "Sophisticated elegance", gradient: "from-purple-400 to-indigo-500" },
    { id: "formal", label: "Formal", icon: <Briefcase className="w-8 h-8" />, description: "Professional & polished", gradient: "from-gray-600 to-slate-700" },
    { id: "street", label: "Streetwear", icon: <Footprints className="w-8 h-8" />, description: "Urban edge & attitude", gradient: "from-orange-400 to-red-500" },
    { id: "vacation", label: "Vacation", icon: <Palmtree className="w-8 h-8" />, description: "Resort & beach vibes", gradient: "from-teal-400 to-emerald-500" },
    { id: "wedding", label: "Wedding", icon: <Church className="w-8 h-8" />, description: "Ceremonial grandeur", gradient: "from-amber-400 to-yellow-500" },
    { id: "office", label: "Office", icon: <Briefcase className="w-8 h-8" />, description: "Corporate chic", gradient: "from-indigo-400 to-blue-500" },
];

const GENDER_LABELS: Record<GenderCategory, string> = {
    mens: "Men's",
    womens: "Women's",
    unisex: "Unisex",
};

const GenderCategoryPage = () => {
    const { gender } = useParams<{ gender: GenderCategory }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Validate gender parameter
    useEffect(() => {
        if (gender && !["mens", "womens", "unisex"].includes(gender)) {
            navigate("/");
        }
    }, [gender, navigate]);

    const genderLabel = gender ? GENDER_LABELS[gender] : "";

    const handleEventClick = (eventId: EventCategory) => {
        setLoading(true);
        navigate(`/shop/${gender}/${eventId}`);
        setTimeout(() => setLoading(false), 300);
    };

    return (
        <div className="min-h-screen bg-[#F6F0E0] dark:bg-[#1A1A1A]">
            <AnnouncementTicker />
            <Navigation />

            <main className="pt-[140px] md:pt-[150px] pb-16">
                <div className="container-custom">
                    {/* Breadcrumb */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 text-sm mb-8 text-black/60 dark:text-[#FAFAFA]/60"
                    >
                        <button onClick={() => navigate("/")} className="hover:text-[#EB76C2] transition-colors">
                            Home
                        </button>
                        <span>/</span>
                        <span className="text-black dark:text-[#FAFAFA] font-semibold">{genderLabel} Collection</span>
                    </motion.div>

                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-16"
                    >
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold mb-4 text-black dark:text-[#FAFAFA]">
                            {genderLabel} <span className="text-[#EB76C2]">Collection</span>
                        </h1>
                        <p className="text-lg text-black/60 dark:text-[#FAFAFA]/60 max-w-2xl mx-auto">
                            Discover the perfect outfit for every occasion. Rent designer fashion at a fraction of the price.
                        </p>
                    </motion.div>

                    {/* Event Categories Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {EVENT_CATEGORIES.map((category, index) => (
                            <motion.div
                                key={category.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ y: -8, scale: 1.02 }}
                                onClick={() => handleEventClick(category.id)}
                                className="group cursor-pointer"
                            >
                                <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#282828] shadow-lg hover:shadow-2xl transition-all duration-500 h-full">
                                    {/* Gradient Overlay */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

                                    {/* Content */}
                                    <div className="relative p-6 flex flex-col items-center text-center">
                                        {/* Icon */}
                                        <motion.div
                                            whileHover={{ rotate: 360 }}
                                            transition={{ duration: 0.6 }}
                                            className={`w-16 h-16 rounded-full bg-gradient-to-br ${category.gradient} flex items-center justify-center text-white mb-4 shadow-md`}
                                        >
                                            {category.icon}
                                        </motion.div>

                                        {/* Label */}
                                        <h3 className="text-xl font-bold mb-2 text-black dark:text-[#FAFAFA]">
                                            {category.label}
                                        </h3>

                                        {/* Description */}
                                        <p className="text-sm text-black/60 dark:text-[#FAFAFA]/60 mb-4">
                                            {category.description}
                                        </p>

                                        {/* Arrow */}
                                        <motion.div
                                            animate={{ x: [0, 4, 0] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                            className="text-[#EB76C2] font-bold"
                                        >
                                            →
                                        </motion.div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Bottom CTA */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-center mt-16"
                    >
                        <button
                            onClick={() => navigate("/")}
                            className="text-black/60 dark:text-[#FAFAFA]/60 hover:text-[#EB76C2] transition-colors"
                        >
                            ← Back to Gender Selection
                        </button>
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default GenderCategoryPage;
