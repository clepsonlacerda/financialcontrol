"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { ptBR } from "date-fns/locale";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import {
  closeExpense,
  findCloseDates,
  removeCloseDate,
} from "../services/ExpenseService";

import { SummaryCell } from "@/components/summary-cell";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheckIcon, Loader2, SaveIcon, TrashIcon } from "lucide-react";
import DatePicker from "react-datepicker";
import { useForm } from "react-hook-form";
import { findUserByLogin } from "../services/UserService";
import ExpensesByCloseDate from "@/components/expenses-by-close-date";

const formSchema = z.object({
  date: z.date(),
});

const defaultValues = {
  date: new Date(),
};

const CloseExpensePage = () => {
  const [closingDate, setClosingDate] = useState<Date | null>(null);
  const [closeDates, setCloseDates] = useState<Date[]>([]);

  const [submitIsLoading, setSubmitIsLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  useEffect(() => {
    const getCloseDates = async () => {
      try {
        const user = await findUserByLogin("clepson");

        if (!user) {
          console.error("User not found");
          return;
        }

        const dates = await findCloseDates(user.id);

        console.log("Fetched close dates:", dates);

        setCloseDates(dates);
      } catch (error) {
        console.error("Error fetching close dates:", error);
      }
    };

    getCloseDates();
  }, []);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    console.log("Form data:", data);

    setSubmitIsLoading(true);
    try {
      const user = await findUserByLogin("clepson");

      if (!user) {
        console.error("User not found");
        return;
      }

      const response = await closeExpense(user.id, data.date);

      console.log("Expenses closed successfully:", response);

      toast.success("Despesa salva com sucesso!");

      form.reset();

      setClosingDate(data.date);
    } catch (error) {
      console.error("Error closing expenses:", error);
    } finally {
      setSubmitIsLoading(false);
    }
  };

  const handleDelete = async (date: Date) => {
    setIsDeleteLoading(true);

    try {
      toast.success("Fechamento deletado com sucesso!");
      // Refresh the list after deletion
      const user = await findUserByLogin("clepson");

      if (!user) {
        console.error("User not found");
        return;
      }

      await removeCloseDate(user.id, date);

      toast.success("Fechamento excluído com sucesso!", {
        icon: <CircleCheckIcon size={16} className="text-green-500" />,
      });

      setCloseDates((prevDates) =>
        prevDates.filter((d) => d.getTime() !== date.getTime())
      );
    } catch (error) {
      console.error("Error deleting closing:", error);
      toast.error("Erro ao excluir o fechamento. Tente novamente.");
    } finally {
      setIsDeleteLoading(false);
    }
  };

  return (
    <section className="p-0">
      <div>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Fechar despesas</CardTitle>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)}>
                <div className="flex flex-col md:flex-row gap-4">
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

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="mt-4">
                      <SaveIcon size={20} className="mr-2" /> Salvar
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="w-[90%] rounded-sm">
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Deseja mesmo fechar as despesas em aberto?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Uma vez fechado, não será possível reverter essa ação.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-row gap-3">
                      <AlertDialogCancel className="w-full mt-0">
                        Cancelar
                      </AlertDialogCancel>
                      <AlertDialogAction
                        disabled={submitIsLoading}
                        onClick={form.handleSubmit(handleSubmit)}
                        className="w-full"
                      >
                        {submitIsLoading && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Confirmar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="mt-4 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">
              Lista de fechamentos realizados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Datas</TableHead>
                  <TableHead>Valor total</TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {closeDates.map((date) => (
                  <TableRow key={date.toISOString()}>
                    <TableCell className="font-medium">
                      {new Intl.DateTimeFormat("pt-BR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }).format(new Date(date))}
                    </TableCell>
                    <TableCell>
                      <SummaryCell date={date} />
                    </TableCell>

                    <TableCell className="text-right">
                      <ExpensesByCloseDate date={date} />

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
                              onClick={() => handleDelete(date)}
                            >
                              {isDeleteLoading && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              )}
                              Confirmar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default CloseExpensePage;
