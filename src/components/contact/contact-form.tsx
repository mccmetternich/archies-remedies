'use client';

import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SuccessState } from '@/components/ui/success-state';

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="py-8">
        <SuccessState
          title="Message Sent!"
          message="Thank you for reaching out. We'll get back to you as soon as possible."
          onReset={() => setStatus('idle')}
          resetText="Send another message"
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Name *
          </label>
          <Input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your name"
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email *
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your@email.com"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium mb-2">
          Subject
        </label>
        <Input
          id="subject"
          name="subject"
          type="text"
          value={formData.subject}
          onChange={handleChange}
          placeholder="What's this about?"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-2">
          Message *
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="How can we help you?"
          required
          rows={6}
          className="flex w-full rounded-lg border-[1.5px] border-[var(--border)] bg-[var(--background)] px-4 py-3 text-base transition-all duration-150 ease-out placeholder:text-[var(--muted-foreground)] hover:border-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary-dark)] focus:ring-[3px] focus:ring-[var(--primary-light)] resize-none"
        />
      </div>

      {status === 'error' && (
        <div className="bg-red-50 text-red-600 rounded-lg p-4 text-sm">
          Something went wrong. Please try again or email us directly.
        </div>
      )}

      <Button type="submit" size="lg" className="w-full" loading={status === 'loading'}>
        <Send className="w-4 h-4" />
        Send Message
      </Button>

      <p className="text-xs text-center text-[var(--muted-foreground)]">
        We typically respond within 24-48 hours.
      </p>
    </form>
  );
}
