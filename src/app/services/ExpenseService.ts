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
      user: {
        connect: { id: expense.userId }, // Assuming userId is a valid user ID
      },
      type: {
        connect: { id: expense.typeId },
      },
      price: expense.price,
      closingDate: expense.closingDate || null,
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
    where: { userId, closingDate: null },
    include: {
      type: true,
    },
    orderBy: { date: "desc" },
  });

  return expenses;
};

export const findCloseDates = async (userId: string) => {
  const closeDates = await db.expense.findMany({
    where: {
      userId,
      NOT: { closingDate: null },
    },
    select: { closingDate: true },
    distinct: ["closingDate"],
    orderBy: { closingDate: "desc" },
  });
  return closeDates.map((entry) => entry.closingDate) as Date[];
};

export const findExpensesByCloseDate = async (
  userId: string,
  closingDate: Date
) => {
  const expenses = await db.expense.findMany({
    where: {
      userId,
      closingDate,
    },
    include: {
      type: true,
    },
  });
  return expenses;
};

export const removeCloseDate = async (userId: string, closingDate: Date) => {
  const expenses = await db.expense.updateMany({
    where: {
      userId,
      closingDate,
    },
    data: {
      closingDate: null,
    },
  });
  return expenses.count; // Return the number of expenses updated
};

export const summaryExpensesNotClosed = async (userId: string) => {
  const expenses = await db.expense.findMany({
    where: {
      userId,
      closingDate: null, // Only consider expenses that are not closed
    },
  });

  return expenses.reduce((acc, expense) => acc + expense.price, 0);
};

export const summaryExpensesClosedByDate = async (
  userId: string,
  closingDate: Date
) => {
  const expenses = await db.expense.findMany({
    where: {
      userId, 
      closingDate, // Only consider expenses closed on the specified date
    },
  });
  return expenses.reduce((acc, expense) => acc + expense.price, 0);
};

export const closeExpense = async (userId: string, closingDate: Date) => {
  const expenses = await db.expense.updateMany({
    where: {
      userId,
      closingDate: null, // Only close expenses that are not already closed
    },
    data: {
      closingDate,
    },
  });

  return expenses.count; // Return the number of expenses closed
}