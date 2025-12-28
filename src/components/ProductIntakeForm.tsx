import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Loader2,
    CheckCircle2,
    AlertCircle,
    Sparkles,
    Package,
    Palette,
    Tag,
    DollarSign,
    FileText,
    Wand2,
    PartyPopper
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { hygieneSopService } from '@/services/hygieneSopService';
import { GenderCategory, EventCategory } from '@/services/productService';
import { HygieneSopViewer } from './HygieneSopViewer';
import { QRCodeDisplay } from './QRCodeDisplay';

const productSchema = z.object({
    name: z.string().min(3, 'Product name must be at least 3 characters'),
    category: z.string().min(1, 'Category is required'),
    gender: z.enum(['mens', 'womens', 'unisex']),
    eventCategory: z.enum(['casual', 'party', 'cocktail', 'formal', 'street', 'vacation', 'wedding', 'office']),
    color: z.string().min(1, 'Color is required'),
    price: z.number().min(0, 'Price must be positive'),
    rentalPrice: z.number().min(0, 'Rental price must be positive'),
    fabricHint: z.string().optional(),
    description: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

export const ProductIntakeForm: React.FC = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [generatedProduct, setGeneratedProduct] = useState<any>(null);
    const [generatedSOP, setGeneratedSOP] = useState<any>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
    });

    const gender = watch('gender');
    const eventCategory = watch('eventCategory');

    const onSubmit = async (data: ProductFormData) => {
        setIsSubmitting(true);
        setError(null);
        setSuccess(false);

        try {
            console.log('📝 Creating product with minimal data:', data);

            // Create product in database
            const { data: product, error: productError } = await supabase
                .from('products')
                .insert({
                    name: data.name,
                    gender: data.gender,
                    event_category: data.eventCategory,
                    color: data.color,
                    price: data.price,
                    rental_price: data.rentalPrice,
                    fabric_hint: data.fabricHint,
                    description: data.description,
                    is_available: true,
                    rating: 5.0,
                    stock_quantity: 1,
                    rental_count: 0,
                    condition_status: 'excellent',
                })
                .select()
                .single();

            if (productError) throw productError;

            console.log('✅ Product created:', product.id);

            // Auto-generate hygiene SOP using AI
            console.log('🤖 Generating AI-powered hygiene SOP...');
            const sopRecord = await hygieneSopService.generateAndStoreSOP({
                productId: product.id,
                category: data.category,
                gender: data.gender,
                fabricHint: data.fabricHint,
            });

            console.log('✅ Hygiene SOP generated and QR code created!');

            setGeneratedProduct(product);
            setGeneratedSOP(sopRecord);
            setSuccess(true);

            // Reset form
            reset();
        } catch (err) {
            console.error('❌ Product intake error:', err);
            setError(err instanceof Error ? err.message : 'Failed to create product');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNewProduct = () => {
        setSuccess(false);
        setGeneratedProduct(null);
        setGeneratedSOP(null);
    };

    // Success State
    if (success && generatedProduct && generatedSOP) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
            >
                {/* Success Banner */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#C0E2AD]/30 via-[#22C55E]/20 to-[#C0E2AD]/30 border border-[#22C55E]/30 p-6"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#22C55E]/10 rounded-full blur-2xl" />
                    <div className="relative flex items-center gap-4">
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", duration: 0.8, delay: 0.2 }}
                            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#22C55E] to-[#16A34A] flex items-center justify-center shadow-lg shadow-[#22C55E]/30"
                        >
                            <PartyPopper className="w-7 h-7 text-white" />
                        </motion.div>
                        <div>
                            <h3 className="text-xl font-playfair font-bold text-foreground">
                                Product Created Successfully!
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                AI-powered hygiene SOP generated and QR code assigned
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* QR Code Display */}
                <QRCodeDisplay productId={generatedProduct.id} />

                {/* SOP Viewer */}
                <HygieneSopViewer
                    productData={{
                        id: generatedProduct.id,
                        name: generatedProduct.name,
                        gender: generatedProduct.gender,
                        eventCategory: generatedProduct.event_category,
                        color: generatedProduct.color,
                        price: generatedProduct.price,
                        rentalPrice: generatedProduct.rental_price,
                        imageUrl: generatedProduct.image_url || '',
                        rating: generatedProduct.rating,
                        rentalCount: generatedProduct.rental_count,
                        conditionStatus: generatedProduct.condition_status,
                    }}
                    sopData={generatedSOP}
                />

                {/* Add Another Button */}
                <Button
                    onClick={handleNewProduct}
                    size="lg"
                    className="w-full bg-gradient-to-r from-[#EB76C2] to-[#C084FC] hover:opacity-90 text-white shadow-lg"
                >
                    <Package className="mr-2 h-5 w-5" />
                    Add Another Product
                </Button>
            </motion.div>
        );
    }

    // Form State
    return (
        <Card className="overflow-hidden border-0 shadow-xl bg-card/80 backdrop-blur-sm">
            {/* Card Header */}
            <CardHeader className="relative overflow-hidden pb-6 bg-gradient-to-r from-[#C0E2AD]/10 via-transparent to-[#E3BBE6]/10">
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#C0E2AD]/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C0E2AD] to-[#22C55E] flex items-center justify-center">
                            <Wand2 className="h-5 w-5 text-black" />
                        </div>
                        <CardTitle className="text-2xl font-playfair">New Product Intake</CardTitle>
                    </div>
                    <CardDescription className="text-base">
                        Enter minimal product details. AI will automatically generate hygiene SOPs and assign QR codes.
                    </CardDescription>
                </div>
            </CardHeader>

            <CardContent className="p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Product Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
                            <Package className="w-4 h-4 text-[#22C55E]" />
                            Product Name
                        </Label>
                        <Input
                            id="name"
                            placeholder="e.g., Classic Navy Blazer"
                            className="h-12 bg-background/50 border-border/50 focus:border-[#22C55E] focus:ring-[#22C55E]/20"
                            {...register('name')}
                        />
                        {errors.name && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors.name.message}
                            </p>
                        )}
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <Label htmlFor="category" className="flex items-center gap-2 text-sm font-medium">
                            <Tag className="w-4 h-4 text-[#A855F7]" />
                            Category
                        </Label>
                        <Input
                            id="category"
                            placeholder="e.g., blazer, kurta, dress, shirt"
                            className="h-12 bg-background/50 border-border/50 focus:border-[#A855F7] focus:ring-[#A855F7]/20"
                            {...register('category')}
                        />
                        {errors.category && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors.category.message}
                            </p>
                        )}
                    </div>

                    {/* Gender & Event Category */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="gender" className="text-sm font-medium">Gender</Label>
                            <Select onValueChange={(value) => setValue('gender', value as GenderCategory)}>
                                <SelectTrigger className="h-12 bg-background/50 border-border/50">
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="mens">Men's</SelectItem>
                                    <SelectItem value="womens">Women's</SelectItem>
                                    <SelectItem value="unisex">Unisex</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.gender && (
                                <p className="text-sm text-destructive">{errors.gender.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="eventCategory" className="text-sm font-medium">Event Category</Label>
                            <Select onValueChange={(value) => setValue('eventCategory', value as EventCategory)}>
                                <SelectTrigger className="h-12 bg-background/50 border-border/50">
                                    <SelectValue placeholder="Select event" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="casual">Casual</SelectItem>
                                    <SelectItem value="party">Party</SelectItem>
                                    <SelectItem value="cocktail">Cocktail</SelectItem>
                                    <SelectItem value="formal">Formal</SelectItem>
                                    <SelectItem value="street">Street</SelectItem>
                                    <SelectItem value="vacation">Vacation</SelectItem>
                                    <SelectItem value="wedding">Wedding</SelectItem>
                                    <SelectItem value="office">Office</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.eventCategory && (
                                <p className="text-sm text-destructive">{errors.eventCategory.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Color */}
                    <div className="space-y-2">
                        <Label htmlFor="color" className="flex items-center gap-2 text-sm font-medium">
                            <Palette className="w-4 h-4 text-[#EB76C2]" />
                            Color
                        </Label>
                        <Input
                            id="color"
                            placeholder="e.g., Navy Blue, Red, Black"
                            className="h-12 bg-background/50 border-border/50 focus:border-[#EB76C2] focus:ring-[#EB76C2]/20"
                            {...register('color')}
                        />
                        {errors.color && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors.color.message}
                            </p>
                        )}
                    </div>

                    {/* Pricing */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price" className="flex items-center gap-2 text-sm font-medium">
                                <DollarSign className="w-4 h-4 text-[#22C55E]" />
                                Purchase Price (₹)
                            </Label>
                            <Input
                                id="price"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className="h-12 bg-background/50 border-border/50"
                                {...register('price', { valueAsNumber: true })}
                            />
                            {errors.price && (
                                <p className="text-sm text-destructive">{errors.price.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="rentalPrice" className="flex items-center gap-2 text-sm font-medium">
                                <DollarSign className="w-4 h-4 text-[#A855F7]" />
                                Rental Price (₹)
                            </Label>
                            <Input
                                id="rentalPrice"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className="h-12 bg-background/50 border-border/50"
                                {...register('rentalPrice', { valueAsNumber: true })}
                            />
                            {errors.rentalPrice && (
                                <p className="text-sm text-destructive">{errors.rentalPrice.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Fabric Hint */}
                    <div className="space-y-2">
                        <Label htmlFor="fabricHint" className="text-sm font-medium">
                            Fabric Hint <span className="text-muted-foreground">(Optional)</span>
                        </Label>
                        <Input
                            id="fabricHint"
                            placeholder="e.g., cotton, wool, silk (AI will infer if not provided)"
                            className="h-12 bg-background/50 border-border/50"
                            {...register('fabricHint')}
                        />
                        <p className="text-xs text-muted-foreground">
                            If unknown, AI will automatically infer the fabric type based on category and gender
                        </p>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description" className="flex items-center gap-2 text-sm font-medium">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            Description <span className="text-muted-foreground">(Optional)</span>
                        </Label>
                        <Textarea
                            id="description"
                            placeholder="Additional product details..."
                            rows={3}
                            className="bg-background/50 border-border/50 resize-none"
                            {...register('description')}
                        />
                    </div>

                    {/* Error Alert */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        size="lg"
                        disabled={isSubmitting}
                        className="w-full h-14 bg-gradient-to-r from-[#22C55E] to-[#16A34A] hover:from-[#16A34A] hover:to-[#15803D] text-white font-semibold text-base shadow-lg shadow-[#22C55E]/25 transition-all duration-300"
                    >
                        {isSubmitting ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center gap-2"
                            >
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span>Generating AI-Powered SOP...</span>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center gap-2"
                            >
                                <Sparkles className="h-5 w-5" />
                                <span>Create Product & Generate SOP</span>
                            </motion.div>
                        )}
                    </Button>

                    {/* Footer Note */}
                    <p className="text-xs text-center text-muted-foreground">
                        AI will automatically generate hygiene procedures, cleaning instructions, and assign a unique QR code
                    </p>
                </form>
            </CardContent>
        </Card>
    );
};
