'use client';

import { useState, useEffect } from 'react';
import { graphqlClient } from '@/lib/graphql/client';
import { useAuth } from '@/context/AuthContext';

export function useGraphQLQuery<T = any>(query: string, variables?: any) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const refetch = async (newVariables?: any) => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await graphqlClient.request<T>(query, newVariables || variables);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('GraphQL request failed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      refetch();
    } else {
      setData(null);
      setLoading(false);
    }
  }, [user, query, JSON.stringify(variables)]);

  return { data, loading, error, refetch };
}

export function useGraphQLMutation<TData = any, TVariables = any>(mutation: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (variables: TVariables): Promise<TData | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await graphqlClient.request<TData>(mutation, variables);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('GraphQL mutation failed');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}
