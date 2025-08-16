import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  expense_date: string;
  created_at: string;
}

const categoryIcons: Record<string, string> = {
  food: '🍽️',
  transport: '🚗',
  bills: '📋',
  shopping: '🛍️',
  entertainment: '🎬',
  healthcare: '🏥',
  education: '📚',
  other: '📝',
};

const categoryColors: Record<string, string> = {
  food: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  transport: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  bills: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  shopping: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  entertainment: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
  healthcare: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  education: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
};

interface ExpenseListProps {
  refreshTrigger: number;
  selectedDate?: Date;
}

export default function ExpenseList({ refreshTrigger, selectedDate }: ExpenseListProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchExpenses = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('expense_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (selectedDate) {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        query = query.eq('expense_date', dateStr);
      }

      const { data, error } = await query;

      if (error) throw error;
      setExpenses(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch expenses',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [user, refreshTrigger, selectedDate]);

  const deleteExpense = async (id: string) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setExpenses(expenses.filter(expense => expense.id !== id));
      toast({
        title: 'Expense deleted',
        description: 'The expense has been successfully removed.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to delete expense',
        variant: 'destructive',
      });
    }
  };

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-32">
          <div className="animate-pulse">Loading expenses...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            {selectedDate ? format(selectedDate, 'PPP') : 'All Expenses'}
          </div>
          {expenses.length > 0 && (
            <div className="text-lg font-bold text-primary">
              ₺{totalAmount.toFixed(2)}
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-4xl mb-2">💸</div>
            <p>No expenses recorded yet</p>
            <p className="text-sm">Add your first expense to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="text-2xl">
                    {categoryIcons[expense.category] || '📝'}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{expense.description}</div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge
                        variant="secondary"
                        className={categoryColors[expense.category]}
                      >
                        {expense.category}
                      </Badge>
                      <span>{format(new Date(expense.expense_date), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-lg font-semibold">
                    ₺{expense.amount.toFixed(2)}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteExpense(expense.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}