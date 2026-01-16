import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

export default function RestaurantEditPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    cuisine: '',
    address: '',
    deliveryTime: '',
    deliveryFee: 0,
    minOrder: 0,
    categories: '',
    image: '',
  });

  // Fetch restaurant
  const { data: restaurant, isLoading } = useQuery({
    queryKey: ['restaurant', user?.id],
    queryFn: () => restaurantService.getRestaurantByOwnerId(user!.id),
    enabled: !!user?.id,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: any) => restaurantService.updateRestaurant(restaurant!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant'] });
      toast.success('Restaurantul a fost actualizat!');
      navigate('/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Eroare la actualizarea restaurantului');
    },
  });

  // Load restaurant data into form
  useEffect(() => {
    if (restaurant) {
      setFormData({
        name: restaurant.name,
        cuisine: restaurant.cuisine,
        address: restaurant.address,
        deliveryTime: restaurant.deliveryTime || '',
        deliveryFee: restaurant.deliveryFee,
        minOrder: restaurant.minOrder,
        categories: restaurant.categories?.join(', ') || '',
        image: restaurant.image || '',
      });
      if (restaurant.image) {
        setImagePreview(uploadService.getImageUrl(restaurant.image));
      }
    }
  }, [restaurant]);

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

    if (!user?.id || !restaurant) {
      toast.error('Trebuie să fiți autentificat');
      return;
    }

    try {
      let imageUrl = formData.image;

      // Upload new image if changed
      if (imageFile) {
        toast.info('Se încarcă imaginea...');
        const uploadResponse = await uploadService.uploadRestaurantImage(imageFile);
        imageUrl = uploadResponse.url;
      }

      // Update restaurant
      toast.info('Se actualizează restaurantul...');
      const categories = formData.categories
        .split(',')
        .map((c) => c.trim())
        .filter((c) => c.length > 0);

      await updateMutation.mutateAsync({
        name: formData.name,
        cuisine: formData.cuisine,
        address: formData.address,
        deliveryTime: formData.deliveryTime,
        deliveryFee: formData.deliveryFee,
        minOrder: formData.minOrder,
        image: imageUrl,
        categories,
      });
    } catch (error: any) {
      console.error('Error updating restaurant:', error);
      toast.error(error.response?.data?.message || 'Eroare la actualizarea restaurantului');
    }
  };

  if (isLoading) {
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
          <p className="text-muted-foreground">Nu ai un restaurant creat încă.</p>
          <Button onClick={() => navigate('/admin/restaurant')} className="mt-4">
            Creează Restaurant
          </Button>
        </div>
      </div>
    );
  }

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
            <CardTitle>Editează Restaurantul</CardTitle>
            <CardDescription>
              Actualizează informațiile despre restaurantul tău
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Imagine Restaurant</Label>
                <div className="flex flex-col items-center gap-4">
                  {imagePreview ? (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <label className="absolute top-2 right-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            document.getElementById('image-upload')?.click();
                          }}
                        >
                          Schimbă Imaginea
                        </Button>
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
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
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Se actualizează...
                  </>
                ) : (
                  'Salvează Modificările'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
