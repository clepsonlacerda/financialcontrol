"use server";

import { Expense } from "@prisma/client";
import { db } from "../_lib/prisma";

export const saveExpense = async (expense: Expense) => {
  if (expense.id) {
    const expenseUpdated = await db.expense.update({
      where: { id: expense.id },
      data: {
        description: expense.description,
        date: expense.date,
        userId: expense.userId,
        typeId: expense.typeId,
        price: expense.price,
      },
    });
    return expenseUpdated;
  }

  const expenseSaved = await db.expense.create({
    data: {
      description: expense.description,
      date: expense.date,
      userId: expense.userId,
      typeId: expense.typeId,
      price: expense.price,
    },
  });

  return expenseSaved;
};

export const deleteExpense = async (id: string) => {
  await db.expense.delete({
    where: { id },
  });
};

export const findAllExpenses = async (userId: string) => {
  const expenses = await db.expense.findMany({
    where: { userId },
    include: {
      type: true,
    },
  });

  return expenses;
};
