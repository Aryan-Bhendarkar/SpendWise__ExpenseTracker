// Initialize data structure
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let exchangeRates = {};

// DOM Elements
const expenseForm = document.getElementById('expense-form');
const transactionsContainer = document.getElementById('transactions-container');
const totalIncomeElement = document.getElementById('total-income');
const totalExpensesElement = document.getElementById('total-expenses');
const totalSavingsElement = document.getElementById('total-savings');
const expenseChart = document.getElementById('expense-chart');

// Initialize Chart
let chart = null;

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

    const transaction = {
        id: Date.now(),
        description,
        amount,
        type,
        category,
        date: new Date().toISOString()
    };

    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    expenseForm.reset();
    updateUI();
});

// Update UI
function updateUI() {
    updateStats();
    updateTransactionsList();
    updateChart();
}

// Update statistics
function updateStats() {
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
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

// Update transactions list
function updateTransactionsList() {
    transactionsContainer.innerHTML = '';
    
    const sortedTransactions = [...transactions].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );

    sortedTransactions.forEach(transaction => {
        const element = document.createElement('div');
        element.className = `transaction-item ${transaction.type}`;
        
        element.innerHTML = `
            <div>
                <strong>${transaction.description}</strong>
                <span>${transaction.category}</span>
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
