import { motion } from 'framer-motion';
import { Star, Clock, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Restaurant } from '@/types';
import { Badge } from '@/components/ui/badge';
import { uploadService } from '@/services/uploadService';

interface RestaurantCardProps {
  restaurant: Restaurant;
  index: number;
}

export default function RestaurantCard({ restaurant, index }: RestaurantCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link to={`/restaurant/${restaurant.id}`}>
        <motion.article
          className="group relative overflow-hidden rounded-2xl bg-card shadow-card transition-all duration-300 hover:shadow-card-hover"
          whileHover={{ y: -4 }}
        >
          {/* Image */}
          <div className="relative aspect-[16/10] overflow-hidden">
            <img
              src={uploadService.getImageUrl(restaurant.image)}
              alt={restaurant.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
            
            {/* Status badge */}
            {!restaurant.isOpen && (
              <div className="absolute inset-0 flex items-center justify-center bg-foreground/50 backdrop-blur-sm">
                <Badge variant="secondary" className="text-sm font-semibold">
                  Închis acum
                </Badge>
              </div>
            )}
            
            {/* Delivery fee badge */}
            {restaurant.deliveryFee === 0 && (
              <Badge className="absolute top-3 left-3 bg-success text-success-foreground">
                Livrare gratuită
              </Badge>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="mb-2 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                  {restaurant.name}
                </h3>
                <p className="text-sm text-muted-foreground">{restaurant.cuisine}</p>
              </div>
              <div className="flex items-center gap-1 rounded-lg bg-accent/50 px-2 py-1">
                <Star className="h-4 w-4 fill-accent text-accent" />
                <span className="text-sm font-semibold text-foreground">{restaurant.rating}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{restaurant.deliveryTime}</span>
              </div>
              <div className="flex items-center gap-1">
                <Truck className="h-4 w-4" />
                <span>{restaurant.deliveryFee === 0 ? 'Gratis' : `${restaurant.deliveryFee} lei`}</span>
              </div>
            </div>

            {/* Categories */}
            <div className="mt-3 flex flex-wrap gap-1">
              {restaurant.categories.slice(0, 3).map((category) => (
                <Badge key={category} variant="outline" className="text-xs">
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </motion.article>
      </Link>
    </motion.div>
  );
}
