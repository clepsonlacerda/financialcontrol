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
import { CircleCheckIcon, SaveIcon } from "lucide-react";
import { saveExpenseType } from "../services/ExpenseTypeService";
import { toast } from "sonner";
import { findUserByLogin } from "../services/UserService";

const formSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1, "O nome é obrigatório"),
  description: z.string().trim(),
});

const defaultValues = {
  id: "",
  name: "",
  description: "",
};

const ExepnseTypePage = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
    values: defaultValues,
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
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
    } catch (error) {
      console.error("Erro ao salvar tipo de despesa:", error);
      toast.error("Erro ao salvar tipo de despesa. Tente novamente.");
    }
  };

  return (
    <section>
      <div className="container mt-8">
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

                <Button value="default" className="mt-4" type="submit">
                  <SaveIcon size={20} className="mr-2" /> Salvar
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default ExepnseTypePage;
