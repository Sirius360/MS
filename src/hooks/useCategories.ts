import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/apiClient';

export type Category = {
  id: string;
  code: string | null;
  name: string;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.categories.getAll();
      // Backend returns {data: [...]} so extract the data array
      return (response?.data || response || []) as Category[];
    },
  });
}

export function useCategoryById(id: string) {
  return useQuery({
    queryKey: ['categories', id],
    queryFn: async () => {
      const data = await api.categories.getById(id);
      return data as Category;
    },
    enabled: !!id,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; description?: string; status?: string }) => {
      return await api.categories.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      name?: string;
      description?: string;
      status?: string;
    }) => {
      return await api.categories.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.categories.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}
