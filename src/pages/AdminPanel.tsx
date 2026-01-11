import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';
import { Link } from 'react-router-dom';

interface Order {
  id: number;
  trackingNumber: string;
  customerName: string;
  product: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  createdAt: string;
  updatedAt: string;
}

const statusConfig = {
  pending: { label: 'Ожидание', color: 'bg-yellow-500', icon: 'Clock' },
  processing: { label: 'Обработка', color: 'bg-blue-500', icon: 'Package' },
  shipped: { label: 'В пути', color: 'bg-purple-500', icon: 'Truck' },
  delivered: { label: 'Доставлен', color: 'bg-green-500', icon: 'CheckCircle' }
};

const API_URL = 'https://functions.poehali.dev/68b09150-5d57-42fc-b158-67287b1281dc';

const AdminPanel = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [newOrder, setNewOrder] = useState({
    customerName: '',
    product: '',
    status: 'pending' as Order['status']
  });

  const fetchOrders = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      toast.error('Ошибка загрузки заказов');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCreateOrder = async () => {
    if (!newOrder.customerName || !newOrder.product) {
      toast.error('Заполните все поля');
      return;
    }

    const trackingNumber = `TN${Math.random().toString(36).substring(2, 11).toUpperCase()}`;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: newOrder.customerName,
          product: newOrder.product,
          status: newOrder.status,
          trackingNumber
        })
      });

      if (response.ok) {
        const createdOrder = await response.json();
        setOrders([createdOrder, ...orders]);
        toast.success(`Заказ ${trackingNumber} создан!`, {
          description: `Клиент: ${newOrder.customerName}`
        });
        setNewOrder({ customerName: '', product: '', status: 'pending' });
      } else {
        toast.error('Ошибка создания заказа');
      }
    } catch (error) {
      toast.error('Ошибка соединения с сервером');
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: Order['status']) => {
    try {
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus })
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        setOrders(orders.map(order => 
          order.id === orderId ? updatedOrder : order
        ));
        
        toast.success('Статус обновлен!', {
          description: `Заказ ${updatedOrder.trackingNumber} → ${statusConfig[newStatus].label}`
        });
      } else {
        toast.error('Ошибка обновления статуса');
      }
    } catch (error) {
      toast.error('Ошибка соединения с сервером');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-lg text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Админ-панель
            </h1>
            <p className="text-muted-foreground text-lg mt-2">Управление заказами</p>
          </div>
          <Link to="/track">
            <Button variant="outline" size="lg" className="gap-2">
              <Icon name="Search" size={20} />
              Отследить заказ
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 animate-scale-in">
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 hover:scale-105 transition-transform">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Package" size={24} />
                Всего заказов
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{orders.length}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 hover:scale-105 transition-transform">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Clock" size={24} />
                В обработке
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">
                {orders.filter(o => o.status === 'processing').length}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white border-0 hover:scale-105 transition-transform">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Truck" size={24} />
                В пути
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">
                {orders.filter(o => o.status === 'shipped').length}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 hover:scale-105 transition-transform">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="CheckCircle" size={24} />
                Доставлено
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">
                {orders.filter(o => o.status === 'delivered').length}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="bg-white/70 backdrop-blur-sm animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Plus" size={24} />
                Создать новый заказ
              </CardTitle>
              <CardDescription>Добавьте информацию о новом заказе</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Имя клиента</Label>
                <Input
                  id="customerName"
                  placeholder="Введите имя клиента"
                  value={newOrder.customerName}
                  onChange={(e) => setNewOrder({ ...newOrder, customerName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product">Товар</Label>
                <Input
                  id="product"
                  placeholder="Название товара"
                  value={newOrder.product}
                  onChange={(e) => setNewOrder({ ...newOrder, product: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Статус</Label>
                <Select
                  value={newOrder.status}
                  onValueChange={(value) => setNewOrder({ ...newOrder, status: value as Order['status'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Ожидание</SelectItem>
                    <SelectItem value="processing">Обработка</SelectItem>
                    <SelectItem value="shipped">В пути</SelectItem>
                    <SelectItem value="delivered">Доставлен</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleCreateOrder}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                size="lg"
              >
                <Icon name="Plus" className="mr-2" size={20} />
                Создать заказ
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Settings" size={24} />
                Управление статусами
              </CardTitle>
              <CardDescription>Обновите статус заказа</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[500px] overflow-y-auto">
              {orders.slice(0, 3).map((order) => (
                <div key={order.id} className="p-4 bg-white rounded-lg border hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold">{order.customerName}</p>
                      <p className="text-sm text-muted-foreground">{order.product}</p>
                      <Badge variant="outline" className="mt-1">
                        {order.trackingNumber}
                      </Badge>
                    </div>
                    <div className={`w-12 h-12 rounded-full ${statusConfig[order.status].color} flex items-center justify-center text-white`}>
                      <Icon name={statusConfig[order.status].icon as any} size={24} />
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <Button
                        key={key}
                        size="sm"
                        variant={order.status === key ? 'default' : 'outline'}
                        onClick={() => handleStatusChange(order.id, key as Order['status'])}
                        className={order.status === key ? `${config.color} text-white hover:opacity-90` : ''}
                      >
                        {config.label}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/70 backdrop-blur-sm animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="History" size={24} />
              История всех заказов
            </CardTitle>
            <CardDescription>Все заказы в системе</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {orders.map((order, index) => (
                <div 
                  key={order.id} 
                  className="p-4 bg-white rounded-lg border hover:shadow-md transition-all hover:scale-[1.01] animate-fade-in"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full ${statusConfig[order.status].color} flex items-center justify-center text-white`}>
                        <Icon name={statusConfig[order.status].icon as any} size={20} />
                      </div>
                      <div>
                        <p className="font-semibold">{order.customerName}</p>
                        <p className="text-sm text-muted-foreground">{order.product}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(order.createdAt).toLocaleDateString('ru-RU', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <Badge className={`${statusConfig[order.status].color} text-white`}>
                        {statusConfig[order.status].label}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {order.trackingNumber}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;
