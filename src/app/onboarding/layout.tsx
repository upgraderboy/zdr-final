import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { HydrateClient, trpc } from "@/trpc/server";
import CandidateOnboardingView from '@/modules/candidates/views/CandidateOnBoardingView';
import { CompanyProfileFormView } from '@/modules/companies/views/home-view';
import { HomeLayout } from '@/components/HomeLayout';
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { sessionClaims, userId } = await auth()
  console.log(sessionClaims)
  if (sessionClaims?.metadata.onboardingComplete === true) {
    redirect('/')
  }
  if (sessionClaims?.metadata.role === "CANDIDATE" && sessionClaims?.metadata.onboardingComplete === false) {
    void trpc.resume.getList.prefetch();
    void trpc.candidates.getDefaultResume.prefetch();
    return <HomeLayout role={sessionClaims?.metadata.role} userId={userId || undefined}>
      <HydrateClient>
        <CandidateOnboardingView />
    </HydrateClient>
    </HomeLayout>
  }
  if (sessionClaims?.metadata.role === "COMPANY" && sessionClaims?.metadata.onboardingComplete === false) {
    return <HomeLayout role={sessionClaims?.metadata.role} userId={userId || undefined}>
      <HydrateClient>
        <CompanyProfileFormView />
    </HydrateClient>
    </HomeLayout>
  }

  return <>{children}</>
}