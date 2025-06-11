'use client'

import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSignUp } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
interface ClerkAPIError {
  errors?: {
    message: string
    code?: string
    meta?: Record<string, unknown>
  }[]
}
const candidateSchema = z.object({
  role: z.literal('CANDIDATE'),
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const companySchema = z.object({
  role: z.literal('COMPANY'),
  companyName: z.string().min(1, 'Company name is required'),
  websiteUrl: z.string().url('Invalid website URL'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const rawFormSchema = z.discriminatedUnion('role', [candidateSchema, companySchema])

const formSchema = rawFormSchema.superRefine((data, ctx) => {
  if (data.role === 'COMPANY') {
    try {
      const url = new URL(data.websiteUrl)
      const domain = url.hostname.replace(/^www\./, '')
      if (!data.email.endsWith(`@${domain}`)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['email'],
          message: `Email must match domain @${domain}`,
        })
      }
    } catch {
      // Ignore, already handled by url validation
    }
  }
})

type FormSchema = z.infer<typeof rawFormSchema>

export function RegisterForm({ className, ...props }: React.ComponentProps<'div'>) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { isLoaded, signUp } = useSignUp()

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: 'CANDIDATE',
      fullName: '',
      email: '',
      password: '',
      companyName: '',     // Always needed because fields might switch
      websiteUrl: '',
    } as FormSchema,
  })

  const role = form.watch('role')
  if (!isLoaded) return null

  const onSubmit = async (values: FormSchema) => {
    setLoading(true)
    setError(null)

    try {
      const { email, password } = values

      const metadata =
        values.role === 'CANDIDATE'
          ? { role: 'CANDIDATE', fullName: values.fullName }
          : {
              role: 'COMPANY',
              companyName: values.companyName,
              websiteUrl: values.websiteUrl,
            }

      await signUp.create({
        emailAddress: email,
        password,
        unsafeMetadata: metadata,
      })

      await signUp.prepareEmailAddressVerification({ strategy: 'email_link', redirectUrl: process.env.NEXT_PUBLIC_URL || "http://zdar.fr" })

      // Optionally redirect or prompt user to verify
      toast('Check your email for a verification code.')
      router.push('/')
    } catch (err) {
      const clerkError = err as ClerkAPIError
      setError(clerkError.errors?.[0]?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="px-4 py-6">
              <div className="flex flex-col gap-6">
                <div className="text-center">
                  <h1 className="text-2xl font-bold">Create an account</h1>
                  <p className="text-sm text-muted-foreground">Sign up as A Candidate or A Company</p>
                </div>

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sign Up as</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="CANDIDATE">Candidate</SelectItem>
                          <SelectItem value="COMPANY">Company</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {role === 'CANDIDATE' && (
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Jane Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {role === 'COMPANY' && (
                  <>
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Acme Inc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="websiteUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://acme.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {error && <p className="text-sm text-red-500">{error}</p>}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating...' : 'Sign Up'}
                </Button>
              </div>
            </form>
          </Form>

          <div className="relative hidden md:block bg-muted">
            <Image
              src="/partnership_1.png"
              alt="Illustration"
              fill
              className="object-cover dark:brightness-[0.6] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        By continuing, you agree to our <a href="#" className="underline">Terms</a> and <a href="#" className="underline">Privacy Policy</a>.
      </p>
    </div>
  )
}
