import { motion } from 'framer-motion';
import { Plus, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MenuItem } from '@/types';
import { useCart } from '@/context/CartContext';
import { uploadService } from '@/services/uploadService';
import { toast } from 'sonner';

interface MenuItemCardProps {
  item: MenuItem;
  restaurantName: string;
}

export default function MenuItemCard({ item, restaurantName }: MenuItemCardProps) {
  const { addItem, state } = useCart();

  const handleAddToCart = () => {
    // Check if adding from different restaurant
    if (state.restaurantId && state.restaurantId !== item.restaurantId) {
      toast.info('Coșul a fost resetat pentru noul restaurant');
    }
    
    addItem(item, item.restaurantId, restaurantName);
    toast.success(`${item.name} adăugat în coș`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2 }}
      className="group flex gap-4 rounded-xl bg-card p-3 shadow-card transition-shadow hover:shadow-card-hover"
    >
      {/* Image */}
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg sm:h-28 sm:w-28">
        <img
          src={uploadService.getImageUrl(item.image)}
          alt={item.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        {item.isPopular && (
          <Badge className="absolute top-1 left-1 bg-accent text-accent-foreground text-[10px] px-1.5">
            Popular
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <div className="flex items-start gap-2">
            <h4 className="font-semibold text-foreground line-clamp-1">{item.name}</h4>
            {item.isVegetarian && (
              <Leaf className="h-4 w-4 flex-shrink-0 text-success" />
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {item.description}
          </p>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-bold text-primary">{item.price} lei</span>
          <motion.div whileTap={{ scale: 0.9 }}>
            <Button
              variant="default"
              size="sm"
              onClick={handleAddToCart}
              className="gap-1"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Adaugă</span>
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
