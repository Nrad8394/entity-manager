/**
 * Inline Edit Component for Entity Manager
 * Allows direct editing within tables
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InlineEditProps {
  value: any;
  field: {
    name: string;
    type: 'text' | 'number' | 'email' | 'select' | 'date';
    options?: { value: string; label: string }[];
  };
  onSave: (value: any) => Promise<void>;
  onCancel: () => void;
  className?: string;
}

export function InlineEdit({
  value: initialValue,
  field,
  onSave,
  onCancel,
  className,
}: InlineEditProps) {
  const [value, setValue] = useState(initialValue);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleSave = async () => {
    if (value === initialValue) {
      onCancel();
      return;
    }

    setSaving(true);
    try {
      await onSave(value);
    } catch (error) {
      console.error('Inline edit save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {field.type === 'select' && field.options ? (
        <Select value={value} onValueChange={setValue}>
          <SelectTrigger className="h-8 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          type={field.type}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-8"
          autoFocus
          disabled={saving}
        />
      )}
      
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={handleSave}
          disabled={saving}
        >
          <Check className="h-4 w-4 text-green-600" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={onCancel}
          disabled={saving}
        >
          <X className="h-4 w-4 text-red-600" />
        </Button>
      </div>
    </div>
  );
}

interface InlineEditCellProps {
  value: any;
  rowId: string;
  field: InlineEditProps['field'];
  onUpdate: (rowId: string, fieldName: string, value: any) => Promise<void>;
  permission?: string;
  canEdit?: boolean;
}

export function InlineEditCell({
  value,
  rowId,
  field,
  onUpdate,
  permission,
  canEdit = true,
}: InlineEditCellProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async (newValue: any) => {
    await onUpdate(rowId, field.name, newValue);
    setIsEditing(false);
  };

  if (!canEdit) {
    return <span>{value}</span>;
  }

  if (isEditing) {
    return (
      <InlineEdit
        value={value}
        field={field}
        onSave={handleSave}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div
      className="cursor-pointer hover:bg-muted/50 rounded px-2 py-1 -mx-2 -my-1"
      onClick={() => setIsEditing(true)}
    >
      {value || <span className="text-muted-foreground italic">Click to edit</span>}
    </div>
  );
}
