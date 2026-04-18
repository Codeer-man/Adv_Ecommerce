import { SignIn } from "@clerk/react";

export function SignInPage() {
  return (
    <div className=" flex items-center justify-center h-[70vh]">
      <SignIn />
    </div>
  );
}
