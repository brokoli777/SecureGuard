import * as React from "react";
import Link from "next/link";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { EnvVarWarning } from "@/components/env-var-warning";
import HeaderAuth from "@/components/header-auth"; // AuthButton separated
import { createClient } from "@/utils/supabase/server";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuLink,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu"; // Import from your UI components

export default async function NavBar() {
  const {
    data: { user },
  } = await createClient().auth.getUser();

  return (
    <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16 bg-background text-foreground">
      <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
        {/* Left side: Home and Dropdowns */}
        <div className="flex gap-5 items-center font-semibold">
          <Link href="/">Home</Link>

          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="hover:underline">
                  Info
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="p-4 bg-background rounded-md shadow-lg">
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/about"
                          className="block px-4 py-2 hover:bg-accent rounded"
                        >
                          About
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/contact"
                          className="block px-4 py-2 hover:bg-accent rounded"
                        >
                          Contact
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <hr/>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/object-detection"
                          className="block px-4 py-2 hover:bg-accent rounded"
                        >
                          Object Detection
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/facial-recognition"
                          className="block px-4 py-2 hover:bg-accent rounded"
                        >
                          Facial Recognition
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
            <NavigationMenuIndicator />
            <NavigationMenuViewport />
          </NavigationMenu>

          {user && (
            <>
              {/* Members link */}
              <Link href="/memberList" className="hover:underline">
                Members
              </Link>

              {/* Event logs */}
              <Link href="/event-log" className="hover:underline">
                Event Logs
              </Link>

              {/* Vision */}
              <Link href="/vision" className="hover:underline">
                Vision
              </Link>

              {/* Edit Profile */}
              <Link href="/editUser" className="hover:underline">
                Edit Profile
              </Link>

             
            </>
          )}
        </div>

        {/* Right side: Auth logic or Supabase warning */}
        <div className="flex items-center">
          {!hasEnvVars ? <EnvVarWarning /> : <HeaderAuth />}
        </div>
      </div>
    </nav>
  );
}
