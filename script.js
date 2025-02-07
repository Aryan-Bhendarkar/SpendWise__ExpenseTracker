// Initialize data structure
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let exchangeRates = {};
let monthlyBudget = parseFloat(localStorage.getItem('monthlyBudget')) || 0;

// DOM Elements
const expenseForm = document.getElementById('expense-form');
const transactionsContainer = document.getElementById('transactions-container');
const totalIncomeElement = document.getElementById('total-income');
const totalExpensesElement = document.getElementById('total-expenses');
const totalSavingsElement = document.getElementById('total-savings');
const expenseChart = document.getElementById('expense-chart');
const filterStartDate = document.getElementById('filter-start-date');
const filterEndDate = document.getElementById('filter-end-date');
const applyFilterBtn = document.getElementById('apply-filter');
const budgetAmountInput = document.getElementById('budget-amount');
const monthlyBudgetElement = document.getElementById('monthly-budget');
const monthlySpentElement = document.getElementById('monthly-spent');
const monthlyRemainingElement = document.getElementById('monthly-remaining');

// Set initial dates for filter
const today = new Date();
filterStartDate.value = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
filterEndDate.value = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

// Initialize Chart
let chart = null;
let filteredTransactions = [...transactions];

// Fetch exchange rates
async function fetchExchangeRates() {
    try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        exchangeRates = data.rates;
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
    }
}

// Initialize the application
async function init() {
    await fetchExchangeRates();
    updateUI();
    createChart();
    
    // Set default amount for currency converter
    convertAmount.value = 1;
    performConversion(); // Trigger initial conversion
}

// Add transaction
expenseForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const type = document.getElementById('type').value;
    const category = document.getElementById('category').value;
    const date = document.getElementById('transaction-date').value || new Date().toISOString().split('T')[0];

    const transaction = {
        id: Date.now(),
        description,
        amount,
        type,
        category,
        date
    };

    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    expenseForm.reset();
    document.getElementById('transaction-date').value = new Date().toISOString().split('T')[0];
    updateUI();
});

// Update UI with filtered transactions
function updateUI() {
    applyFilters();
    updateStats();
    updateTransactionsList();
    updateChart();
    updateBudgetSummary();
}

// Apply date filters
function applyFilters() {
    const startDate = new Date(filterStartDate.value);
    const endDate = new Date(filterEndDate.value);
    endDate.setHours(23, 59, 59, 999);

    filteredTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= startDate && transactionDate <= endDate;
    });
}

// Update statistics with filtered transactions
function updateStats() {
    const income = filteredTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const savings = income - expenses;

    totalIncomeElement.textContent = formatCurrency(income);
    totalExpensesElement.textContent = formatCurrency(expenses);
    totalSavingsElement.textContent = formatCurrency(savings);
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Update budget summary
function updateBudgetSummary() {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const monthlyExpenses = transactions
        .filter(t => {
            const transactionDate = new Date(t.date);
            return t.type === 'expense' && 
                   transactionDate >= firstDayOfMonth && 
                   transactionDate <= lastDayOfMonth;
        })
        .reduce((sum, t) => sum + t.amount, 0);

    const remaining = monthlyBudget - monthlyExpenses;

    monthlyBudgetElement.textContent = formatCurrency(monthlyBudget);
    monthlySpentElement.textContent = formatCurrency(monthlyExpenses);
    monthlyRemainingElement.textContent = formatCurrency(remaining);

    // Update styles based on budget status
    monthlyRemainingElement.style.color = remaining >= 0 ? 'var(--income-color)' : 'var(--expense-color)';
}

// Event listeners for filters and budget
applyFilterBtn.addEventListener('click', updateUI);
budgetAmountInput.addEventListener('change', () => {
    monthlyBudget = parseFloat(budgetAmountInput.value) || 0;
    localStorage.setItem('monthlyBudget', monthlyBudget);
    updateBudgetSummary();
});

// Set initial budget value
budgetAmountInput.value = monthlyBudget;

// Update transactions list with filtered transactions
function updateTransactionsList() {
    transactionsContainer.innerHTML = '';
    
    const sortedTransactions = [...filteredTransactions].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );

    sortedTransactions.forEach(transaction => {
        const element = document.createElement('div');
        element.className = `transaction-item ${transaction.type}`;
        
        element.innerHTML = `
            <div>
                <strong>${transaction.description}</strong>
                <div class="transaction-details">
                    <span class="category">${transaction.category}</span>
                    <span class="date">${formatDate(transaction.date)}</span>
                </div>
            </div>
            <div>
                <span class="amount ${transaction.type === 'expense' ? 'expense-color' : 'income-color'}">
                    ${transaction.type === 'expense' ? '-' : '+'}${formatCurrency(transaction.amount)}
                </span>
                <button onclick="deleteTransaction(${transaction.id})" class="delete-btn">×</button>
            </div>
        `;
        
        transactionsContainer.appendChild(element);
    });
}

// Format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Delete transaction
function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    updateUI();
}

// Create and update chart
function createChart() {
    const ctx = expenseChart.getContext('2d');
    
    if (chart) {
        chart.destroy();
    }

    const categoryTotals = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
        }, {});

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);

    chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#e74c3c', '#3498db', '#2ecc71', '#f1c40f',
                    '#9b59b6', '#e67e22', '#1abc9c'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

// Currency converter functionality
const convertBtn = document.getElementById('convert-btn');
const conversionResult = document.getElementById('conversion-result');
const convertAmount = document.getElementById('convert-amount');
const fromCurrency = document.getElementById('from-currency');
const toCurrency = document.getElementById('to-currency');

// Function to perform currency conversion
function performConversion() {
    const amount = parseFloat(convertAmount.value) || 0;
    const from = fromCurrency.value;
    const to = toCurrency.value;

    if (amount === 0) {
        conversionResult.textContent = 'Please enter an amount';
        return;
    }

    const convertedAmount = convertCurrency(amount, from, to);
    const formattedAmount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: from
    }).format(amount);
    
    const formattedResult = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: to
    }).format(convertedAmount);

    conversionResult.textContent = `${formattedAmount} = ${formattedResult}`;
}

// Add event listeners for currency conversion
convertBtn.addEventListener('click', performConversion);
convertAmount.addEventListener('input', performConversion);
fromCurrency.addEventListener('change', performConversion);
toCurrency.addEventListener('change', performConversion);

// Currency conversion calculation
function convertCurrency(amount, fromCurrency, toCurrency) {
    const fromRate = exchangeRates[fromCurrency];
    const toRate = exchangeRates[toCurrency];
    return (amount / fromRate) * toRate;
}

// Update chart when transactions change
function updateChart() {
    createChart();
}

// Initialize the application
init();
