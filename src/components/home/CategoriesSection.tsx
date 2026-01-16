import { motion } from 'framer-motion';

const categories = [
  { name: 'Pizza', emoji: '🍕' },
  { name: 'Burgeri', emoji: '🍔' },
  { name: 'Sushi', emoji: '🍣' },
  { name: 'Românească', emoji: '🥘' },
  { name: 'Paste', emoji: '🍝' },
  { name: 'Salate', emoji: '🥗' },
  { name: 'Desert', emoji: '🍰' },
  { name: 'Băuturi', emoji: '🥤' },
];

interface CategoriesSectionProps {
  onCategoryClick: (category: string) => void;
  selectedCategory: string | null;
}

export default function CategoriesSection({ onCategoryClick, selectedCategory }: CategoriesSectionProps) {
  return (
    <section className="py-8">
      <div className="container">
        <h2 className="mb-6 text-2xl font-bold text-foreground">Categorii populare</h2>
        
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-8 md:gap-4">
          {categories.map((category, index) => (
            <motion.button
              key={category.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onCategoryClick(
                selectedCategory === category.name ? '' : category.name
              )}
              className={`flex flex-col items-center gap-2 rounded-2xl p-4 transition-all ${
                selectedCategory === category.name
                  ? 'bg-primary text-primary-foreground shadow-glow'
                  : 'bg-card shadow-card hover:shadow-card-hover'
              }`}
            >
              <span className="text-3xl">{category.emoji}</span>
              <span className="text-xs font-medium sm:text-sm">{category.name}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
