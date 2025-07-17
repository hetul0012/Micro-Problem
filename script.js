const form = document.getElementById('expenseForm');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const summary = document.getElementById('summary');
const resetBtn = document.getElementById('resetBtn');
const expenseTableBody = document.getElementById('expenseTableBody');
const addCategoryBtn = document.getElementById('addCategoryBtn');
const newCategoryInput = document.getElementById('newCategory');

let defaultCategories = ['Food', 'Books', 'Transit', 'Entertainment', 'Supplies', 'Rent'];
let customCategories = JSON.parse(localStorage.getItem('customCategories')) || [];
let allCategories = [...defaultCategories, ...customCategories];

let expenseHistory = JSON.parse(localStorage.getItem('expenseHistory')) || [];
let expenses = JSON.parse(localStorage.getItem('expenses')) || {};

initializeCategories();
initializeExpenses();

let chart;

function initializeCategories() {
  categoryInput.innerHTML = '<option value="">Select Category</option>';
  allCategories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categoryInput.appendChild(option);
  });
}

function initializeExpenses() {
  allCategories.forEach(cat => {
    if (!(cat in expenses)) expenses[cat] = 0;
  });
}

const budgets = {
  Food: 200, Books: 100, Transit: 80, Entertainment: 100, Supplies: 50, Rent: 500
};

function updateChart() {
  const data = allCategories.map(cat => expenses[cat] || 0);
  const categories = allCategories;

  if (chart) chart.destroy();

  chart = new Chart(document.getElementById('budgetChart'), {
    type: 'pie',
    data: {
      labels: categories,
      datasets: [{
        data,
        backgroundColor: categories.map((_, i) => `hsl(${i * 40}, 70%, 60%)`)
      }]
    }
  });

  updateSummary();
}

function updateSummary() {
  let lines = [];
  allCategories.forEach(cat => {
    const spent = expenses[cat] || 0;
    const budget = budgets[cat] || 100; // Default budget for custom categories
    const percent = ((spent / budget) * 100).toFixed(0);
    lines.push(`${cat}: $${spent} (${percent}% of $${budget})`);
  });
  summary.textContent = lines.join(' | ');
}

function updateTable() {
  expenseTableBody.innerHTML = '';
  expenseHistory.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.date}</td>
      <td>${item.category}</td>
      <td>$${item.amount.toFixed(2)}</td>
    `;
    expenseTableBody.appendChild(row);
  });
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const amt = parseFloat(amountInput.value);
  const cat = categoryInput.value;

  if (!amt || !cat) return;

  expenses[cat] = (expenses[cat] || 0) + amt;

  const entry = {
    date: new Date().toLocaleString(),
    category: cat,
    amount: amt
  };
  expenseHistory.push(entry);

  localStorage.setItem('expenses', JSON.stringify(expenses));
  localStorage.setItem('expenseHistory', JSON.stringify(expenseHistory));

  amountInput.value = '';
  categoryInput.value = '';

  updateChart();
  updateTable();
});

resetBtn.addEventListener('click', () => {
  if (confirm('Reset all data?')) {
    expenses = {};
    expenseHistory = [];
    customCategories = [];
    allCategories = [...defaultCategories];
    localStorage.clear();
    initializeCategories();
    initializeExpenses();
    updateChart();
    updateTable();
  }
});

addCategoryBtn.addEventListener('click', () => {
  const newCat = newCategoryInput.value.trim();
  if (!newCat || allCategories.includes(newCat)) return alert('Invalid or duplicate category.');
  allCategories.push(newCat);
  customCategories.push(newCat);
  expenses[newCat] = 0;

  localStorage.setItem('customCategories', JSON.stringify(customCategories));
  initializeCategories();

  newCategoryInput.value = '';
  updateChart();
});

updateChart();
updateTable();
