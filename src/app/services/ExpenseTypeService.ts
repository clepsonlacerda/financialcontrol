"use server";

import { ExpenseType } from "@prisma/client";
import { db } from "../_lib/prisma";


export const saveExpenseType = async (expenseType: ExpenseType) => {
  if(expenseType.id) {
    const expenseTypeUpdated = await db.expenseType.update({
      where: { id: expenseType.id },
      data: {
        name: expenseType.name,
        description: expenseType.description,
        userId: expenseType.userId,
      },
    });
    return expenseTypeUpdated;

  } 

  const expenseTypeSaved = await db.expenseType.create({
    data: {
      name: expenseType.name,
      description: expenseType.description,
      userId: expenseType.userId,
    },
  });
  
  return expenseTypeSaved;
}

export const findAllExpenseTypes = async (userId: string) => {
  const expenseTypes = await db.expenseType.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });

  return expenseTypes;
}

export const deleteExpenseType = async (id: string) => {
  await db.expenseType.delete({
    where: { id },
  });
} 
