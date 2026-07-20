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
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Enter a valid email'),
  phoneNumber: z.string().optional(),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Needs an uppercase letter')
    .regex(/[a-z]/, 'Needs a lowercase letter')
    .regex(/[0-9]/, 'Needs a digit'),
});

type FormValues = z.infer<typeof schema>;

export function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const registerUser = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      dispatch(setCredentials(data));
      toast.success('Account created!');
      navigate('/');
    },
    onError: (err) => {
      const message = isAxiosError(err) ? err.response?.data?.message : null;
      toast.error(message ?? 'Could not create account.');
    },
  });

  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-20 sm:px-6">
      <h1 className="font-display text-center text-3xl font-bold text-cream-100">Create Account</h1>
      <p className="mt-2 text-center text-cream-200/60">Join Exit Caff for faster checkout &amp; order history</p>

      <form onSubmit={handleSubmit((v) => registerUser.mutate(v))} className="mt-8 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="First name" {...register('firstName')} error={errors.firstName?.message} />
          <Input label="Last name" {...register('lastName')} error={errors.lastName?.message} />
        </div>
        <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
        <Input label="Phone (optional)" {...register('phoneNumber')} error={errors.phoneNumber?.message} />
        <Input label="Password" type="password" {...register('password')} error={errors.password?.message} />
        <Button type="submit" className="w-full" isLoading={registerUser.isPending}>
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-cream-200/60">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-gold-400 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
