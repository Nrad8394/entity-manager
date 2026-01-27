/**
 * Bulk Actions Component for Entity Manager
 * Handles multi-row operations
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Trash2, 
  Download, 
  Archive, 
  CheckCircle, 
  XCircle,
  MoreHorizontal,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

export interface BulkAction {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'destructive' | 'outline';
  requiresConfirmation?: boolean;
  confirmationTitle?: string;
  confirmationDescription?: string;
  onExecute: (selectedIds: string[]) => Promise<void>;
  permission?: string;
}

interface BulkActionsBarProps {
  selectedIds: string[];
  totalCount: number;
  actions: BulkAction[];
  onClearSelection: () => void;
}

export function BulkActionsBar({
  selectedIds,
  totalCount,
  actions,
  onClearSelection,
}: BulkActionsBarProps) {
  const [executing, setExecuting] = useState(false);
  const [confirmAction, setConfirmAction] = useState<BulkAction | null>(null);

  const handleExecute = async (action: BulkAction) => {
    if (action.requiresConfirmation) {
      setConfirmAction(action);
      return;
    }

    await executeAction(action);
  };

  const executeAction = async (action: BulkAction) => {
    setExecuting(true);
    try {
        await action.onExecute(selectedIds);
        toast.success( 'Success',{
          description: `${action.label} completed for ${selectedIds.length} item(s)`,
        });
        onClearSelection();
      } catch (error) {
        toast.error('Error', {
          description: `Failed to ${action.label.toLowerCase()}`
        });
        console.error(error);
    } finally {
      setExecuting(false);
      setConfirmAction(null);
    }
  };

  if (selectedIds.length === 0) return null;

  return (
    <>
      <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-lg px-4 py-3 mb-4">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={selectedIds.length === totalCount}
            onCheckedChange={onClearSelection}
          />
          <span className="text-sm font-medium">
            {selectedIds.length} of {totalCount} selected
          </span>
        </div>

        <div className="flex items-center gap-2">
          {actions.map((action) => {
            const Icon = action.icon || MoreHorizontal;
            return (
              <Button
                key={action.id}
                size="sm"
                variant={action.variant || 'outline'}
                onClick={() => handleExecute(action)}
                disabled={executing}
              >
                {executing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Icon className="h-4 w-4 mr-2" />
                )}
                {action.label}
              </Button>
            );
          })}
          
          <Button
            size="sm"
            variant="ghost"
            onClick={onClearSelection}
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.confirmationTitle || 'Are you sure?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.confirmationDescription ||
                `This will ${confirmAction?.label.toLowerCase()} ${selectedIds.length} item(s). This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmAction && executeAction(confirmAction)}
              className={
                confirmAction?.variant === 'destructive'
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  : ''
              }
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Common bulk action helpers
export const commonBulkActions = {
  delete: (onDelete: (ids: string[]) => Promise<void>): BulkAction => ({
    id: 'delete',
    label: 'Delete',
    icon: Trash2,
    variant: 'destructive',
    requiresConfirmation: true,
    confirmationTitle: 'Delete items?',
    confirmationDescription: 'This action cannot be undone.',
    onExecute: onDelete,
    permission: 'delete',
  }),

  archive: (onArchive: (ids: string[]) => Promise<void>): BulkAction => ({
    id: 'archive',
    label: 'Archive',
    icon: Archive,
    variant: 'outline',
    requiresConfirmation: true,
    onExecute: onArchive,
    permission: 'change',
  }),

  activate: (onActivate: (ids: string[]) => Promise<void>): BulkAction => ({
    id: 'activate',
    label: 'Activate',
    icon: CheckCircle,
    variant: 'outline',
    onExecute: onActivate,
    permission: 'change',
  }),

  deactivate: (onDeactivate: (ids: string[]) => Promise<void>): BulkAction => ({
    id: 'deactivate',
    label: 'Deactivate',
    icon: XCircle,
    variant: 'outline',
    onExecute: onDeactivate,
    permission: 'change',
  }),

  export: (onExport: (ids: string[]) => Promise<void>): BulkAction => ({
    id: 'export',
    label: 'Export',
    icon: Download,
    variant: 'outline',
    onExecute: onExport,
    permission: 'view',
  }),
};
