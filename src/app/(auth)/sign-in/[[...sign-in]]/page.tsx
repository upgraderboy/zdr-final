import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
    return <SignIn signUpUrl="/sign-up" signInUrl="/sign-in" withSignUp={false} fallbackRedirectUrl="/sign-up" />;
}
