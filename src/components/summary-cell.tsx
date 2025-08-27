"use client";

import { summaryExpensesClosedByDate } from "@/app/services/ExpenseService";
import { findUserByLogin } from "@/app/services/UserService";
import { useEffect, useState } from "react";

export const SummaryCell = ({ date }: { date: Date }) => {
  const [value, setValue] = useState<number | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    }).format(value);
  };

  useEffect(() => {
    const fetchSummary = async () => {
      const user = await findUserByLogin("clepson");
      if (!user) return;

      const summary = await summaryExpensesClosedByDate(user.id, date);
      setValue(summary);
    };

    fetchSummary();
  }, [date]);

  if (value === null) return <span>Carregando...</span>;
  return <span>{formatCurrency(value)}</span>;
};
