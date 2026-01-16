import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Phone, User, FileText, CheckCircle } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCart } from '@/context/CartContext';
import { orderService } from '@/services/orderService';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const { state, totalPrice, clearCart } = useCart();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: '',
  });

  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: (orderData: any) => orderService.createOrder(orderData),
    onSuccess: (data) => {
      setOrderNumber(data.orderNumber);
      setOrderComplete(true);
      clearCart();
      toast.success('Comanda a fost plasată cu succes!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Eroare la plasarea comenzii');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (state.items.length === 0) {
      toast.error('Coșul este gol');
      return;
    }

    if (!formData.name || !formData.phone || !formData.address) {
      toast.error('Te rugăm să completezi toate câmpurile obligatorii');
      return;
    }

    // Transform cart items to order items format
    const orderItems = state.items.map(item => ({
      menuItemId: item.id,
      quantity: item.quantity,
    }));

    // Create order request
    createOrderMutation.mutate({
      restaurantId: state.restaurantId,
      items: orderItems,
      customerName: formData.name,
      customerPhone: formData.phone,
      customerAddress: formData.address,
      notes: formData.notes,
    });
  };

  if (orderComplete && orderNumber) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto max-w-md text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-success/10"
            >
              <CheckCircle className="h-12 w-12 text-success" />
            </motion.div>

            <h1 className="mb-2 text-2xl font-bold text-foreground">
              Comanda a fost plasată!
            </h1>
            <p className="mb-6 text-muted-foreground">
              Numărul comenzii: <span className="font-semibold">{orderNumber}</span>
            </p>
            
            <div className="rounded-xl bg-card p-6 shadow-card text-left mb-6">
              <h3 className="font-semibold text-foreground mb-2">Detalii comandă</h3>
              <p className="text-sm text-muted-foreground">Nume: {formData.name}</p>
              <p className="text-sm text-muted-foreground">Telefon: {formData.phone}</p>
              <p className="text-sm text-muted-foreground">Adresă: {formData.address}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Restaurantul va procesa comanda ta în curând.
              </p>
            </div>
            
            <div className="flex flex-col gap-3">
              <Link to="/">
                <Button variant="hero" className="w-full">
                  Înapoi la restaurante
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="outline" className="w-full">
                  Vezi panoul restaurant
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center">
          <h1 className="mb-4 text-2xl font-bold text-foreground">Coșul este gol</h1>
          <p className="mb-6 text-muted-foreground">
            Adaugă produse în coș pentru a plasa o comandă.
          </p>
          <Link to="/">
            <Button variant="hero">Explorează restaurante</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-8">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          <span>Înapoi</span>
        </Link>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="mb-6 text-2xl font-bold text-foreground">Finalizare comandă</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="rounded-xl bg-card p-6 shadow-card space-y-4">
                <h2 className="font-semibold text-foreground">Date livrare</h2>
                
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Nume complet *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ion Popescu"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Telefon *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0712 345 678"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Adresă livrare *
                  </Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Strada, număr, bloc, apartament, oraș"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Observații (opțional)
                  </Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Instrucțiuni speciale pentru livrare..."
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full"
                disabled={createOrderMutation.isPending}
              >
                {createOrderMutation.isPending ? 'Se procesează...' : `Plasează comanda • ${totalPrice} lei`}
              </Button>
            </form>
          </motion.div>

          {/* Order summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="rounded-xl bg-card p-6 shadow-card lg:sticky lg:top-24">
              <h2 className="mb-4 font-semibold text-foreground">Sumar comandă</h2>
              
              <p className="mb-4 text-sm text-muted-foreground">
                De la: <span className="font-medium text-foreground">{state.restaurantName}</span>
              </p>

              <div className="space-y-3 mb-6">
                {state.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground line-clamp-1">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} x {item.price} lei
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {item.quantity * item.price} lei
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">{totalPrice} lei</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Livrare</span>
                  <span className="text-success">Gratuită</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                  <span className="text-foreground">Total</span>
                  <span className="text-primary">{totalPrice} lei</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
