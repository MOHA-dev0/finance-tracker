import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LogOut,
  DollarSign,
  Plus,
  BarChart3,
  Calendar,
  Settings,
} from "lucide-react";
import BudgetOverview from "@/components/BudgetOverview";
import ExpenseForm from "@/components/ExpenseForm";
import ExpenseList from "@/components/ExpenseList";
import Analytics from "@/components/Analytics";
import DateNavigator from "@/components/DateNavigator";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  console.log("user: ", user);

  const handleExpenseAdded = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold text-primary">Fivest</h1>
              </div>
              <div className="text-sm text-muted-foreground">
                Welcome back,{" "}
                {user?.identities?.[0]?.identity_data?.full_name ||
                  user?.email?.split("@")[0]}
                !
              </div>
            </div>
            <Button
              variant="outline"
              onClick={signOut}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Budget Overview */}
        <div className="mb-8">
          <BudgetOverview />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="today" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="today" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Daily Tracker
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Daily Expense Tracker</h2>
              <DateNavigator
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-1">
                <ExpenseForm
                  onExpenseAdded={handleExpenseAdded}
                  selectedDate={selectedDate}
                />
              </div>
              <div className="xl:col-span-2">
                <ExpenseList
                  refreshTrigger={refreshTrigger}
                  selectedDate={selectedDate}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <Analytics />
          </TabsContent>

          <TabsContent value="history">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Expense History</h2>
                <div className="text-sm text-muted-foreground">
                  Browse all your expenses
                </div>
              </div>
              <ExpenseList refreshTrigger={refreshTrigger} />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
