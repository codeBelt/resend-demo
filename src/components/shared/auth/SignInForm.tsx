'use client';

import { useState } from 'react';
import { useAuthActions } from '@convex-dev/auth/react';
import { Card, CardBody, CardHeader, Input, Button } from '@heroui/react';

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<'signIn' | 'signUp'>('signIn');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    formData.set('flow', flow);

    void signIn('password', formData)
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'An error occurred');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <Card className="w-full max-w-md border border-slate-200 dark:border-slate-700">
      <CardHeader className="flex flex-col gap-1 pb-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          📧 Email Manager
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {flow === 'signIn' ? 'Sign in to your account' : 'Create a new account'}
        </p>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              You must use a verified domain for your email to send correctly
            </p>
            <Input
              type="email"
              name="email"
              label="Email"
              placeholder="email@your-verified-domain.com"
              isRequired
              className="mb-4"
            />
            <Input
              type="text"
              name="name"
              label="Name"
              placeholder="Your Name"
              isRequired
              className="mb-4"
            />
            <Input
              type="password"
              name="password"
              label="Password"
              placeholder="Enter your password"
              isRequired
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            color="primary"
            className="w-full"
            isLoading={isLoading}
          >
            {flow === 'signIn' ? 'Sign In' : 'Sign Up'}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setFlow(flow === 'signIn' ? 'signUp' : 'signIn');
                setError(null);
              }}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              {flow === 'signIn'
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}

