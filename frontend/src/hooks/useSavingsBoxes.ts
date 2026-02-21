import { useState, useEffect, useCallback } from 'react';
import { savingsBoxService } from '@/services/savings-box.service';
import { SavingsBox } from '@/types';

export function useSavingsBoxes() {
  const [savingsBoxes, setSavingsBoxes] = useState<SavingsBox[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSavingsBoxes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await savingsBoxService.getAll();
      setSavingsBoxes(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar caixas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSavingsBoxes();
  }, [fetchSavingsBoxes]);

  return { savingsBoxes, loading, error, refetch: fetchSavingsBoxes };
}
