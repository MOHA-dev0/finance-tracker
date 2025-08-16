import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Settings,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface BudgetData {
  id?: string;
  limit_amount: number;
  month: number;
  year: number;
}

interface IncomeData {
  id?: string;
  amount: number;
  month: number;
  year: number;
}

export default function BudgetOverview() {
  const [budget, setBudget] = useState<BudgetData | null>(null);
  const [income, setIncome] = useState<IncomeData | null>(null);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [newBudget, setNewBudget] = useState("");
  const [newIncome, setNewIncome] = useState("");
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user } = useAuth();

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const fetchData = async () => {
    if (!user) return;

    try {
      // Fetch current month's budget
      const { data: budgetData } = await supabase
        .from("budgets")
        .select("*")
        .eq("user_id", user.id)
        .eq("month", currentMonth)
        .eq("year", currentYear)
        .single();

      setBudget(budgetData);
      setNewBudget(budgetData?.limit_amount?.toString() || "");

      // Fetch current month's income
      const { data: incomeData } = await supabase
        .from("incomes")
        .select("*")
        .eq("user_id", user.id)
        .eq("month", currentMonth)
        .eq("year", currentYear)
        .single();

      setIncome(incomeData);
      setNewIncome(incomeData?.amount?.toString() || "");

      // Fetch current month's expenses
      const startDate = `${currentYear}-${currentMonth
        .toString()
        .padStart(2, "0")}-01`;
      const endDate = `${currentYear}-${currentMonth
        .toString()
        .padStart(2, "0")}-31`;

      const { data: expensesData } = await supabase
        .from("expenses")
        .select("amount")
        .eq("user_id", user.id)
        .gte("expense_date", startDate)
        .lte("expense_date", endDate);

      if (expensesData) {
        const total = expensesData.reduce(
          (sum, expense) => sum + expense.amount,
          0
        );
        setTotalExpenses(total);
      }
    } catch (error: any) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const saveBudgetAndIncome = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Save budget
      if (newBudget) {
        const budgetAmount = parseFloat(newBudget);
        if (budget) {
          await supabase
            .from("budgets")
            .update({ limit_amount: budgetAmount })
            .eq("id", budget.id);
        } else {
          await supabase.from("budgets").insert({
            user_id: user.id,
            limit_amount: budgetAmount,
            month: currentMonth,
            year: currentYear,
          });
        }
      }

      // Save income
      if (newIncome) {
        const incomeAmount = parseFloat(newIncome);
        if (income) {
          await supabase
            .from("incomes")
            .update({ amount: incomeAmount })
            .eq("id", income.id);
        } else {
          await supabase.from("incomes").insert({
            user_id: user.id,
            amount: incomeAmount,
            month: currentMonth,
            year: currentYear,
          });
        }
      }

      toast({
        title: "Updated successfully!",
        description: "Your budget and income have been saved.",
      });

      setDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to save data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const budgetLimit = budget?.limit_amount || 0;
  const budgetUsed = (totalExpenses / budgetLimit) * 100;
  const remainingBudget = budgetLimit - totalExpenses;
  const monthlyIncome = income?.amount || 0;

  const getBudgetStatus = () => {
    if (budgetUsed >= 100)
      return {
        color: "text-destructive",
        icon: TrendingDown,
        text: "Over Budget!",
      };
    if (budgetUsed >= 80)
      return {
        color: "text-warning",
        icon: AlertTriangle,
        text: "Close to Limit",
      };
    return { color: "text-success", icon: TrendingUp, text: "On Track" };
  };

  const status = getBudgetStatus();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Monthly Income */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm font-medium">
            Monthly Income
            <TrendingUp className="h-4 w-4 text-success" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">
            ₺{monthlyIncome.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </CardContent>
      </Card>

      {/* Budget Limit */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm font-medium">
            Budget Limit
            <status.icon className={`h-4 w-4 ${status.color}`} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₺{budgetLimit.toFixed(2)}</div>
          <p className={`text-xs mt-1 ${status.color}`}>{status.text}</p>
        </CardContent>
      </Card>

      {/* Remaining Budget */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm font-medium">
            Remaining
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Budget & Income</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="income">Monthly Income (₺)</Label>
                    <Input
                      id="income"
                      type="number"
                      step="0.01"
                      value={newIncome}
                      onChange={(e) => setNewIncome(e.target.value)}
                      placeholder="Enter monthly income"
                    />
                  </div>
                  <div>
                    <Label htmlFor="budget">Monthly Budget (₺)</Label>
                    <Input
                      id="budget"
                      type="number"
                      step="0.01"
                      value={newBudget}
                      onChange={(e) => setNewBudget(e.target.value)}
                      placeholder="Enter budget limit"
                    />
                  </div>
                  <Button
                    onClick={saveBudgetAndIncome}
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              remainingBudget < 0 ? "text-destructive" : "text-primary"
            }`}
          >
            ₺{remainingBudget.toFixed(2)}
          </div>
          <div className="mt-2">
            <Progress value={Math.min(budgetUsed, 100)} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {budgetUsed.toFixed(1)}% used (₺{totalExpenses.toFixed(2)})
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
