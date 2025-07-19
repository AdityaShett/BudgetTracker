let netIncome = 4000;
let budgetFramework = { needs: 50, wants: 30, savings: 20 };
let expenses = [
  { id: 1, description: 'Rent', amount: 1200, category: 'needs', date: '2025-07-01' },
  { id: 2, description: 'Groceries', amount: 150, category: 'needs', date: '2025-07-03' },
  { id: 3, description: 'Netflix', amount: 15, category: 'wants', date: '2025-07-05' },
  { id: 4, description: 'Dinner out', amount: 80, category: 'wants', date: '2025-07-10' },
  { id: 5, description: 'Savings', amount: 200, category: 'savings', date: '2025-07-12' }
];

const app = document.getElementById('app');
const overlay = document.getElementById('modal-overlay');
const addBtn = document.getElementById('add-btn');
const cancelBtn = document.getElementById('cancel-btn');
const quickAddBtn = document.getElementById('quick-add-btn');

function renderDashboard() {
  const totals = calculateBudgetStatus();
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = netIncome - totalSpent;

  app.innerHTML = `
    <h2>Dashboard</h2>
    <p><strong>Net Income:</strong> $${netIncome}</p>
    <p><strong>Total Spent:</strong> $${totalSpent}</p>
    <p><strong>Remaining:</strong> $${remaining}</p>
    <canvas id="pieChart" width="400" height="300"></canvas>
  `;

  renderPieChart(totals);
}

function renderPieChart(totals) {
  const ctx = document.getElementById('pieChart');
  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Needs', 'Wants', 'Savings'],
      datasets: [{
        label: 'Spending',
        data: [totals.needs.spent, totals.wants.spent, totals.savings.spent],
        backgroundColor: ['#000000', '#666666', '#bbbbbb']
      }]
    }
  });
}

function renderIncomePage() {
  app.innerHTML = `
    <h2>Income</h2>
    <p><strong>Net Income:</strong> $${netIncome}</p>
    <label>Update Income: <input id="income-input" type="number" value="${netIncome}"/></label>
    <h3>Budget Framework</h3>
    ${Object.entries(budgetFramework).map(([key, value]) => `
      <label>${key} %: <input class="budget-input" data-category="${key}" type="number" value="${value}"/></label><br/>
    `).join('')}
    <button id="save-income">Save</button>
  `;

  document.getElementById('save-income').onclick = () => {
    netIncome = parseFloat(document.getElementById('income-input').value);
    document.querySelectorAll('.budget-input').forEach(input => {
      const cat = input.dataset.category;
      budgetFramework[cat] = parseInt(input.value);
    });
    renderIncomePage();
  };
}

function renderExpensesPage() {
  app.innerHTML = `
    <h2>Expenses</h2>
    <table>
      <thead>
        <tr><th>Date</th><th>Description</th><th>Category</th><th>Amount</th><th>Delete</th></tr>
      </thead>
      <tbody>
        ${expenses.map(exp => `
          <tr>
            <td>${exp.date}</td>
            <td>${exp.description}</td>
            <td>${exp.category}</td>
            <td>$${exp.amount}</td>
            <td><button onclick="deleteExpense(${exp.id})">X</button></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function renderReviewPage() {
  const monthly = ['Jan','Feb','Mar','Apr','May','Jun','Jul'];
  const monthlyExpenses = [3200, 3400, 3100, 3600, 3300, 3500, expenses.reduce((sum, e) => sum + e.amount, 0)];

  app.innerHTML = `
    <h2>Monthly Review</h2>
    <canvas id="lineChart" width="600" height="300"></canvas>
  `;

  new Chart(document.getElementById('lineChart'), {
    type: 'line',
    data: {
      labels: monthly,
      datasets: [
        {
          label: 'Income',
          data: Array(7).fill(netIncome),
          borderColor: 'black',
          borderWidth: 2,
          fill: false
        },
        {
          label: 'Expenses',
          data: monthlyExpenses,
          borderColor: 'gray',
          borderWidth: 2,
          fill: false
        }
      ]
    }
  });
}

function calculateBudgetStatus() {
  const allocations = {};
  const spending = { needs: 0, wants: 0, savings: 0 };

  for (let cat in budgetFramework) {
    allocations[cat] = (netIncome * budgetFramework[cat]) / 100;
  }

  expenses.forEach(e => {
    if (spending[e.category] !== undefined) {
      spending[e.category] += e.amount;
    }
  });

  return {
    needs: { allocated: allocations.needs, spent: spending.needs },
    wants: { allocated: allocations.wants, spent: spending.wants },
    savings: { allocated: allocations.savings, spent: spending.savings }
  };
}

function deleteExpense(id) {
  expenses = expenses.filter(e => e.id !== id);
  renderExpensesPage();
}

function showModal() {
  overlay.classList.remove('hidden');
  document.getElementById('date-input').valueAsDate = new Date();
}

function hideModal() {
  overlay.classList.add('hidden');
}

function addExpense() {
  const description = document.getElementById('desc-input').value;
  const amount = parseFloat(document.getElementById('amount-input').value);
  const category = document.getElementById('category-input').value;
  const date = document.getElementById('date-input').value;

  if (description && amount && category && date) {
    expenses.push({
      id: Date.now(),
      description,
      amount,
      category,
      date
    });
    hideModal();
    renderDashboard();
  }
}

function renderPage(page) {
  if (page === 'dashboard') renderDashboard();
  if (page === 'income') renderIncomePage();
  if (page === 'expenses') renderExpensesPage();
  if (page === 'review') renderReviewPage();
}

document.querySelectorAll('#nav-buttons button').forEach(btn => {
  btn.onclick = () => renderPage(btn.dataset.page);
});
addBtn.onclick = addExpense;
cancelBtn.onclick = hideModal;
quickAddBtn.onclick = showModal;

renderDashboard();
