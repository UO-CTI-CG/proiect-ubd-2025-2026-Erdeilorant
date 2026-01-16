import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Clock, Truck, MapPin, Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import MenuItemCard from '@/components/restaurant/MenuItemCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { restaurantService } from '@/services/restaurantService';
import { menuItemService } from '@/services/menuItemService';
import { uploadService } from '@/services/uploadService';

export default function RestaurantPage() {
  const { id } = useParams<{ id: string }>();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch restaurant
  const { data: restaurant, isLoading: restaurantLoading } = useQuery({
    queryKey: ['restaurant', id],
    queryFn: () => restaurantService.getRestaurantById(Number(id)),
    enabled: !!id,
  });

  // Fetch menu items
  const { data: restaurantMenuItems = [], isLoading: menuLoading } = useQuery({
    queryKey: ['menuItems', id],
    queryFn: () => menuItemService.getMenuItemsByRestaurant(Number(id)),
    enabled: !!id,
  });

  const categories = useMemo(() => {
    const cats = new Set(restaurantMenuItems.map((item) => item.category));
    return Array.from(cats);
  }, [restaurantMenuItems]);

  const filteredItems = useMemo(() => {
    if (!selectedCategory) return restaurantMenuItems;
    return restaurantMenuItems.filter((item) => item.category === selectedCategory);
  }, [restaurantMenuItems, selectedCategory]);

  if (restaurantLoading || menuLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground">Restaurant negăsit</h1>
          <Link to="/">
            <Button variant="default" className="mt-4">
              Înapoi la restaurante
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero image */}
      <div className="relative h-48 md:h-64 lg:h-80">
        <img
          src={uploadService.getImageUrl(restaurant.image)}
          alt={restaurant.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        
        <div className="absolute top-4 left-4">
          <Link to="/">
            <Button variant="secondary" size="sm" className="shadow-md">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Înapoi
            </Button>
          </Link>
        </div>
      </div>

      {/* Restaurant info */}
      <div className="container -mt-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-card p-6 shadow-elevated"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-foreground md:text-3xl">
                  {restaurant.name}
                </h1>
                {!restaurant.isOpen && (
                  <Badge variant="secondary">Închis</Badge>
                )}
              </div>
              
              <p className="mb-3 text-muted-foreground">{restaurant.cuisine}</p>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  <span className="font-semibold text-foreground">{restaurant.rating}</span>
                  <span>({restaurant.reviewCount} recenzii)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{restaurant.deliveryTime}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Truck className="h-4 w-4" />
                  <span>
                    {restaurant.deliveryFee === 0 ? 'Livrare gratuită' : `${restaurant.deliveryFee} lei livrare`}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{restaurant.address}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {restaurant.deliveryFee === 0 && (
                <Badge className="bg-success text-success-foreground">Livrare gratuită</Badge>
              )}
              <Badge variant="outline">Min. {restaurant.minOrder} lei</Badge>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Menu */}
      <div className="container py-8">
        <h2 className="mb-6 text-xl font-bold text-foreground">Meniu</h2>

        {/* Category tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            Toate
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Menu items */}
        <div className="grid gap-4 md:grid-cols-2">
          {filteredItems.map((item) => (
            <MenuItemCard 
              key={item.id} 
              item={item} 
              restaurantName={restaurant.name}
            />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            Nu există produse în această categorie.
          </div>
        )}
      </div>
    </div>
  );
}
