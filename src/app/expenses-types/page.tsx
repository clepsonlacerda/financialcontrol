"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  CircleCheckIcon,
  Loader2,
  PencilIcon,
  SaveIcon,
  TrashIcon,
} from "lucide-react";
import {
  saveExpenseType,
  findAllExpenseTypes,
  deleteExpenseType,
} from "../services/ExpenseTypeService";
import { toast } from "sonner";
import { findUserByLogin } from "../services/UserService";
import {
  Table,
  TableBody,
  TableCell,
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
import { ExpenseType } from "@prisma/client";
import { useEffect, useState } from "react";

const formSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1, "O nome é obrigatório"),
  description: z.string().trim().nullable(),
  userId: z.string(),
});

const defaultValues = {
  id: "",
  name: "",
  description: "",
  userId: "",
};

const ExepnseTypePage = () => {
  const [expensesTypes, setExpensesTypes] = useState<ExpenseType[]>([]);
  const [expenseType, setExpenseType] = useState<ExpenseType>(defaultValues);
  const [submitIsLoading, setSubmitIsLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  useEffect(() => {
    const getAllExpenseTypes = async () => {
      try {
        const user = await findUserByLogin("clepson");

        if (user) {
          const expenseTypes = await findAllExpenseTypes(user.id);

          setExpensesTypes(expenseTypes);
        }
      } catch (error) {
        console.error("Erro ao buscar tipos de despesas:", error);
        toast.error("Erro ao carregar tipos de despesas.");
      } finally {
      }
    };

    getAllExpenseTypes();
    console.log("ExpenseTypePage mounted");
  }, [expenseType]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: expenseType,
    values: expenseType,
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setSubmitIsLoading(true);

    const { id, name, description } = values;

    try {
      const user = await findUserByLogin("clepson");

      const expenseTypeCreated = await saveExpenseType({
        id,
        name,
        description,
        userId: user?.id || "",
      });

      toast.success("Unidade salva com sucesso!", {
        icon: <CircleCheckIcon size={16} className="text-green-500" />,
      });

      console.log("Tipo de despesa salvo:", expenseTypeCreated);

      form.reset();

      setExpenseType(defaultValues);
    } catch (error) {
      console.error("Erro ao salvar tipo de despesa:", error);
      toast.error("Erro ao salvar tipo de despesa. Tente novamente.");
    } finally {
      setSubmitIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleteLoading(true);

    try {
      await deleteExpenseType(id);

      toast.success("Tipo de despesa excluído com sucesso!", {
        icon: <CircleCheckIcon size={16} className="text-green-500" />,
      });

      // Atualiza a lista de tipos de despesas
      setExpensesTypes((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Erro ao excluir tipo de despesa:", error);
      toast.error("Erro ao excluir tipo de despesa. Tente novamente.");
    } finally {
      setIsDeleteLoading(false);
    }
  };

  return (
    <section>
      <div>
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-base">
              Cadastre uma tipo de despesa
            </CardTitle>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)}>
                <div className="flex flex-col md:flex-row gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormControl>
                          <Input
                            placeholder="Nome"
                            {...field}
                            autoComplete="off"
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
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expensesTypes.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="font-medium">
                      {item.description}
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
                        onClick={() => setExpenseType(item)}
                      >
                        <PencilIcon size={16} />
                      </Button>
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

export default ExepnseTypePage;
