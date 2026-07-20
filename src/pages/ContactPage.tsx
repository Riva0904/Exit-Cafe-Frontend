import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiClock, FiMail, FiMapPin, FiPhone } from 'react-icons/fi';
import { contactApi } from '@/api/contact';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Tell us a bit more (10+ characters)'),
});

type FormValues = z.infer<typeof schema>;

const contactDetails = [
  { icon: FiMapPin, label: 'Visit Us', value: 'TMJ Complex, Azhagiyamandapam' },
  { icon: FiPhone, label: 'Call Us', value: '+91 00000 00000' },
  { icon: FiMail, label: 'Email Us', value: 'hello@exitcaff.com' },
  { icon: FiClock, label: 'Hours', value: 'Every day, 9:00 AM – 11:00 PM' },
];

export function ContactPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const submit = useMutation({
    mutationFn: contactApi.create,
    onSuccess: () => {
      toast.success("Message sent — we'll get back to you soon!");
      reset();
    },
    onError: () => toast.error('Could not send your message. Please try again.'),
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-500">Get in Touch</p>
        <h1 className="font-display mt-2 text-4xl font-bold text-cream-100">Contact Us</h1>
        <p className="mx-auto mt-3 max-w-xl text-cream-200/60">
          Questions, feedback, catering enquiries or just want to say hi — we'd love to hear from you.
        </p>
      </motion.div>

      <div className="mt-12 grid gap-10 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="space-y-5">
            {contactDetails.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-4 rounded-xl border border-white/10 bg-ink-900/40 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-500/10 text-gold-400">
                  <Icon size={16} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-cream-200/50">{label}</p>
                  <p className="mt-0.5 text-sm text-cream-100">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 aspect-video overflow-hidden rounded-xl border border-white/10 bg-ink-900">
            <iframe
              title="Exit Caff location"
              src="https://www.google.com/maps?q=TMJ+Complex+Azhagiyamandapam&output=embed"
              className="map-embed h-full w-full"
              loading="lazy"
            />
          </div>
        </div>

        <form
          onSubmit={handleSubmit((v) => submit.mutate(v))}
          className="space-y-4 rounded-2xl border border-white/10 bg-ink-900/40 p-6 sm:p-8 lg:col-span-3"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Name" {...register('name')} error={errors.name?.message} />
            <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Phone (optional)" {...register('phone')} />
            <Input label="Subject" {...register('subject')} error={errors.subject?.message} />
          </div>
          <div>
            <label htmlFor="message" className="text-sm font-medium text-cream-200/80">
              Message
            </label>
            <textarea
              id="message"
              rows={6}
              {...register('message')}
              className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-cream-100 placeholder:text-cream-200/30 focus:border-gold-500/60 focus:outline-none"
              placeholder="How can we help?"
            />
            {errors.message && <p className="mt-1 text-xs text-red-400">{errors.message.message}</p>}
          </div>
          <Button type="submit" size="lg" className="w-full" isLoading={submit.isPending}>
            Send Message
          </Button>
        </form>
      </div>
    </div>
  );
}
