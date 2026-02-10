import { useState, useMemo } from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Package, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { type Product } from '@/hooks/useProducts';

interface ProductSearchDropdownProps {
  products: Product[];
  onSelect: (product: Product) => void;
  placeholder?: string;
  className?: string;
}

export function ProductSearchDropdown({
  products,
  onSelect,
  placeholder = 'Tìm hàng hóa (F3)',
  className,
}: ProductSearchDropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Filter products
  const filteredProducts = useMemo(() => {
    if (!search) return products.slice(0, 20);

    const searchLower = search.toLowerCase();
    return products
      .filter(
        (p) =>
          p.code.toLowerCase().includes(searchLower) ||
          p.name.toLowerCase().includes(searchLower) ||
          p.barcode?.toLowerCase().includes(searchLower)
      )
      .slice(0, 20);
  }, [products, search]);

  const handleSelect = (product: Product) => {
    onSelect(product);
    setSearch('');
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className={`relative ${className}`}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={placeholder}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (!open) setOpen(true);
            }}
            onClick={() => setOpen(true)}
            className="pl-9"
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[500px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Tìm theo mã, tên hoặc barcode..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList className="max-h-[400px]">
            <CommandEmpty>
              <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
                <Package className="h-10 w-10 opacity-50" />
                <p>Không tìm thấy sản phẩm</p>
              </div>
            </CommandEmpty>
            <CommandGroup>
              {filteredProducts.map((product) => {
                const stockQty = product.stock_qty ?? product.stock ?? 0;
                const isOutOfStock = stockQty <= 0;

                return (
                  <CommandItem
                    key={product.id}
                    onSelect={() => handleSelect(product)}
                    className={`flex gap-3 py-3 cursor-pointer ${isOutOfStock ? 'opacity-60' : ''}`}
                    disabled={isOutOfStock}
                  >
                    {/* Image */}
                    <div className="w-12 h-12 rounded bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{product.name}</span>
                        {isOutOfStock && (
                          <Badge variant="destructive" className="text-xs">
                            Hết hàng
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-mono">{product.code}</span>
                        <span>•</span>
                        <span>{product.unit}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs">
                        <span
                          className={`font-medium ${stockQty > 0 ? 'text-green-600' : 'text-red-600'}`}
                        >
                          Tồn: {stockQty}
                        </span>
                        <span className="text-muted-foreground">|</span>
                        <span>Đặt NCC: 0</span>
                        <span className="text-muted-foreground">|</span>
                        <span>KH đặt: 0</span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right flex-shrink-0">
                      <div className="font-semibold text-primary">
                        {formatCurrency(product.sale_price_default)}
                      </div>
                      {product.cost_price > 0 && (
                        <div className="text-xs text-muted-foreground">
                          Vốn: {formatCurrency(product.cost_price)}
                        </div>
                      )}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
