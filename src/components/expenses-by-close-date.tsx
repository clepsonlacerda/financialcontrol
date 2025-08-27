"use client";

import { Prisma } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { ReceiptTextIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { findExpensesByCloseDate } from "@/app/services/ExpenseService";
import { findUserByLogin } from "@/app/services/UserService";

type ExpenseWithType = Prisma.ExpenseGetPayload<{
  include: {
    type: true;
  };
}>;

const ExpensesByCloseDate = ({ date }: { date: Date }) => {
  const [expenses, setExpenses] = useState<ExpenseWithType[]>([]);

  useEffect(() => {
    const fetchExpensesByDate = async () => {
      const user = await findUserByLogin("clepson");
      if (!user) return;

      const expensesByCloseDate = await findExpensesByCloseDate(user.id, date);

      setExpenses(expensesByCloseDate);
    };
    fetchExpensesByDate();
  }, [date]);

  const formattedDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(date));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="rounded-full mr-1">
          <ReceiptTextIcon size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95%] md:w-full rounded-md">
        <DialogHeader>
          <DialogTitle className="text-base">Gastos de {formattedDate(date)}</DialogTitle>
          <DialogDescription asChild>
            <div>
              {expenses.length === 0 && <p>Não há gastos para esta data.</p>}
              {expenses.length > 0 && (
                <table className="w-full text-sm border-collapse ">
                  <thead>
                    <tr>
                      <th className="border-b p-2 text-left">Tipo</th>
                      <th className="border-b p-2 text-left">Data</th>
                      <th className="border-b p-2 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((expense) => (
                      <tr key={expense.id} className="hover:bg-gray-100">
                        <td className="border-b p-2 text-left">{expense.type.name}</td>
                        <td className="border-b p-2 text-left">
                          {new Intl.DateTimeFormat("pt-BR").format(new Date(expense.date))}
                        </td>
                        <td className="border-b p-2 text-right">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(expense.price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {/* <!-- summary --> */}
                  <tfoot>
                    <tr>
                      <td className="p-2 text-left font-bold text-black">Total</td>
                      <td className="p-2"></td>
                      <td className="p-2 text-right font-bold text-black">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(
                          expenses.reduce((total, expense) => total + expense.price, 0)
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default ExpensesByCloseDate;
