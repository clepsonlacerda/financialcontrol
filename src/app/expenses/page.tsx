"use client";

import DatePicker from "react-datepicker";

import { ptBR } from "date-fns/locale";

import { NumericFormat } from "react-number-format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Expense, ExpenseType, Prisma } from "@prisma/client";
import {
  CircleCheckIcon,
  Loader2,
  PencilIcon,
  SaveIcon,
  TrashIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { findUserByLogin } from "../services/UserService";
import { findAllExpenseTypes } from "../services/ExpenseTypeService";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  deleteExpense,
  findAllExpenses,
  saveExpense,
  summaryExpensesNotClosed,
} from "../services/ExpenseService";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

const formSchema = z.object({
  id: z.string(),
  description: z.string().trim().nullable(),
  date: z.date(),
  price: z.number().min(0, "O preço deve ser maior ou igual a zero"),
  userId: z.string(),
  typeId: z.string(),
});

const defaultValues = {
  id: "",
  description: "",
  date: new Date(),
  price: 0,
  userId: "",
  typeId: "",
  closingDate: null,
};

type ExpenseWithType = Prisma.ExpenseGetPayload<{
  include: {
    type: true;
  };
}>;

const ExpensePage = () => {
  const [expense, setExpense] = useState<Expense>(defaultValues);
  const [expenses, setExpenses] = useState<ExpenseWithType[]>([]);
  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([]);
  const [summaryExpenses, setSummaryExpenses] = useState<number>(0);

  const [submitIsLoading, setSubmitIsLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  useEffect(() => {
    const getFindAll = async () => {
      try {
        const user = await findUserByLogin("clepson");

        if (user) {
          const [expenses, expenseTypes, summary] = await Promise.all([
            findAllExpenses(user.id),
            findAllExpenseTypes(user.id),
            summaryExpensesNotClosed(user.id),
          ]);

          console.log("Expenses fetched:", expenses.length);

          setExpenses(expenses);
          setExpenseTypes(expenseTypes);
          setSummaryExpenses(summary);
        }
      } catch (error) {
        console.error("Erro ao buscar tipos de despesas:", error);
        toast.error("Erro ao carregar tipos de despesas.");
      } finally {
      }
    };

    getFindAll();
    console.log("ExpenseTypePage mounted");
  }, []);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setSubmitIsLoading(true);

    const { id, description, date, price, typeId } = values;

    try {
      const user = await findUserByLogin("clepson");

      console.log("User fetched:", user);

      if (user) {
        const expenseData: Expense = {
          id,
          description,
          date,
          price,
          userId: user.id,
          typeId,
          closingDate: null,
        };

        const expenseCreated = await saveExpense(expenseData);

        // Here you would typically call a service to save the expense
        console.log("Expense data to be saved:", expenseCreated);
        toast.success("Despesa salva com sucesso!");

        form.reset();

        setExpense(defaultValues);
      }
    } catch (error) {
      console.error("Erro ao salvar despesa:", error);
      toast.error("Erro ao salvar despesa.");
    } finally {
      setSubmitIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleteLoading(true);

    try {
      await deleteExpense(id);

      toast.success("Tipo de despesa excluído com sucesso!", {
        icon: <CircleCheckIcon size={16} className="text-green-500" />,
      });

      // Atualiza a lista de tipos de despesas
      setExpenses((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Erro ao excluir tipo de despesa:", error);
      toast.error("Erro ao excluir tipo de despesa. Tente novamente.");
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: expense,
    values: expense,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <section className="p-4">
      <div>
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-base">Cadastre uma despesa</CardTitle>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)}>
                <div className="flex flex-col md:flex-row gap-4">
                  <FormField
                    control={form.control}
                    name="typeId"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Tipos de despesa</SelectLabel>
                                {expenseTypes.map((type) => (
                                  <SelectItem key={type.id} value={type.id}>
                                    {type.name}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormControl>
                          <NumericFormat
                            value={field.value}
                            onValueChange={(values) => {
                              const { floatValue } = values;
                              field.onChange(floatValue ?? 0);
                            }}
                            thousandSeparator="."
                            decimalSeparator=","
                            prefix="R$ "
                            allowNegative={false}
                            customInput={Input}
                            decimalScale={2}
                            fixedDecimalScale
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormControl className="w-full">
                          <DatePicker
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                            selected={field.value ?? null}
                            onChange={(date) => field.onChange(date)}
                            dateFormat="dd/MM/yyyy"
                            locale={ptBR}
                            placeholderText="dd/mm/aaaa"
                            isClearable
                            wrapperClassName="w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  value="default"
                  className="mt-4"
                  type="submit"
                  disabled={submitIsLoading}
                >
                  {submitIsLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <SaveIcon size={20} className="mr-2" /> Salvar
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="mt-4 shadow-md">
          <CardHeader>
            <CardTitle className="text-base">
              Lista de unidades cadastradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.type.name}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(item.price)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {item.date.toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            className="rounded-full mr-1"
                            variant="destructive"
                          >
                            <TrashIcon size={16} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="w-[90%] rounded-sm">
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Deseja mesmo apagar essa seção?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Uma vez apagado, não será possível reverter essa
                              ação.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex-row gap-3">
                            <AlertDialogCancel className="w-full mt-0">
                              Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction
                              disabled={isDeleteLoading}
                              className="w-full"
                              onClick={() => handleDelete(item.id)}
                            >
                              {isDeleteLoading && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              )}
                              Confirmar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <Button
                        className="rounded-full"
                        onClick={() => {
                          setExpense(item);
                          form.reset(item);
                        }}
                      >
                        <PencilIcon size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3}>Total</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(summaryExpenses)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default ExpensePage;
