"use client";
import Image from "next/image";
import { ModeToggle } from "../ui/ModeToggle";
// import Link from "next/link";


const Navbar = () => {

  return (
    <nav className=" top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-border bg-background/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          {/* <Link href={`/`} className="flex items-center space-x-3"> */}
            <Image
              src="/icon.png"
              alt="Logo"
              width={40}
              height={32}
              className="rounded-full border"
            />
          {/* </Link> */}


          {/* Right Controls */}
          <div className="flex items-center space-x-3">
            <ModeToggle />
          </div>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
