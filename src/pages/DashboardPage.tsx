import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  ChefHat,
  Package,
  TrendingUp,
  ShoppingBag,
  Plus,
  Store,
  UtensilsCrossed,
  Loader2,
  Edit,
  Trash2
} from 'lucide-react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { restaurantService } from '@/services/restaurantService';
import { orderService } from '@/services/orderService';
import { uploadService } from '@/services/uploadService';
import { toast } from 'sonner';
import { Order } from '@/types';

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING: {
    label: 'În așteptare',
    color: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
    icon: <Clock className="h-4 w-4" />
  },
  CONFIRMED: {
    label: 'Confirmată',
    color: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
    icon: <CheckCircle className="h-4 w-4" />
  },
  PREPARING: {
    label: 'Se prepară',
    color: 'bg-orange-500/10 text-orange-700 border-orange-500/20',
    icon: <ChefHat className="h-4 w-4" />
  },
  READY: {
    label: 'Gata',
    color: 'bg-green-500/10 text-green-700 border-green-500/20',
    icon: <Package className="h-4 w-4" />
  },
  COMPLETED: {
    label: 'Finalizată',
    color: 'bg-gray-500/10 text-gray-700 border-gray-500/20',
    icon: <CheckCircle className="h-4 w-4" />
  },
  CANCELLED: {
    label: 'Anulată',
    color: 'bg-red-500/10 text-red-700 border-red-500/20',
    icon: <XCircle className="h-4 w-4" />
  },
};

const statusFlow: Order['status'][] = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED'];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<Order['status'] | 'all'>('all');

  // Fetch restaurant - ALWAYS call hooks at the top level
  const { data: restaurant, isLoading: restaurantLoading } = useQuery({
    queryKey: ['restaurant', user?.id],
    queryFn: () => restaurantService.getRestaurantByOwnerId(user!.id),
    enabled: !!user?.id && !!isAuthenticated,
    retry: false,
  });

  // Fetch orders
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['orders', restaurant?.id],
    queryFn: () => orderService.getOrdersByRestaurant(restaurant!.id),
    enabled: !!restaurant?.id,
  });

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: string }) =>
      orderService.updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Status comandă actualizat!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Eroare la actualizarea statusului');
    },
  });

  // Delete restaurant mutation
  const deleteRestaurantMutation = useMutation({
    mutationFn: async (restaurantId: number) => {
      console.log('Attempting to delete restaurant:', restaurantId);
      const result = await restaurantService.deleteRestaurant(restaurantId);
      console.log('Delete result:', result);
      return result;
    },
    onSuccess: async () => {
      console.log('Delete successful, cleaning up...');
      toast.success('Restaurantul a fost șters cu succes!');

      // Clear all restaurant data from cache completely
      queryClient.removeQueries({ queryKey: ['restaurant'] });
      queryClient.removeQueries({ queryKey: ['restaurants'] });
      queryClient.removeQueries({ queryKey: ['orders'] });
      queryClient.removeQueries({ queryKey: ['menuItems'] });

      // Force refetch to confirm deletion
      await queryClient.refetchQueries({ queryKey: ['restaurants'] });

      // Small delay to ensure state updates, then reload page
      setTimeout(() => {
        console.log('Reloading to dashboard...');
        window.location.href = '/dashboard';
      }, 300);
    },
    onError: (error: any) => {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || 'Eroare la ștergerea restaurantului');
    },
  });

  // NOW handle redirects AFTER all hooks are called
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter((order) => order.status === filter);

  const getNextStatus = (currentStatus: Order['status']): Order['status'] | null => {
    const currentIndex = statusFlow.indexOf(currentStatus);
    if (currentIndex === -1 || currentIndex >= statusFlow.length - 1) return null;
    return statusFlow[currentIndex + 1];
  };

  const handleStatusUpdate = (orderId: number, newStatus: Order['status']) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  const handleEditRestaurant = () => {
    navigate('/admin/restaurant/edit');
  };

  const handleDeleteRestaurant = () => {
    if (!restaurant) return;

    const confirmed = window.confirm(
      'Sigur vrei să ștergi restaurantul? Această acțiune va șterge și toate meniurile și comenzile asociate.'
    );

    if (confirmed) {
      deleteRestaurantMutation.mutate(restaurant.id);
    }
  };

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'PENDING').length,
    preparing: orders.filter((o) => o.status === 'PREPARING').length,
    completed: orders.filter((o) => o.status === 'COMPLETED').length,
    revenue: orders
      .filter((o) => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + o.total, 0),
  };

  // Loading state or deleting
  if (restaurantLoading || deleteRestaurantMutation.isPending) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // No restaurant - show setup wizard
  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background">
        <Header />

        <div className="container py-20">
          <div className="mx-auto max-w-2xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                <Store className="h-12 w-12 text-primary" />
              </div>
              <h1 className="mb-4 text-3xl font-bold">Bun venit, {user?.username}!</h1>
              <p className="text-lg text-muted-foreground">
                Începe prin a-ți configura restaurantul pentru a primi comenzi
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid gap-4 sm:grid-cols-2"
            >
              <Card className="text-left">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Store className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>1. Creează Restaurantul</CardTitle>
                  <CardDescription>
                    Adaugă informații despre restaurantul tău
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => navigate('/admin/restaurant')} className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Configurează Restaurant
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-left opacity-50">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                    <UtensilsCrossed className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <CardTitle>2. Adaugă Meniu</CardTitle>
                  <CardDescription>
                    Configurează produsele tale
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button disabled className="w-full" variant="outline">
                    Disponibil după pasul 1
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Has restaurant - show dashboard
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link to="/" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Înapoi la magazin
            </Link>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">
              {restaurant.name}
            </h1>
            <p className="text-muted-foreground">Gestionează comenzile primite</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleEditRestaurant}>
              <Edit className="h-4 w-4 mr-2" />
              Editează Restaurant
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteRestaurant}
              disabled={deleteRestaurantMutation.isPending}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              {deleteRestaurantMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Șterge Restaurant
            </Button>
            <Button onClick={() => navigate('/admin/menu')}>
              <UtensilsCrossed className="h-4 w-4 mr-2" />
              Gestionează Meniu
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total comenzi', value: stats.total, icon: ShoppingBag, color: 'text-primary' },
            { label: 'În așteptare', value: stats.pending, icon: Clock, color: 'text-yellow-600' },
            { label: 'Se prepară', value: stats.preparing, icon: ChefHat, color: 'text-orange-600' },
            { label: 'Venituri', value: `${stats.revenue.toFixed(2)} RON`, icon: TrendingUp, color: 'text-green-600' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-xl bg-card p-6 shadow-sm border"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filter */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            Toate ({orders.length})
          </Button>
          {Object.entries(statusConfig).map(([status, config]) => (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(status as Order['status'])}
            >
              {config.label} ({orders.filter((o) => o.status === status).length})
            </Button>
          ))}
        </div>

        {/* Orders */}
        {ordersLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">
              {filter === 'all' ? 'Nu ai comenzi încă' : `Nu ai comenzi cu statusul "${statusConfig[filter]?.label}"`}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const config = statusConfig[order.status];
              const nextStatus = getNextStatus(order.status);

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-xl border bg-card p-6 shadow-sm"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <div className="mb-2 flex items-center gap-3">
                        <h3 className="text-lg font-semibold">Comanda #{order.orderNumber}</h3>
                        <Badge className={config.color + ' border'}>
                          {config.icon}
                          <span className="ml-1">{config.label}</span>
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p><strong>Client:</strong> {order.customerName}</p>
                        <p><strong>Telefon:</strong> {order.customerPhone}</p>
                        <p><strong>Adresă:</strong> {order.customerAddress}</p>
                        {order.notes && <p><strong>Notă:</strong> {order.notes}</p>}
                        <p><strong>Data:</strong> {new Date(order.createdAt).toLocaleString('ro-RO')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{order.total.toFixed(2)} RON</p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-4 rounded-lg bg-muted/50 p-4">
                    <p className="mb-3 text-sm font-medium">Produse:</p>
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex gap-3">
                          {item.image && (
                            <img
                              src={uploadService.getImageUrl(item.image)}
                              alt={item.name}
                              className="h-16 w-16 rounded-lg object-cover"
                            />
                          )}
                          <div className="flex flex-1 items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">
                                {item.quantity}x {item.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.price.toFixed(2)} RON / buc
                              </p>
                            </div>
                            <span className="text-sm font-semibold">{(item.price * item.quantity).toFixed(2)} RON</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {nextStatus && (
                      <Button
                        onClick={() => handleStatusUpdate(order.id, nextStatus)}
                        disabled={updateStatusMutation.isPending}
                        size="sm"
                      >
                        {updateStatusMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            {statusConfig[nextStatus].icon}
                            <span className="ml-2">Marchează ca {statusConfig[nextStatus].label}</span>
                          </>
                        )}
                      </Button>
                    )}
                    {order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleStatusUpdate(order.id, 'CANCELLED')}
                        disabled={updateStatusMutation.isPending}
                      >
                        Anulează
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
