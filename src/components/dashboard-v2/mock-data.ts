export interface StatCardData {
  title: string;
  value: string;
  trend: number;
  trendLabel: string;
  icon: 'dollarSign' | 'users' | 'shoppingBag' | 'refreshCw';
  iconBgColor: string;
  iconColor: string;
}

export const statCards: StatCardData[] = [
  {
    title: 'Total Sales',
    value: '$986,829.98',
    trend: 8,
    trendLabel: 'from last month',
    icon: 'dollarSign',
    iconBgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    title: 'Total Visitor',
    value: '879,940',
    trend: -6,
    trendLabel: 'from last month',
    icon: 'users',
    iconBgColor: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
  {
    title: 'Total Order',
    value: '1,987,929',
    trend: 2.5,
    trendLabel: 'from last month',
    icon: 'shoppingBag',
    iconBgColor: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
  {
    title: 'Refunded',
    value: '35,938',
    trend: 5,
    trendLabel: 'from last month',
    icon: 'refreshCw',
    iconBgColor: 'bg-rose-100',
    iconColor: 'text-rose-600',
  },
];

export interface SalesOvertimeDataPoint {
  name: string;
  sales: number;
  revenue: number;
  profit: number;
}

export const salesOvertimeData: Record<string, SalesOvertimeDataPoint[]> = {
  weekly: [
    { name: 'Mon', sales: 4200, revenue: 3800, profit: 2400 },
    { name: 'Tue', sales: 3800, revenue: 4200, profit: 2800 },
    { name: 'Wed', sales: 5100, revenue: 4600, profit: 3200 },
    { name: 'Thu', sales: 4700, revenue: 4100, profit: 2900 },
    { name: 'Fri', sales: 5800, revenue: 5200, profit: 3800 },
    { name: 'Sat', sales: 6200, revenue: 5600, profit: 4100 },
    { name: 'Sun', sales: 3500, revenue: 3100, profit: 2100 },
  ],
  monthly: [
    { name: 'Jan', sales: 18000, revenue: 15000, profit: 8000 },
    { name: 'Feb', sales: 22000, revenue: 18500, profit: 10200 },
    { name: 'Mar', sales: 19500, revenue: 16800, profit: 9100 },
    { name: 'Apr', sales: 25000, revenue: 21000, profit: 12500 },
    { name: 'May', sales: 23000, revenue: 19200, profit: 11000 },
    { name: 'Jun', sales: 28000, revenue: 24500, profit: 14800 },
    { name: 'Jul', sales: 26500, revenue: 22800, profit: 13500 },
    { name: 'Aug', sales: 24000, revenue: 20100, profit: 11800 },
    { name: 'Sep', sales: 30000, revenue: 26000, profit: 16200 },
    { name: 'Oct', sales: 32000, revenue: 28500, profit: 18000 },
    { name: 'Nov', sales: 29000, revenue: 25000, profit: 15500 },
    { name: 'Dec', sales: 35000, revenue: 31000, profit: 20000 },
  ],
  yearly: [
    { name: '2020', sales: 180000, revenue: 150000, profit: 80000 },
    { name: '2021', sales: 220000, revenue: 185000, profit: 102000 },
    { name: '2022', sales: 280000, revenue: 240000, profit: 145000 },
    { name: '2023', sales: 310000, revenue: 270000, profit: 168000 },
    { name: '2024', sales: 350000, revenue: 305000, profit: 195000 },
    { name: '2025', sales: 390000, revenue: 340000, profit: 220000 },
  ],
};

export interface RealTimeSaleDataPoint {
  name: string;
  sales: number;
}

export const realTimeSaleData: RealTimeSaleDataPoint[] = [
  { name: '8am', sales: 1200 },
  { name: '9am', sales: 2100 },
  { name: '10am', sales: 1800 },
  { name: '11am', sales: 3200 },
  { name: '12pm', sales: 2800 },
  { name: '1pm', sales: 2400 },
  { name: '2pm', sales: 3600 },
  { name: '3pm', sales: 3100 },
  { name: '4pm', sales: 2700 },
  { name: '5pm', sales: 1900 },
];
