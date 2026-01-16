import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import HeroSection from '@/components/home/HeroSection';
import CategoriesSection from '@/components/home/CategoriesSection';
import RestaurantCard from '@/components/restaurant/RestaurantCard';
import { restaurantService } from '@/services/restaurantService';
import { Loader2 } from 'lucide-react';

export default function Index() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch restaurants from API
  const { data: restaurants = [], isLoading, error } = useQuery({
    queryKey: ['restaurants'],
    queryFn: () => restaurantService.getAllRestaurants(),
  });

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((restaurant) => {
      const matchesSearch =
        searchQuery === '' ||
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.categories.some((cat) =>
          cat.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesCategory =
        !selectedCategory ||
        restaurant.categories.some((cat) =>
          cat.toLowerCase().includes(selectedCategory.toLowerCase())
        ) ||
        restaurant.cuisine.toLowerCase().includes(selectedCategory.toLowerCase());

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, restaurants]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSelectedCategory(null);
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category || null);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        <HeroSection onSearch={handleSearch} />
        <CategoriesSection 
          onCategoryClick={handleCategoryClick} 
          selectedCategory={selectedCategory}
        />

        {/* Restaurants section */}
        <section className="py-8">
          <div className="container">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {selectedCategory
                    ? `Restaurante - ${selectedCategory}`
                    : searchQuery
                      ? `Rezultate pentru "${searchQuery}"`
                      : 'Restaurante populare'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {filteredRestaurants.length} restaurante disponibile
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="py-20 text-center">
                <p className="text-red-500">Eroare la încărcarea restaurantelor</p>
              </div>
            ) : filteredRestaurants.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredRestaurants.map((restaurant, index) => (
                  <RestaurantCard 
                    key={restaurant.id} 
                    restaurant={restaurant} 
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-20 text-center"
              >
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                  <span className="text-4xl">🔍</span>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">
                  Nu am găsit rezultate
                </h3>
                <p className="text-muted-foreground">
                  Încearcă să cauți altceva sau explorează categoriile
                </p>
              </motion.div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <span className="text-sm font-bold text-primary-foreground">F</span>
            </div>
            <span className="font-bold text-foreground">FoodieGo</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 FoodieGo. Toate drepturile rezervate.
          </p>
        </div>
      </footer>
    </div>
  );
}
