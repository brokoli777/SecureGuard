import Hero from "@/components/hero";
import ConnectSupabaseSteps from "@/components/tutorial/connect-supabase-steps";
import SignUpUserSteps from "@/components/tutorial/sign-up-user-steps";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";

export default function Index() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-20 px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          {/* Left Side Content */}
          <div className="max-w-lg">
            <h1 className="text-5xl font-bold mb-4 text-black dark:text-white">
              SecureGuard: Advanced Security System
            </h1>
            <p className="text-lg mb-8 text-gray-700 dark:text-gray-300">
              SecureGuard offers a comprehensive security solution for monitoring and safeguarding your environment. 
              Our platform provides real-time alerts, image recognition, and customizable threat detection to ensure complete protection.
            </p>
            <Button variant="default" size="lg">
              Learn More
            </Button>
          </div>

          {/* Right Side Graphic */}
          <div className="ml-12">
            <Card className="w-full max-w-md bg-transparent p-6 text-center border-0">
              {/* Only the Image inside the card */}
              <img src="/logo.svg" alt="SecureGuard Logo" className="w-80 mx-auto" />
            </Card>
          </div>

        </div>
      </section>
    </>
  );
}
