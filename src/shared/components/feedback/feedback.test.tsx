import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from './LoadingSpinner';
import { EmptyState } from './EmptyState';
import { ErrorMessage } from './ErrorMessage';

describe('LoadingSpinner', () => {
  it('renders loading spinner', () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
  });

  it('renders with custom text', () => {
    render(<LoadingSpinner text="Loading products..." />);
    expect(screen.getByText('Loading products...')).toBeInTheDocument();
  });
});

describe('EmptyState', () => {
  it('renders default empty state', () => {
    render(<EmptyState />);
    expect(screen.getByText('Không có dữ liệu')).toBeInTheDocument();
    expect(screen.getByText('Chưa có dữ liệu để hiển thị')).toBeInTheDocument();
  });

  it('renders with custom title and message', () => {
    render(<EmptyState title="No products" message="Add your first product" />);
    expect(screen.getByText('No products')).toBeInTheDocument();
    expect(screen.getByText('Add your first product')).toBeInTheDocument();
  });
});

describe('ErrorMessage', () => {
  it('renders error message', () => {
    render(<ErrorMessage message="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders with custom title', () => {
    render(<ErrorMessage title="Error occurred" message="Network error" />);
    expect(screen.getByText('Error occurred')).toBeInTheDocument();
    expect(screen.getByText('Network error')).toBeInTheDocument();
  });
});
