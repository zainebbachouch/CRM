import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';


export function usePagination(apiEndpoint, limit = 10) {
    const [results, setResults] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchData = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            const response = await axios.get(apiEndpoint, {
                params: { page, limit },
                ...config
            });
            setResults(response.data.products);
            setTotal(response.data.total);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    }, [apiEndpoint, limit]);

    useEffect(() => {
        fetchData(currentPage);
    }, [fetchData, currentPage]);

    const nextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, Math.ceil(total / limit)));
    };

    const prevPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    return {
        results,
        loading,
        currentPage,
        totalPages: Math.ceil(total / limit),
        nextPage,
        prevPage,
    };
}
