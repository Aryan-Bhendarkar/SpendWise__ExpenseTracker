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

// Add this helper function at the top of the file
function capitalizeCategory(category) {
    // Split by underscore and capitalize each word
    return category.split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

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
            <div class="transaction-details">
                <strong>${transaction.description}</strong>
                <div class="transaction-meta">
                    <span class="category">${capitalizeCategory(transaction.category)}</span>
                    <span class="date">${formatDate(transaction.date)}</span>
                </div>
            </div>
            <div class="transaction-amount">
                <span class="amount ${transaction.type === 'expense' ? 'expense-color' : 'income-color'}">
                    ${transaction.type === 'expense' ? '-' : '+'}${formatCurrency(transaction.amount)}
                </span>
                <button onclick="deleteTransaction(${transaction.id})" class="delete-btn" title="Delete transaction">×</button>
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

    // Add heading to chart section
    const chartSection = document.querySelector('.charts-section');
    const chartHeading = document.createElement('h2');
    chartHeading.className = 'chart-title';
    chartHeading.textContent = 'Expense Breakdown';
    
    // Remove existing heading if any
    const existingHeading = chartSection.querySelector('.chart-title');
    if (existingHeading) {
        existingHeading.remove();
    }
    chartSection.insertBefore(chartHeading, chartSection.firstChild);

    const categoryTotals = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
            acc[capitalizeCategory(t.category)] = (acc[capitalizeCategory(t.category)] || 0) + t.amount;
            return acc;
        }, {});

    const total = Object.values(categoryTotals).reduce((sum, value) => sum + value, 0);
    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);
    const percentages = data.map(value => ((value / total) * 100).toFixed(1));

    const chartColors = [
        'rgb(255, 99, 132)',    // Pink
        'rgb(54, 162, 235)',    // Blue
        'rgb(255, 206, 86)',    // Yellow
        'rgb(75, 192, 192)',    // Teal
        'rgb(153, 102, 255)',   // Purple
        'rgb(255, 159, 64)',    // Orange
        'rgb(46, 204, 113)',    // Green
        'rgb(142, 68, 173)',    // Deep Purple
        'rgb(52, 152, 219)',    // Light Blue
        'rgb(231, 76, 60)',     // Red
        'rgb(241, 196, 15)',    // Golden
        'rgb(230, 126, 34)',    // Carrot Orange
        'rgb(26, 188, 156)'     // Turquoise
    ];

    const gradientColors = chartColors.map(color => {
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, color.replace('rgb', 'rgba').replace(')', ', 0.8)'));
        return gradient;
    });

    chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: gradientColors,
                borderWidth: 0,
                hoverOffset: 20,
                spacing: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            layout: {
                padding: {
                    top: 30,
                    bottom: 70,
                    left: 20,
                    right: 20
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    align: 'center',
                    labels: {
                        color: function(context) {
                            // Return the same color as the chart segment
                            return chartColors[context.dataIndex] || '#FFFFFF';
                        },
                        padding: 15,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        font: {
                            size: 13,
                            weight: '600',
                            family: "'Segoe UI', sans-serif"
                        },
                        generateLabels: function(chart) {
                            const data = chart.data;
                            if (data.labels.length && data.datasets.length) {
                                return data.labels.map((label, i) => {
                                    const value = data.datasets[0].data[i];
                                    const percentage = percentages[i];
                                    return {
                                        text: `${label} (${percentage}%)`,
                                        fillStyle: chartColors[i],
                                        strokeStyle: chartColors[i],
                                        lineWidth: 0,
                                        hidden: false,
                                        index: i,
                                        // Add text color to match the segment
                                        fontColor: chartColors[i]
                                    };
                                });
                            }
                            return [];
                        },
                        boxWidth: 10,
                        boxHeight: 10
                    }
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    },
                    padding: 15,
                    cornerRadius: 10,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = formatCurrency(context.raw);
                            const percentage = percentages[context.dataIndex];
                            return ` ${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            },
            animation: {
                animateScale: true,
                animateRotate: true,
                duration: 1000,
                easing: 'easeInOutQuart'
            },
            elements: {
                arc: {
                    borderRadius: 4
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
