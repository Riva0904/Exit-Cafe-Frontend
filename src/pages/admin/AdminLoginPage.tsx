import { useNavigate } from 'react-router-dom';
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

const staffRoles = new Set(['SuperAdmin', 'Admin', 'Manager', 'Staff']);

export function AdminLoginPage() {
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
      if (!staffRoles.has(data.role)) {
        toast.error('This account does not have admin access.');
        return;
      }
      dispatch(setCredentials(data));
      navigate('/admin');
    },
    onError: (err) => {
      const message = isAxiosError(err) ? err.response?.data?.message : null;
      toast.error(message ?? 'Invalid email or password.');
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-ink-900/50 p-8">
        <h1 className="font-display text-center text-2xl font-bold text-gradient-gold">Exit Caff Admin</h1>
        <p className="mt-2 text-center text-sm text-cream-200/60">Sign in to the admin portal</p>

        <form onSubmit={handleSubmit((v) => login.mutate(v))} className="mt-8 space-y-4">
          <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
          <Input label="Password" type="password" {...register('password')} error={errors.password?.message} />
          <Button type="submit" className="w-full" isLoading={login.isPending}>
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}
