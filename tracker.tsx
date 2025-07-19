import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Plus, Trash2, DollarSign, Home, BarChart3, CreditCard, Target, Wallet } from 'lucide-react';
import _ from 'lodash';

const BudgetTrackerApp = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [netIncome, setNetIncome] = useState(5000);
  const [budgetBreakdown, setbudgetBreakdown] = useState({ needs: 50, wants: 30, savings: 20 });
  const [expenses, setExpenses] = useState([]);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    category: 'needs',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const demoExpenses = [
      { id: 1, description: 'Rent', amount: 100, category: 'needs', date: '2025-07-01' },
      { id: 2, description: 'Groceries', amount: 150, category: 'needs', date: '2025-07-03' },
      { id: 3, description: 'Netflix', amount: 20, category: 'wants', date: '2025-07-05' },
      { id: 4, description: 'Outings', amount: 300, category: 'wants', date: '2025-07-10' },
      { id: 5, description: 'Savings', amount: 200, category: 'savings', date: '2025-07-12' }
    ];
    setExpenses(demoExpenses);
  }, []);

  const calcBudget = () => _.mapValues(budgetBreakdown, (percentage) => (netIncome * percentage) / 100);

  const calcSpending = () => {
    const grouped = _.groupBy(expenses, 'category');
    return _.mapValues(grouped, (categoryExpenses) => _.sumBy(categoryExpenses, 'amount'));
  };

  const getBudget = () => {
    const allocations = calcBudget();
    const spending = calcSpending();
    
    return _.mapValues(allocations, (allocated, category) => ({ 
      allocated,
      spent: spending[category] || 0,
      remaining: allocated - (spending[category] || 0),
      percentage: ((spending[category] || 0) / allocated) * 100
    }));
  };

  const addExpense = () => {
    if (expenseForm.description && expenseForm.amount) {
      const newExpense = {
        id: Date.now(),
        ...expenseForm,
        amount: parseFloat(expenseForm.amount)
      };
      setExpenses([...expenses, newExpense]);
      setExpenseForm({
        description: '',
        amount: '',
        category: 'needs',
        date: new Date().toISOString().split('T')[0]
      });
      setShowAddExpense(false);
    }
  };

  const Navigation = () => (
    <nav className="bg-black text-white p-4 border-b-2 border-white-500">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold flex items-center gap-3">
          <Wallet className="w-5 h-5" />
          Budget Tracker
        </h1>
        <div className="flex gap-4">
          {[
            { key: 'dashboard', label: 'Dashboard', icon: Home },
            { key: 'income', label: 'Income', icon: DollarSign },
            { key: 'expenses', label: 'Expenses', icon: CreditCard },
            { key: 'review', label: 'Review', icon: BarChart3 }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setCurrentPage(key)}
              className={`flex items-center gap-2 px-3 py-2 rounded border ${
                currentPage === key 
                  ? 'bg-white text-black border-white' 
                  : 'bg-black text-white border-white-500 hover:bg-gray-800'
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );

  const DashboardPage = () => {
    const budgetStatus = getBudget();
    const totalSpent = _.sumBy(expenses, 'amount');
    const remaining = netIncome - totalSpent;

    const pieData = [
      { name: 'Needs', value: budgetStatus.needs?.spent || 0, color: 'red' },
      { name: 'Wants', value: budgetStatus.wants?.spent || 0, color: 'yellow' },
      { name: 'Savings', value: budgetStatus.savings?.spent || 0, color: 'green' }
    ];

    return (
      <div className="p-6 max-w-7xl mx-auto bg-white">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border-2 border-black">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Net Income</p>
                <p className="text-2xl font-bold text-black">${netIncome.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-black" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border-2 border-black">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-black">${totalSpent.toLocaleString()}</p>
              </div>
              <Target className="w-8 h-8 text-black" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border-2 border-black">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Remaining</p>
                <p className="text-2xl font-bold text-black">${remaining.toLocaleString()}</p>
              </div>
              <Wallet className="w-8 h-8 text-black" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border-2 border-black">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Budget Health</p>
                <p className="text-2xl font-bold text-black">
                  {remaining >= 0 ? 'Good' : 'Over'}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-black" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-lg border-2 border-black">
            <h3 className="text-lg font-semibold mb-4 text-black">Budget Allocation</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-lg border-2 border-black">
            <h3 className="text-lg font-semibold mb-4 text-black">Category Status</h3>
            <div className="space-y-4">
              {Object.entries(budgetStatus).map(([category, status]) => (
                <div key={category} className="border-b-2 border-gray-300 pb-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium capitalize text-black">{category}</span>
                    <span className="text-sm text-gray-600">
                      ${status.remaining.toLocaleString()} remaining
                    </span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-3 border border-black">
                    <div
                      className={`h-3 rounded-full ${status.percentage > 100 ? 'bg-gray-600' : 'bg-black'}`}
                      style={{ width: `${Math.min(status.percentage, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mt-1">
                    <span>${status.spent.toLocaleString()} spent</span>
                    <span>${status.allocated.toLocaleString()} allocated</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border-2 border-black">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-black">Recent Expenses</h3>
            <button
              onClick={() => setShowAddExpense(true)}
              className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg border-2 border-black hover:bg-gray-800"
            >
              <Plus className="w-4 h-4" />
              Add Expense
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-2 border-black">
              <thead>
                <tr className="border-b-2 border-black bg-gray-100">
                  <th className="text-left p-3 text-black">Date</th>
                  <th className="text-left p-3 text-black">Description</th>
                  <th className="text-left p-3 text-black">Category</th>
                  <th className="text-right p-3 text-black">Amount</th>
                </tr>
              </thead>
              <tbody>
                {expenses.slice(-5).map(expense => (
                  <tr key={expense.id} className="border-b border-gray-300">
                    <td className="p-3 text-black">{expense.date}</td>
                    <td className="p-3 text-black">{expense.description}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 rounded-full text-xs bg-gray-200 text-black border border-black">
                        {expense.category}
                      </span>
                    </td>
                    <td className="p-3 text-right text-black">${expense.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const IncomePage = () => (
    <div className="p-6 max-w-4xl mx-auto bg-white">
      <div className="bg-white p-6 rounded-lg border-2 border-black mb-8">
        <h2 className="text-2xl font-bold mb-6 text-black">Managing Your Income</h2>
        
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-black">Current Net Income</h3>
          <div className="bg-gray-100 p-4 rounded-lg border-2 border-black">
            <p className="text-3xl font-bold text-black">${netIncome.toLocaleString()}</p>
            <p className="text-gray-600">Take-Home Pay Per Month</p>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-black">Budget Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(budgetBreakdown).map(([category, percentage]) => (
              <div key={category} className="bg-gray-100 p-4 rounded-lg border-2 border-black">
                <label className="block text-sm font-medium text-black mb-2 capitalize">
                  {category} (%)
                </label>
                <input
                  type="number"
                  value={percentage}
                  onChange={(e) => setbudgetBreakdown(prev => ({
                    ...prev,
                    [category]: parseInt(e.target.value) || 0
                  }))}
                  className="w-full p-2 border-2 border-black rounded-md bg-white text-black"
                />
                <p className="text-sm text-gray-600 mt-1">
                  ${((netIncome * percentage) / 100).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-black">Update Income</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="number"
              value={netIncome}
              onChange={(e) => setNetIncome(parseFloat(e.target.value) || 0)}
              className="w-full p-2 border-2 border-black rounded-md bg-white text-black"
              placeholder="Enter your take-home pay"
            />
            <button className="bg-black text-white px-6 py-2 rounded-lg border-2 border-black hover:bg-gray-800">
              Update Income
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const ExpensesPage = () => (
    <div className="p-6 max-w-6xl mx-auto bg-white">
      <div className="bg-white p-6 rounded-lg border-2 border-black">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-black">Expense Tracking</h2>
          <button
            onClick={() => setShowAddExpense(true)}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg border-2 border-black hover:bg-gray-800"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-2 border-black">
            <thead>
              <tr className="border-b-2 border-black bg-gray-100">
                <th className="text-left p-3 text-black">Date</th>
                <th className="text-left p-3 text-black">Description</th>
                <th className="text-left p-3 text-black">Category</th>
                <th className="text-right p-3 text-black">Amount</th>
                <th className="text-center p-3 text-black">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(expense => (
                <tr key={expense.id} className="border-b border-gray-300 hover:bg-gray-50">
                  <td className="p-3 text-black">{expense.date}</td>
                  <td className="p-3 text-black">{expense.description}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 rounded-full text-xs bg-gray-200 text-black border border-black">
                      {expense.category}
                    </span>
                  </td>
                  <td className="p-3 text-right text-black">${expense.amount.toLocaleString()}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => setExpenses(expenses.filter(e => e.id !== expense.id))}
                      className="text-black hover:text-gray-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const ReviewPage = () => {
    const monthlyTrend = [
      { month: 'Jan', income: 4000, expenses: 3200 },
      { month: 'Feb', income: 4000, expenses: 3400 },
      { month: 'Mar', income: 4000, expenses: 3100 },
      { month: 'Apr', income: 4000, expenses: 3600 },
      { month: 'May', income: 4000, expenses: 3300 },
      { month: 'Jun', income: 4000, expenses: 3500 },
      { month: 'Jul', income: 4000, expenses: _.sumBy(expenses, 'amount') }
    ];

    return (
      <div className="p-6 max-w-6xl mx-auto bg-white">
        <h2 className="text-2xl font-bold mb-6 text-black">Monthly Review</h2>
        
        <div className="bg-white p-6 rounded-lg border-2 border-black">
          <h3 className="text-lg font-semibold mb-4 text-black">Spending Trends</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const AddExpenseModel = () => (
    showAddExpense && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-full max-w-md border-2 border-black">
          <h3 className="text-lg font-semibold mb-4 text-black">Add New Expense</h3>
          <div className="space-y-4">
            <input
              type="text"
              value={expenseForm.description}
              onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
              className="w-full p-2 border-2 border-black rounded-md bg-white text-black"
              placeholder="Enter expense description"
            />
            <input
              type="number"
              value={expenseForm.amount}
              onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
              className="w-full p-2 border-2 border-black rounded-md bg-white text-black"
              placeholder="Enter amount"
            />
            <select
              value={expenseForm.category}
              onChange={(e) => setExpenseForm({...expenseForm, category: e.target.value})}
              className="w-full p-2 border-2 border-black rounded-md bg-white text-black"
            >
              <option value="needs">Needs</option>
              <option value="wants">Wants</option>
              <option value="savings">Savings</option>
            </select>
            <input
              type="date"
              value={expenseForm.date}
              onChange={(e) => setExpenseForm({...expenseForm, date: e.target.value})}
              className="w-full p-2 border-2 border-black rounded-md bg-white text-black"
            />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={() => setShowAddExpense(false)}
              className="px-4 py-2 text-black hover:text-gray-600 border-2 border-black rounded-lg bg-white"
            >
              Cancel
            </button>
            <button
              onClick={addExpense}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 border-2 border-black"
            >
              Add Expense
            </button>
          </div>
        </div>
      </div>
    )
  );

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <DashboardPage />;
      case 'income': return <IncomePage />;
      case 'expenses': return <ExpensesPage />;
      case 'review': return <ReviewPage />;
      default: return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      {renderPage()}
      <AddExpenseModel />
    </div>
  );
};

export default BudgetTrackerApp;