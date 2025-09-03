import { BanknoteArrowDownIcon, CopyXIcon, ListPlusIcon } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="container">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/expenses-types" className="border bg-white hover:bg-zinc-50 h-28 rounded-md flex items-center justify-center gap-4 drop-shadow-md">
            <ListPlusIcon size={32} className="text-zinc-900" />
            <span className="text-zinc-900 font-medium">
              Tipos de Despesas
            </span>
          </Link>

          <Link href="/expenses" className="border bg-white hover:bg-zinc-50 h-28 rounded-md flex items-center justify-center gap-4 drop-shadow-md">
            <BanknoteArrowDownIcon size={32} className="text-zinc-900" />
            <span className="text-zinc-900 font-medium">
              Despesas
            </span>
          </Link>

          <Link href="/close-expenses" className="border bg-white hover:bg-zinc-50 h-28 rounded-md flex items-center justify-center gap-4 drop-shadow-md">
            <CopyXIcon size={32} className="text-zinc-900" />
            <span className="text-zinc-900 font-medium">
              Fechar despesas
            </span>
          </Link>
        </div>
    </div>
  );
}
