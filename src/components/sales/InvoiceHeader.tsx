/**
 * Invoice Header Component
 * Top navigation bar with back button and product search
 */

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Grid2X2 } from 'lucide-react';

interface InvoiceHeaderProps {
  onBack: () => void;
  onProductSearch?: () => void;
  onGridView?: () => void;
}

export function InvoiceHeader({ 
  onBack, 
  onProductSearch,
  onGridView 
}: InvoiceHeaderProps) {
  return (
    <div className="border-b bg-card px-4 py-3 flex items-center gap-4">
      {/* Back button */}
      <Button variant="ghost" size="icon" onClick={onBack}>
        <ArrowLeft className="w-5 h-5" />
      </Button>

      <h1 className="text-lg font-semibold">Bán hàng</h1>

      {/* Search hint */}
      <div className="flex-1 flex items-center gap-2 text-sm text-muted-foreground">
        <Search className="w-4 h-4" />
        <span>Nhấn F3 để tìm sản phẩm</span>
      </div>

      {/* Grid view toggle */}
      {onGridView && (
        <Button variant="outline" size="icon" onClick={onGridView}>
          <Grid2X2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
