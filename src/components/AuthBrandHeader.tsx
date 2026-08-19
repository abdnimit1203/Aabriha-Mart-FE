import Image from "next/image";
import Link from "next/link";

export function AuthBrandHeader() {
  return (
    <Link href="/" className="flex flex-col items-center gap-2 text-center">
      <Image src="/logo.png" alt="" width={56} height={56} className="object-contain" priority />
      <span className="font-logo text-3xl font-semibold tracking-wide">Aabriha Mart</span>
      <p className="max-w-xs text-sm text-muted-foreground">
        Clothing, shoes, bags & electronics — picked for everyday Bangladesh.
      </p>
    </Link>
  );
}
