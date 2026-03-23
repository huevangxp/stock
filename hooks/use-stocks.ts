import { useState, useEffect, useCallback } from 'react';
import { fetchLaoStocks, StockData } from '@/services/stockService';
import { STOCKS as MOCK_STOCKS } from '@/constants/mock-data';

export function useStocks() {
  const [laoStocks, setLaoStocks] = useState<StockData[]>([]);
  const [foreignStocks] = useState<StockData[]>(MOCK_STOCKS.filter(s => s.type === 'FOREIGN'));
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStocks = useCallback(async () => {
    try {
      const fetchedLao = await fetchLaoStocks();
      if (fetchedLao.length > 0) {
        setLaoStocks(fetchedLao);
      }
    } catch (e) {
      console.error('Failed to load stocks:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStocks();
    
    // Refresh every 30 seconds if app is active
    const interval = setInterval(loadStocks, 30000);
    return () => clearInterval(interval);
  }, [loadStocks]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadStocks();
  }, [loadStocks]);

  return {
    laoStocks,
    foreignStocks,
    loading,
    refreshing,
    onRefresh
  };
}
