import { Link, useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';
import { authApi } from '@/api/auth';
import { useAppDispatch } from '@/app/hooks';
import { setCredentials } from '@/features/auth/authSlice';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const login = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      dispatch(setCredentials(data));
      toast.success(`Welcome back, ${data.firstName}!`);
      navigate('/');
    },
    onError: (err) => {
      const message = isAxiosError(err) ? err.response?.data?.message : null;
      toast.error(message ?? 'Invalid email or password.');
    },
  });

  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-20 sm:px-6">
      <h1 className="font-display text-center text-3xl font-bold text-cream-100">Sign In</h1>
      <p className="mt-2 text-center text-cream-200/60">Welcome back to Exit Caff</p>

      <form onSubmit={handleSubmit((v) => login.mutate(v))} className="mt-8 space-y-4">
        <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
        <Input label="Password" type="password" {...register('password')} error={errors.password?.message} />
        <Button type="submit" className="w-full" isLoading={login.isPending}>
          Sign In
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-cream-200/60">
        Don't have an account?{' '}
        <Link to="/register" className="font-medium text-gold-400 hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
