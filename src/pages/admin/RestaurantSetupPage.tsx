import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { restaurantService } from '@/services/restaurantService';
import { uploadService } from '@/services/uploadService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { Upload, Loader2, ArrowLeft } from 'lucide-react';
import Header from '@/components/layout/Header';

export default function RestaurantSetupPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    cuisine: '',
    address: '',
    deliveryTime: '30-45 min',
    deliveryFee: 5,
    minOrder: 20,
    categories: '',
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Imaginea este prea mare. Maxim 10MB.');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'deliveryFee' || name === 'minOrder' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      toast.error('Trebuie să fiți autentificat');
      return;
    }

    if (!imageFile) {
      toast.error('Vă rugăm să încărcați o imagine pentru restaurant');
      return;
    }

    setIsLoading(true);

    try {
      // Upload image first
      toast.info('Se încarcă imaginea...');
      const uploadResponse = await uploadService.uploadRestaurantImage(imageFile);

      // Create restaurant
      toast.info('Se creează restaurantul...');
      const categories = formData.categories
        .split(',')
        .map((c) => c.trim())
        .filter((c) => c.length > 0);

      await restaurantService.createRestaurant(
        {
          name: formData.name,
          cuisine: formData.cuisine,
          address: formData.address,
          deliveryTime: formData.deliveryTime,
          deliveryFee: formData.deliveryFee,
          minOrder: formData.minOrder,
          image: uploadResponse.url,
          categories,
          isOpen: true,
          rating: 0,
          reviewCount: 0,
        },
        user.id
      );

      toast.success('Restaurantul a fost creat cu succes!');
      navigate('/admin/menu');
    } catch (error: any) {
      console.error('Error creating restaurant:', error);
      toast.error(error.response?.data?.message || 'Eroare la crearea restaurantului');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-8">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Înapoi la Dashboard
        </Button>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Creează-ți Restaurantul</CardTitle>
            <CardDescription>
              Completează informațiile despre restaurantul tău pentru a începe să primești comenzi
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Imagine Restaurant *</Label>
                <div className="flex flex-col items-center gap-4">
                  {imagePreview ? (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview('');
                        }}
                      >
                        Schimbă
                      </Button>
                    </div>
                  ) : (
                    <label className="w-full h-48 flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition">
                      <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">
                        Click pentru a încărca imaginea
                      </span>
                      <span className="text-xs text-muted-foreground mt-1">PNG, JPG până la 10MB</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Restaurant Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Nume Restaurant *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="ex: Pizza Napoletana"
                  required
                />
              </div>

              {/* Cuisine */}
              <div className="space-y-2">
                <Label htmlFor="cuisine">Tip Bucătărie *</Label>
                <Input
                  id="cuisine"
                  name="cuisine"
                  value={formData.cuisine}
                  onChange={handleChange}
                  placeholder="ex: Italiană, Românească, Fast-Food"
                  required
                />
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <Label htmlFor="categories">Categorii (separate prin virgulă)</Label>
                <Input
                  id="categories"
                  name="categories"
                  value={formData.categories}
                  onChange={handleChange}
                  placeholder="ex: Pizza, Paste, Desert"
                />
                <p className="text-xs text-muted-foreground">
                  Separă categoriile cu virgulă
                </p>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Adresă *</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Strada, Număr, Sector, Oraș"
                  required
                  rows={2}
                />
              </div>

              {/* Delivery Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deliveryTime">Timp Livrare</Label>
                  <Input
                    id="deliveryTime"
                    name="deliveryTime"
                    value={formData.deliveryTime}
                    onChange={handleChange}
                    placeholder="30-45 min"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryFee">Taxă Livrare (RON)</Label>
                  <Input
                    id="deliveryFee"
                    name="deliveryFee"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.deliveryFee}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minOrder">Comandă Minimă (RON)</Label>
                  <Input
                    id="minOrder"
                    name="minOrder"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.minOrder}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>
                Anulează
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Se creează...
                  </>
                ) : (
                  'Creează Restaurant'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
