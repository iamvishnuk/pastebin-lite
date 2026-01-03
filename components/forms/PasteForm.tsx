'use client';

import { PasteSchema } from '@/validator';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import z from 'zod';
import { FieldGroup, Field, FieldLabel, FieldError } from '../ui/field';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Clock, Eye } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '../ui/select';
import { TTL } from '@/lib/constants';
import { Button } from '../ui/button';
import { useState } from 'react';
import Link from 'next/link';

const PasteForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successUrl, setSuccessUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const form = useForm<z.infer<typeof PasteSchema>>({
    resolver: zodResolver(PasteSchema),
    defaultValues: {
      content: '',
      ttl: 'none',
      maxViews: undefined
    }
  });

  const onSubmit = async (data: z.infer<typeof PasteSchema>) => {
    try {
      setLoading(true);
      setError(null);
      setSuccessUrl(null);

      // Parse ttl value
      const ttlValue = data.ttl === 'none' ? null : parseInt(data.ttl);

      const requestBody = {
        content: data.content,
        ...(ttlValue && { ttl_seconds: ttlValue }),
        ...(data.maxViews && { max_views: data.maxViews })
      };

      const response = await fetch('/api/pastes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create paste');
        return;
      }

      const result = await response.json();
      setSuccessUrl(result.url);
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (successUrl) {
    return (
      <div className='mt-16 rounded-lg border border-green-600 bg-green-50 p-6'>
        <h2 className='mb-4 text-lg font-semibold text-green-900'>
          Paste Created Successfully!
        </h2>
        <p className='mb-4 text-green-800'>Share this link:</p>
        <div className='mb-6 rounded bg-white p-3 font-mono text-sm break-all text-green-900'>
          {successUrl}
        </div>
        <div className='flex gap-3'>
          <Button
            onClick={() => {
              navigator.clipboard.writeText(successUrl);
              setCopied(true);
              setTimeout(() => setCopied(false), 5000);
            }}
          >
            {copied ? 'Copied!' : 'Copy Link'}
          </Button>
          <Link href={successUrl}>
            <Button variant='outline'>View Paste</Button>
          </Link>
          <Button
            variant='outline'
            onClick={() => {
              setSuccessUrl(null);
              form.reset();
            }}
          >
            Create Another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='mt-8'>
      {error && (
        <div className='mb-4 rounded-lg border border-red-600 bg-red-50 p-4'>
          <p className='text-red-900'>{error}</p>
        </div>
      )}
      <form
        id='paste-form'
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FieldGroup>
          <Controller
            name='content'
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Paste Content</FieldLabel>
                <Textarea
                  {...field}
                  aria-invalid={fieldState.invalid}
                  rows={15}
                  placeholder='Paste your content here...'
                  className='h-56'
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <div className='flex items-center gap-2'>
            <Controller
              name='ttl'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>
                    <Clock className='inline h-3 w-3' />
                    Time to live
                  </FieldLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ''}
                  >
                    <SelectTrigger aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder='Select Time to Live' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {TTL.map((option, index) => (
                          <SelectItem
                            key={index}
                            value={String(option.value ?? 'none')}
                          >
                            <SelectLabel>{option.label}</SelectLabel>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
            <Controller
              name='maxViews'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>
                    <Eye className='inline h-3 w-3' />
                    Max views
                  </FieldLabel>
                  <Input
                    type='number'
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === '' ? undefined : Number(value));
                    }}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
        </FieldGroup>
      </form>
      <Field className='mt-8'>
        <Button
          type='submit'
          form='paste-form'
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Paste'}
        </Button>
      </Field>
    </div>
  );
};

export default PasteForm;
