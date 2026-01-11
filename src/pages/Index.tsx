import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';

interface Order {
  id: string;
  customerName: string;
  product: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  createdAt: Date;
  trackingNumber: string;
}

const statusConfig = {
  pending: { label: 'Ожидание', color: 'bg-yellow-500', icon: 'Clock' },
  processing: { label: 'Обработка', color: 'bg-blue-500', icon: 'Package' },
  shipped: { label: 'В пути', color: 'bg-purple-500', icon: 'Truck' },
  delivered: { label: 'Доставлен', color: 'bg-green-500', icon: 'CheckCircle' }
};

const Index = () => {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: '1',
      customerName: 'Александр Иванов',
      product: 'Беспроводные наушники',
      status: 'shipped',
      createdAt: new Date('2024-01-10'),
      trackingNumber: 'TN123456789'
    },
    {
      id: '2',
      customerName: 'Мария Петрова',
      product: 'Смарт-часы',
      status: 'processing',
      createdAt: new Date('2024-01-11'),
      trackingNumber: 'TN987654321'
    }
  ]);

  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  
  const [newOrder, setNewOrder] = useState({
    customerName: '',
    product: '',
    status: 'pending' as Order['status']
  });

  const handleCreateOrder = () => {
    if (!newOrder.customerName || !newOrder.product) {
      toast.error('Заполните все поля');
      return;
    }

    const order: Order = {
      id: String(orders.length + 1),
      ...newOrder,
      createdAt: new Date(),
      trackingNumber: `TN${Math.random().toString(36).substring(2, 11).toUpperCase()}`
    };

    setOrders([order, ...orders]);
    toast.success(`Заказ ${order.trackingNumber} создан!`, {
      description: `Клиент: ${order.customerName}`
    });
    
    setNewOrder({ customerName: '', product: '', status: 'pending' });
  };

  const handleTrackOrder = () => {
    const order = orders.find(o => o.trackingNumber === trackingNumber);
    if (order) {
      setTrackedOrder(order);
      toast.success('Заказ найден!');
    } else {
      toast.error('Заказ не найден', {
        description: 'Проверьте номер отслеживания'
      });
    }
  };

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    
    const order = orders.find(o => o.id === orderId);
    toast.success('Статус обновлен!', {
      description: `Заказ ${order?.trackingNumber} → ${statusConfig[newStatus].label}`
    });

    if (trackedOrder?.id === orderId) {
      setTrackedOrder({ ...trackedOrder, status: newStatus });
    }
  };

  const getStatusProgress = (status: Order['status']) => {
    const steps = ['pending', 'processing', 'shipped', 'delivered'];
    return ((steps.indexOf(status) + 1) / steps.length) * 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto p-6 space-y-8">
        <div className="text-center space-y-2 animate-fade-in">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            Система отслеживания заказов
          </h1>
          <p className="text-muted-foreground text-lg">Управляйте заказами в режиме реального времени</p>
        </div>

        <Tabs defaultValue="home" className="w-full animate-scale-in">
          <TabsList className="grid w-full grid-cols-5 h-auto p-1 bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="home" className="flex items-center gap-2">
              <Icon name="Home" size={18} />
              Главная
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Icon name="LayoutDashboard" size={18} />
              Админ-панель
            </TabsTrigger>
            <TabsTrigger value="track" className="flex items-center gap-2">
              <Icon name="Search" size={18} />
              Отслеживание
            </TabsTrigger>
            <TabsTrigger value="status" className="flex items-center gap-2">
              <Icon name="Settings" size={18} />
              Статусы
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Icon name="History" size={18} />
              История
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="space-y-6 mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
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

            <Card className="bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="TrendingUp" size={24} />
                  Последние заказы
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order, index) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-white rounded-lg hover:shadow-md transition-shadow animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full ${statusConfig[order.status].color} flex items-center justify-center text-white`}>
                          <Icon name={statusConfig[order.status].icon as any} size={24} />
                        </div>
                        <div>
                          <p className="font-semibold">{order.customerName}</p>
                          <p className="text-sm text-muted-foreground">{order.product}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-sm">
                        {order.trackingNumber}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admin" className="space-y-6 mt-6">
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
          </TabsContent>

          <TabsContent value="track" className="space-y-6 mt-6">
            <Card className="bg-white/70 backdrop-blur-sm animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Search" size={24} />
                  Отследить заказ
                </CardTitle>
                <CardDescription>Введите номер отслеживания для поиска заказа</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Например: TN123456789"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleTrackOrder()}
                  />
                  <Button onClick={handleTrackOrder} className="bg-gradient-to-r from-blue-600 to-purple-600">
                    <Icon name="Search" size={20} />
                  </Button>
                </div>

                {trackedOrder && (
                  <div className="space-y-6 mt-6 animate-scale-in">
                    <Separator />
                    
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold">{trackedOrder.customerName}</h3>
                      <p className="text-muted-foreground">{trackedOrder.product}</p>
                      <Badge variant="outline" className="text-base">
                        {trackedOrder.trackingNumber}
                      </Badge>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Прогресс доставки</span>
                        <span className="text-2xl font-bold text-purple-600">
                          {Math.round(getStatusProgress(trackedOrder.status))}%
                        </span>
                      </div>
                      
                      <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 transition-all duration-1000 animate-pulse-glow"
                          style={{ width: `${getStatusProgress(trackedOrder.status)}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      {Object.entries(statusConfig).map(([key, config], index) => {
                        const isActive = ['pending', 'processing', 'shipped', 'delivered'].indexOf(trackedOrder.status) >= index;
                        const isCurrent = trackedOrder.status === key;
                        
                        return (
                          <div key={key} className={`text-center space-y-2 ${isActive ? 'opacity-100' : 'opacity-30'}`}>
                            <div className={`mx-auto w-16 h-16 rounded-full ${isActive ? config.color : 'bg-gray-300'} flex items-center justify-center text-white ${isCurrent ? 'animate-pulse-glow scale-110' : ''} transition-all`}>
                              <Icon name={config.icon as any} size={28} />
                            </div>
                            <p className={`text-sm font-medium ${isCurrent ? 'text-purple-600 font-bold' : ''}`}>
                              {config.label}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <Icon name="Bell" size={24} className="text-purple-600 mt-1" />
                          <div>
                            <p className="font-semibold text-purple-900">Уведомления в реальном времени</p>
                            <p className="text-sm text-purple-700">
                              Вы будете получать уведомления при каждом изменении статуса заказа
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="status" className="space-y-6 mt-6">
            <Card className="bg-white/70 backdrop-blur-sm animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Settings" size={24} />
                  Управление статусами
                </CardTitle>
                <CardDescription>Обновите статус заказа</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.map((order) => (
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
                      <div className="flex gap-2">
                        {Object.entries(statusConfig).map(([key, config]) => (
                          <Button
                            key={key}
                            size="sm"
                            variant={order.status === key ? 'default' : 'outline'}
                            onClick={() => handleStatusChange(order.id, key as Order['status'])}
                            className={order.status === key ? `${config.color} text-white` : ''}
                          >
                            {config.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6 mt-6">
            <Card className="bg-white/70 backdrop-blur-sm animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="History" size={24} />
                  История заказов
                </CardTitle>
                <CardDescription>Все заказы в системе</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {orders.map((order, index) => (
                    <div 
                      key={order.id} 
                      className="p-4 bg-white rounded-lg border hover:shadow-md transition-all hover:scale-[1.02] animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
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
                              {order.createdAt.toLocaleDateString('ru-RU', { 
                                day: 'numeric', 
                                month: 'long', 
                                year: 'numeric' 
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
