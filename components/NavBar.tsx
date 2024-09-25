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
  NavigationMenuLink,
  NavigationMenuList,
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
                  Company
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="p-4 bg-background rounded-md shadow-lg">
                    <li>
                      <NavigationMenuLink asChild>
                        <Link href="/about" className="block px-4 py-2 hover:bg-accent rounded">
                          About
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link href="/contact" className="block px-4 py-2 hover:bg-accent rounded">
                          Contact
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
          {/* Members Dropdown */}
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="hover:underline">
                  Members
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="p-4 bg-background rounded-md shadow-lg">
                    <li>
                      <NavigationMenuLink asChild>
                        <Link href="/newMember" className="block px-4 py-2 hover:bg-accent rounded">
                          Add New Member
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link href="/editMember" className="block px-4 py-2 hover:bg-accent rounded">
                          Edit Members
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link href="/memberList" className="block px-4 py-2 hover:bg-accent rounded">
                          Member List
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

          {/* System Features Dropdown */}
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="hover:underline">
                  System Features
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="p-4 bg-background rounded-md shadow-lg">
                    <li>
                      <NavigationMenuLink asChild>
                        <Link href="/event-log" className="block px-4 py-2 hover:bg-accent rounded">
                          Event Logs
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link href="/object-detection" className="block px-4 py-2 hover:bg-accent rounded">
                          Object Detection
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link href="/vision" className="block px-4 py-2 hover:bg-accent rounded">
                          Vision
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