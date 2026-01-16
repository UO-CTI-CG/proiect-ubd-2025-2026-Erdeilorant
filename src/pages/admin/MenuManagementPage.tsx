import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { restaurantService } from '@/services/restaurantService';
import { menuItemService } from '@/services/menuItemService';
import { uploadService } from '@/services/uploadService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Upload, Loader2, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import { MenuItem } from '@/types';

export default function MenuManagementPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    isPopular: false,
    isVegetarian: false,
    allergens: '',
  });

  // Fetch restaurant
  const { data: restaurant } = useQuery({
    queryKey: ['restaurant', user?.id],
    queryFn: () => restaurantService.getRestaurantByOwnerId(user!.id),
    enabled: !!user?.id,
  });

  // Fetch menu items
  const { data: menuItems = [], isLoading } = useQuery({
    queryKey: ['menuItems', restaurant?.id],
    queryFn: () => menuItemService.getMenuItemsByRestaurant(restaurant!.id),
    enabled: !!restaurant?.id,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: Partial<MenuItem>) => {
      return menuItemService.createMenuItem(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      toast.success('Produsul a fost adăugat!');
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Eroare la adăugarea produsului');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<MenuItem> }) => {
      return menuItemService.updateMenuItem(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      toast.success('Produsul a fost actualizat!');
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Eroare la actualizarea produsului');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => menuItemService.deleteMenuItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      toast.success('Produsul a fost șters!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Eroare la ștergerea produsului');
    },
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
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: '',
      isPopular: false,
      isVegetarian: false,
      allergens: '',
    });
    setImageFile(null);
    setImagePreview('');
    setEditingItem(null);
    setIsDialogOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!restaurant) {
      toast.error('Restaurant negăsit');
      return;
    }

    if (!imageFile && !editingItem) {
      toast.error('Vă rugăm să încărcați o imagine');
      return;
    }

    try {
      let imageUrl = editingItem?.image || '';

      if (imageFile) {
        toast.info('Se încarcă imaginea...');
        const uploadResponse = await uploadService.uploadMenuItemImage(imageFile);
        imageUrl = uploadResponse.url;
      }

      const allergens = formData.allergens
        .split(',')
        .map((a) => a.trim())
        .filter((a) => a.length > 0);

      const menuItemData = {
        restaurantId: restaurant.id,
        name: formData.name,
        description: formData.description,
        price: formData.price,
        category: formData.category,
        image: imageUrl,
        isPopular: formData.isPopular,
        isVegetarian: formData.isVegetarian,
        available: true,
        allergens,
      };

      if (editingItem) {
        // Update existing item
        await updateMutation.mutateAsync({ id: editingItem.id, data: menuItemData });
      } else {
        // Create new item
        await createMutation.mutateAsync(menuItemData);
      }
    } catch (error) {
      console.error('Error saving menu item:', error);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price,
      category: item.category,
      isPopular: item.isPopular || false,
      isVegetarian: item.isVegetarian || false,
      allergens: item.allergens?.join(', ') || '',
    });
    setImagePreview('');
    setImageFile(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Sigur vrei să ștergi acest produs?')) {
      deleteMutation.mutate(id);
    }
  };

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center">
          <h2 className="text-2xl font-bold mb-4">Trebuie să creezi un restaurant mai întâi</h2>
          <Button onClick={() => navigate('/admin/restaurant')}>Creează Restaurant</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Înapoi
            </Button>
            <h1 className="text-3xl font-bold">Meniu - {restaurant.name}</h1>
            <p className="text-muted-foreground">{menuItems.length} produse</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Adaugă Produs
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? 'Editează Produs' : 'Adaugă Produs Nou'}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Image Upload */}
                <div className="space-y-2">
                  <Label>Imagine Produs *</Label>
                  {imagePreview || editingItem?.image ? (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                      <img
                        src={imagePreview || uploadService.getImageUrl(editingItem!.image)}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
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
                    <label className="w-full h-48 flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                      <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">Click pentru imagine</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="name">Nume Produs *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="description">Descriere</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Preț (RON) *</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Categorie *</Label>
                    <Input
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      placeholder="ex: Pizza, Desert"
                      required
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="allergens">Alergeni (separate prin virgulă)</Label>
                    <Input
                      id="allergens"
                      name="allergens"
                      value={formData.allergens}
                      onChange={handleChange}
                      placeholder="ex: Gluten, Lactate, Nuci"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isVegetarian"
                      name="isVegetarian"
                      checked={formData.isVegetarian}
                      onChange={handleChange}
                      className="rounded"
                    />
                    <Label htmlFor="isVegetarian" className="cursor-pointer">
                      Vegetarian
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isPopular"
                      name="isPopular"
                      checked={formData.isPopular}
                      onChange={handleChange}
                      className="rounded"
                    />
                    <Label htmlFor="isPopular" className="cursor-pointer">
                      Popular
                    </Label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Anulează
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {(createMutation.isPending || updateMutation.isPending) ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Se salvează...
                      </>
                    ) : editingItem ? (
                      'Actualizează'
                    ) : (
                      'Salvează'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : menuItems.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">Nu ai adăugat produse încă</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adaugă Primul Produs
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {menuItems.map((item) => (
              <Card key={item.id}>
                <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                  <img
                    src={uploadService.getImageUrl(item.image)}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Badge variant="secondary">{item.category}</Badge>
                      {item.isVegetarian && <Badge variant="outline">🌱</Badge>}
                      {item.isPopular && <Badge variant="outline">⭐</Badge>}
                    </div>
                    <p className="text-lg font-bold">{item.price} RON</p>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editează
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
