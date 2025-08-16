import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  TrendingUp,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
} from "lucide-react";
import {
  format,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";

interface ExpenseData {
  category: string;
  amount: number;
  expense_date: string;
}

interface ChartData {
  name: string;
  value: number;
  amount?: number;
}

const categoryColors = {
  food: "#FF6B6B",
  transport: "#4ECDC4",
  bills: "#45B7D1",
  shopping: "#96CEB4",
  entertainment: "#FFEAA7",
  healthcare: "#DDA0DD",
  education: "#98D8C8",
  other: "#F7DC6F",
};

const categoryIcons: Record<string, string> = {
  food: "🍽️",
  transport: "🚗",
  bills: "📋",
  shopping: "🛍️",
  entertainment: "🎬",
  healthcare: "🏥",
  education: "📚",
  other: "📝",
};

export default function Analytics() {
  const [expenses, setExpenses] = useState<ExpenseData[]>([]);
  const [timeRange, setTimeRange] = useState("month");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchExpenses = async () => {
    if (!user) return;

    try {
      let startDate: Date;
      let endDate = new Date();

      switch (timeRange) {
        case "week":
          startDate = startOfWeek(endDate);
          endDate = endOfWeek(endDate);
          break;
        case "month":
          startDate = startOfMonth(endDate);
          endDate = endOfMonth(endDate);
          break;
        case "3months":
          startDate = subDays(endDate, 90);
          break;
        default:
          startDate = startOfMonth(endDate);
      }

      const { data, error } = await supabase
        .from("expenses")
        .select("category, amount, expense_date")
        .eq("user_id", user.id)
        .gte("expense_date", format(startDate, "yyyy-MM-dd"))
        .lte("expense_date", format(endDate, "yyyy-MM-dd"))
        .order("expense_date", { ascending: true });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [user, timeRange]);

  // Process data for charts
  const categoryData = expenses.reduce((acc, expense) => {
    const existing = acc.find((item) => item.name === expense.category);
    if (existing) {
      existing.value += expense.amount;
    } else {
      acc.push({
        name: expense.category,
        value: expense.amount,
      });
    }
    return acc;
  }, [] as ChartData[]);

  const dailyData = expenses.reduce((acc, expense) => {
    const date = format(new Date(expense.expense_date), "MMM dd");
    const existing = acc.find((item) => item.name === date);
    if (existing) {
      existing.amount! += expense.amount;
    } else {
      acc.push({
        name: date,
        amount: expense.amount,
        value: expense.amount,
      });
    }
    return acc;
  }, [] as ChartData[]);

  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const avgDaily = dailyData.length > 0 ? totalSpent / dailyData.length : 0;
  const topCategory = categoryData.reduce(
    (max, cat) => (cat.value > max.value ? cat : max),
    { name: "", value: 0 }
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-32">
          <div className="animate-pulse">Loading analytics...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with time range selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analytics & Insights</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="3months">Last 3 Months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₺{totalSpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {timeRange === "week"
                ? "This week"
                : timeRange === "month"
                ? "This month"
                : "Last 3 months"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₺{avgDaily.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per day average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
            <PieIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <span>{categoryIcons[topCategory.name] || "📝"}</span>
              <span className="capitalize">{topCategory.name}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              ₺{topCategory.value.toFixed(2)} spent
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="category" className="space-y-4">
        <TabsList>
          <TabsTrigger value="category">By Category</TabsTrigger>
          <TabsTrigger value="daily">Daily Trends</TabsTrigger>
          <TabsTrigger value="pie">Pie Chart</TabsTrigger>
        </TabsList>

        <TabsContent value="category">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Spending by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [
                      `₺${Number(value).toFixed(2)}`,
                      "Amount",
                    ]}
                  />
                  <Bar
                    dataKey="value"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Daily Spending Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [
                      `₺${Number(value).toFixed(2)}`,
                      "Amount",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pie">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieIcon className="h-5 w-5" />
                Expense Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          categoryColors[
                            entry.name as keyof typeof categoryColors
                          ] || "#8884d8"
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [
                      `₺${Number(value).toFixed(2)}`,
                      "Amount",
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
