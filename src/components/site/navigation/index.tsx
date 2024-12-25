import CustomUserButton from "@/components/global/custom-sign-out";
import { ModeToggle } from "@/components/global/mode-toggle";
import { UserButton } from "@clerk/nextjs";
import { User } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";

type Props = {
  user?: null | User;
};

const Navigation = ({ user }: Props) => {
  return (
    <div className="fixed top-0 right-0 left-0 z-10 p-4 flex items-center justify-between">
      {/* we have left side and right side */}
      <aside className="flex items-center gap-2">
        <Image
          src={"/assets/jplura-logo.png"}
          width={120}
          height={120}
          alt="JPlura Logo"
        />
        {/* <span className="text-xl font-bold"> JPlura. </span> */}
      </aside>
      <nav className="hidden md:block absolute left-[50%] top-[50%] transform translate-x-[-50%] translate-y-[-50%]">
        <ul className="flex items-center justify-center gap-8">
          <li>
            <Link href={"#"}>Home</Link>
          </li>
          <li>
            <Link href={"#features"}>Features</Link>
          </li>
          <li>
            <Link href={"#pricing"}>Pricing</Link>
          </li>
          <li>
            <Link href={"#about"}>About</Link>
          </li>
          <li>
            <Link href={"#faq"}>FAQ</Link>
          </li> 
          <li>
            <Link href={"#contact"}>Contact</Link>
          </li>  
        </ul>
      </nav>
      {/* Right side with login button */}  
      <aside className="flex gap-2 items-center">
        {/*log in toggle*/}
        <Link
          href={"/agency"}
          className="bg-primary p-2 px-4 rounded-md text-white hover:bg-primary/80 transition"
        >
          Login
        </Link>
        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-[40px] w-[40px]",
              userButtonPopoverActionButton__signOut: {
                display: "none",
              },
            },
          }}
        />
      </aside>
    </div>
  );
};

export default Navigation;
