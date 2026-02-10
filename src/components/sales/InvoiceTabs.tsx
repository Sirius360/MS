/**
 * Invoice Tabs Component
 * Multi-tab interface for managing multiple invoices simultaneously
 */

import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, X } from 'lucide-react';
import type { InvoiceTab } from '@/hooks/useInvoiceState';
import { cn } from '@/lib/utils';

interface InvoiceTabsProps {
  tabs: InvoiceTab[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onAddTab: () => void;
}

export function InvoiceTabs({
  tabs,
  activeTabId,
  onTabChange,
  onTabClose,
  onAddTab,
}: InvoiceTabsProps) {
  return (
    <div className="border-b bg-muted/30 px-4">
      <div className="flex items-center gap-1 py-2">
        {/* Tab list */}
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-t-lg border-b-2 cursor-pointer transition-colors',
              activeTabId === tab.id
                ? 'bg-background border-primary text-foreground'
                : 'bg-transparent border-transparent text-muted-foreground hover:bg-background/50'
            )}
            onClick={() => onTabChange(tab.id)}
          >
            <span className="text-sm font-medium">{tab.name}</span>
            
            {/* Item count badge */}
            {tab.items.length > 0 && (
              <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                {tab.items.length}
              </span>
            )}

            {/* Close button */}
            {tabs.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-destructive/10"
                onClick={(e) => {
                  e.stopPropagation();
                  onTabClose(tab.id);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        ))}

        {/* Add tab button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onAddTab}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
