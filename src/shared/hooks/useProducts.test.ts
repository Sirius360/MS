import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useProducts, useCreateProduct } from '@/shared/hooks/useProducts';
import { createQueryWrapper } from '@/test/test-utils';

describe('useProducts', () => {
  it('should fetch products successfully', async () => {
    const { result } = renderHook(() => useProducts(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeDefined();
    expect(Array.isArray(result.current.data)).toBe(true);
  });

  it('should handle loading state', () => {
    const { result } = renderHook(() => useProducts(), {
      wrapper: createQueryWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });
});

describe('useCreateProduct', () => {
  it('should return mutation function', () => {
    const { result } = renderHook(() => useCreateProduct(), {
      wrapper: createQueryWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
    expect(result.current.mutateAsync).toBeDefined();
  });
});
