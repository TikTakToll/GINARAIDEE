import Link from "next/link";
import { BiLogoGoogle } from "react-icons/bi";

export default function Logo() {
    return (
        <Link href="/" className="flex items-center space-x-2">
            <div className="h-10 w-10 bg-orange-400 rounded-full flex items-center justify-center">
                <BiLogoGoogle className="text-3xl text-white"/>
            </div>
            <span className="text-xl font-bold text-orange-400">GINARAIDEE</span>
        </Link>
    );
}
