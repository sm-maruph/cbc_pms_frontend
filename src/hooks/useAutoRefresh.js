import { useEffect, useState, useCallback } from 'react';

export function useAutoRefresh(fetchFunction, interval = 10000, dependencies = []) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const result = await fetchFunction();
            setData(result);
            setError(null);
        } catch (err) {
            console.error('Auto-refresh error:', err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [fetchFunction]);

    useEffect(() => {
        fetchData();
        
        const intervalId = setInterval(() => {
            fetchData();
        }, interval);
        
        return () => clearInterval(intervalId);
    }, [fetchData, ...dependencies]);

    return { data, loading, error, refetch: fetchData };
}