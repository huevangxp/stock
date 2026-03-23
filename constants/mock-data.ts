export interface StockData {
  id: string;
  name: string;
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  type: 'LAO' | 'FOREIGN';
  logo: string;
  history: number[];
}

export const STOCKS: StockData[] = [
  // Lao Stocks
  {
    id: '1',
    name: 'EDL-Generation Public Company',
    ticker: 'EDL-Gen',
    price: 4500,
    change: 50,
    changePercent: 1.12,
    type: 'LAO',
    logo: '⚡',
    history: [4400, 4420, 4450, 4480, 4460, 4500],
  },
  {
    id: '2',
    name: 'Banque Pour Le Commerce Exterieur Lao',
    ticker: 'BCEL',
    price: 6200,
    change: -100,
    changePercent: -1.59,
    type: 'LAO',
    logo: '🏦',
    history: [6350, 6300, 6250, 6280, 6220, 6200],
  },
  {
    id: '3',
    name: 'Lao World Public Company',
    ticker: 'LWTP',
    price: 2800,
    change: 20,
    changePercent: 0.72,
    type: 'LAO',
    logo: '🏗️',
    history: [2750, 2760, 2780, 2790, 2810, 2800],
  },
  {
    id: '4',
    name: 'Lao Agrotech Public Company',
    ticker: 'LAT',
    price: 1500,
    change: 0,
    changePercent: 0,
    type: 'LAO',
    logo: '🚜',
    history: [1500, 1500, 1510, 1500, 1500, 1500],
  },

  // Foreign Stocks
  {
    id: '5',
    name: 'Apple Inc.',
    ticker: 'AAPL',
    price: 189.43,
    change: 1.25,
    changePercent: 0.66,
    type: 'FOREIGN',
    logo: '🍎',
    history: [185, 186, 188, 187, 189, 189.43],
  },
  {
    id: '6',
    name: 'Tesla, Inc.',
    ticker: 'TSLA',
    price: 175.22,
    change: -5.43,
    changePercent: -3.01,
    type: 'FOREIGN',
    logo: '🚗',
    history: [185, 182, 180, 178, 176, 175.22],
  },
  {
    id: '7',
    name: 'NVIDIA Corporation',
    ticker: 'NVDA',
    price: 893.12,
    change: 15.67,
    changePercent: 1.79,
    type: 'FOREIGN',
    logo: '🎮',
    history: [850, 865, 875, 882, 888, 893.12],
  },
  {
    id: '8',
    name: 'Microsoft Corporation',
    ticker: 'MSFT',
    price: 425.22,
    change: 2.15,
    changePercent: 0.51,
    type: 'FOREIGN',
    logo: '💻',
    history: [420, 421, 423, 424, 422, 425.22],
  },
];
