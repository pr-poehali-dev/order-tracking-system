import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  pending: { label: 'Ожидание', color: 'bg-yellow-500', icon: 'Clock', description: 'Заказ принят и ожидает обработки' },
  processing: { label: 'Обработка', color: 'bg-blue-500', icon: 'Package', description: 'Заказ комплектуется на складе' },
  shipped: { label: 'В пути', color: 'bg-purple-500', icon: 'Truck', description: 'Заказ передан курьерской службе' },
  delivered: { label: 'Доставлен', color: 'bg-green-500', icon: 'CheckCircle', description: 'Заказ успешно доставлен' }
};

const API_URL = 'https://functions.poehali.dev/68b09150-5d57-42fc-b158-67287b1281dc';

const TrackOrder = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTrackOrder = async () => {
    if (!trackingNumber.trim()) {
      toast.error('Введите номер отслеживания');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?tracking_number=${trackingNumber}`);
      
      if (response.ok) {
        const order = await response.json();
        setTrackedOrder(order);
        toast.success('Заказ найден!');
      } else if (response.status === 404) {
        toast.error('Заказ не найден', {
          description: 'Проверьте номер отслеживания'
        });
        setTrackedOrder(null);
      } else {
        toast.error('Ошибка поиска заказа');
        setTrackedOrder(null);
      }
    } catch (error) {
      toast.error('Ошибка соединения с сервером');
      setTrackedOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusProgress = (status: Order['status']) => {
    const steps = ['pending', 'processing', 'shipped', 'delivered'];
    return ((steps.indexOf(status) + 1) / steps.length) * 100;
  };

  const getCurrentStatusIndex = (status: Order['status']) => {
    const steps = ['pending', 'processing', 'shipped', 'delivered'];
    return steps.indexOf(status);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Отслеживание заказа
            </h1>
            <p className="text-muted-foreground text-lg mt-2">Узнайте статус вашего заказа</p>
          </div>
          <Link to="/">
            <Button variant="outline" size="lg" className="gap-2">
              <Icon name="LayoutDashboard" size={20} />
              Админ-панель
            </Button>
          </Link>
        </div>

        <Card className="bg-white/70 backdrop-blur-sm animate-scale-in max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Icon name="Search" size={28} />
              Введите номер отслеживания
            </CardTitle>
            <CardDescription className="text-base">
              Номер отслеживания был отправлен на вашу электронную почту после оформления заказа
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-3">
              <Input
                placeholder="Например: TN123456789"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleTrackOrder()}
                className="text-lg h-14"
                disabled={loading}
              />
              <Button 
                onClick={handleTrackOrder} 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-14 px-8"
                disabled={loading}
              >
                {loading ? (
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>
                    <Icon name="Search" size={22} className="mr-2" />
                    Отследить
                  </>
                )}
              </Button>
            </div>

            {trackedOrder && (
              <div className="space-y-8 mt-8 animate-fade-in">
                <Separator />
                
                <div className="space-y-3 text-center">
                  <h2 className="text-3xl font-bold">{trackedOrder.customerName}</h2>
                  <p className="text-lg text-muted-foreground">{trackedOrder.product}</p>
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    {trackedOrder.trackingNumber}
                  </Badge>
                </div>

                <div className="space-y-6 bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-semibold">Прогресс доставки</span>
                    <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {Math.round(getStatusProgress(trackedOrder.status))}%
                    </span>
                  </div>
                  
                  <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 transition-all duration-1000 animate-pulse-glow"
                      style={{ width: `${getStatusProgress(trackedOrder.status)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {Object.entries(statusConfig).map(([key, config], index) => {
                    const currentIndex = getCurrentStatusIndex(trackedOrder.status);
                    const isCompleted = index < currentIndex;
                    const isCurrent = trackedOrder.status === key;
                    const isActive = index <= currentIndex;
                    
                    return (
                      <div 
                        key={key} 
                        className={`relative text-center space-y-3 transition-all duration-500 ${
                          isActive ? 'opacity-100 scale-100' : 'opacity-40 scale-95'
                        }`}
                      >
                        <div className="relative">
                          <div className={`mx-auto w-20 h-20 rounded-full ${
                            isActive ? config.color : 'bg-gray-300'
                          } flex items-center justify-center text-white shadow-lg ${
                            isCurrent ? 'animate-pulse-glow scale-110' : ''
                          } transition-all duration-500`}>
                            <Icon name={config.icon as any} size={32} />
                          </div>
                          {isCompleted && (
                            <div className="absolute -top-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-4 border-white animate-scale-in">
                              <Icon name="Check" size={16} className="text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className={`text-base font-semibold ${
                            isCurrent ? 'text-purple-600 text-lg' : isActive ? 'text-gray-900' : 'text-gray-400'
                          }`}>
                            {config.label}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {config.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Icon name="Bell" size={24} className="text-white" />
                      </div>
                      <div className="space-y-2">
                        <p className="font-bold text-lg text-purple-900">Уведомления в реальном времени</p>
                        <p className="text-sm text-purple-700">
                          Мы отправим вам уведомление на email при каждом изменении статуса заказа. 
                          Вы также можете вернуться на эту страницу в любое время для проверки статуса.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-2">
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Дата создания</p>
                        <p className="font-semibold">
                          {new Date(trackedOrder.createdAt).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Последнее обновление</p>
                        <p className="font-semibold">
                          {new Date(trackedOrder.updatedAt).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {!trackedOrder && !loading && (
              <div className="text-center py-12 animate-fade-in">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="Package" size={48} className="text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Введите номер отслеживания</h3>
                <p className="text-muted-foreground">
                  Чтобы узнать статус заказа, введите номер отслеживания выше
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TrackOrder;
