// Get stored transactions and budget
let transactions = [];
let monthlyBudget = 0;

// Initialize charts
let monthlyComparisonChart = null;
let spendingPatternChart = null;

// Load data from localStorage
function loadData() {
    try {
        transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        monthlyBudget = parseFloat(localStorage.getItem('monthlyBudget')) || 0;
        console.log('Data loaded:', { transactionsCount: transactions.length, monthlyBudget });
    } catch (error) {
        console.error('Error loading data:', error);
        transactions = [];
        monthlyBudget = 0;
    }
}

// Calculate financial health score
function calculateHealthScore() {
    if (transactions.length === 0) return 0;

    // Get last 3 months transactions
    const threeMonthsAgo = new Date('2025-02-15');  // Base date
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const recentTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate >= threeMonthsAgo;
    });

    // Calculate monthly averages
    const totalIncome = recentTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyIncome = totalIncome / 3; // Average monthly income

    const totalExpenses = recentTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyExpenses = totalExpenses / 3; // Average monthly expenses

    // 1. Calculate Savings Score (40% weight)
    // Target: Saving at least 20% of income
    const monthlySavings = monthlyIncome - monthlyExpenses;
    const savingsRatio = monthlyIncome > 0 ? monthlySavings / monthlyIncome : 0;
    const savingsScore = Math.min((savingsRatio / 0.2) * 100, 100) * 0.4;

    // 2. Calculate Budget Score (30% weight)
    // Target: Staying within monthly budget
    const budgetAdherence = monthlyBudget > 0 ? 
        monthlyExpenses <= monthlyBudget ? 100 : 
        Math.max(0, 100 - ((monthlyExpenses - monthlyBudget) / monthlyBudget * 100)) : 0;
    const budgetScore = budgetAdherence * 0.3;

    // 3. Calculate Essential Spending Score (30% weight)
    // Target: Essential expenses between 50-60% of total expenses
    const essentialCategories = ['rent', 'utilities', 'groceries', 'healthcare', 'insurance'];
    const essentialExpenses = recentTransactions
        .filter(t => t.type === 'expense' && essentialCategories.includes(t.category))
        .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyEssentialExpenses = essentialExpenses / 3;
    const essentialRatio = monthlyExpenses > 0 ? monthlyEssentialExpenses / monthlyExpenses : 0;
    
    // Score is highest (100) when essential ratio is between 0.5 and 0.6
    let essentialScore;
    if (essentialRatio >= 0.5 && essentialRatio <= 0.6) {
        essentialScore = 100;
    } else if (essentialRatio < 0.5) {
        // Score decreases if essential spending is too low
        essentialScore = (essentialRatio / 0.5) * 100;
    } else {
        // Score decreases if essential spending is too high
        essentialScore = Math.max(0, 100 - ((essentialRatio - 0.6) / 0.4) * 100);
    }
    essentialScore = essentialScore * 0.3; // 30% weight

    // Update progress bars
    const savingsBar = document.getElementById('savingsProgress');
    const budgetBar = document.getElementById('budgetProgress');
    const essentialBar = document.getElementById('essentialProgress');

    if (savingsBar && budgetBar && essentialBar) {
        const savingsPercentage = Math.min((savingsRatio / 0.2) * 100, 100);
        const budgetPercentage = budgetAdherence;
        const essentialPercentage = essentialRatio >= 0.5 && essentialRatio <= 0.6 ? 100 :
            essentialRatio < 0.5 ? (essentialRatio / 0.5) * 100 :
            Math.max(0, 100 - ((essentialRatio - 0.6) / 0.4) * 100);

        savingsBar.style.width = `${savingsPercentage}%`;
        budgetBar.style.width = `${budgetPercentage}%`;
        essentialBar.style.width = `${essentialPercentage}%`;

        savingsBar.setAttribute('title', `Savings: ${savingsPercentage.toFixed(1)}% (${formatCurrency(monthlySavings)} per month)`);
        budgetBar.setAttribute('title', `Budget: ${budgetPercentage.toFixed(1)}% (${formatCurrency(monthlyExpenses)} of ${formatCurrency(monthlyBudget)})`);
        essentialBar.setAttribute('title', `Essential Spending: ${essentialPercentage.toFixed(1)}% (${formatCurrency(monthlyEssentialExpenses)} per month)`);
    }

    // Calculate final score
    const finalScore = Math.round(savingsScore + budgetScore + essentialScore);

    // Log detailed calculations
    console.log('Financial Health Score Details:', {
        monthlyIncome: monthlyIncome.toFixed(2),
        monthlyExpenses: monthlyExpenses.toFixed(2),
        monthlySavings: monthlySavings.toFixed(2),
        savingsRatio: savingsRatio.toFixed(2),
        savingsScore: savingsScore.toFixed(2),
        budgetAdherence: budgetAdherence.toFixed(2),
        budgetScore: budgetScore.toFixed(2),
        monthlyEssentialExpenses: monthlyEssentialExpenses.toFixed(2),
        essentialRatio: essentialRatio.toFixed(2),
        essentialScore: essentialScore.toFixed(2),
        finalScore: finalScore
    });

    return finalScore;
}

// Generate recommendations based on financial health
function generateRecommendations() {
    const recommendations = [];
    const score = calculateHealthScore();

    // Get last 3 months data for better analysis
    const threeMonthsAgo = new Date('2025-02-15');
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const recentTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate >= threeMonthsAgo;
    });

    // Calculate monthly averages
    const monthlyIncome = recentTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0) / 3;

    const monthlyExpenses = recentTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0) / 3;

    const monthlySavings = monthlyIncome - monthlyExpenses;
    const savingsRatio = monthlyIncome > 0 ? monthlySavings / monthlyIncome : 0;

    // Calculate essential expenses ratio
    const essentialCategories = ['rent', 'utilities', 'groceries', 'healthcare', 'insurance'];
    const essentialExpenses = recentTransactions
        .filter(t => t.type === 'expense' && essentialCategories.includes(t.category))
        .reduce((sum, t) => sum + t.amount, 0) / 3;

    const essentialRatio = monthlyExpenses > 0 ? essentialExpenses / monthlyExpenses : 0;
    const overBudget = monthlyExpenses > monthlyBudget;

    // Base recommendations on specific financial metrics
    if (savingsRatio < 0.2) {
        recommendations.push(`Your current savings rate is ${(savingsRatio * 100).toFixed(1)}%. Aim to save at least 20% of your income (${formatCurrency(monthlyIncome * 0.2)} per month).`);
    }

    if (overBudget) {
        const overspentAmount = monthlyExpenses - monthlyBudget;
        recommendations.push(`You're over budget by ${formatCurrency(overspentAmount)}. Try to reduce monthly expenses by this amount.`);
    }

    if (essentialRatio > 0.6) {
        recommendations.push(`Essential expenses are ${(essentialRatio * 100).toFixed(1)}% of your spending. Try to reduce them to 50-60% of total expenses.`);
    } else if (essentialRatio < 0.5) {
        recommendations.push(`Essential expenses are only ${(essentialRatio * 100).toFixed(1)}% of spending. Consider if you're accounting for all essential needs.`);
    }

    // Score-based additional recommendations
    if (score < 50) {
        recommendations.push('Create a stricter budget and track expenses daily.');
        recommendations.push('Look for areas to reduce non-essential spending.');
        recommendations.push('Consider ways to increase your income.');
    } else if (score < 75) {
        if (!overBudget) {
            recommendations.push('Good job staying within budget! Consider saving the surplus.');
        }
        recommendations.push('Build an emergency fund of 3-6 months of expenses.');
        recommendations.push('Research ways to optimize your essential expenses.');
    } else {
        recommendations.push('Consider investing your surplus savings for long-term growth.');
        recommendations.push('Look into tax-saving investment options.');
        recommendations.push('Consider setting long-term financial goals like retirement planning.');
    }

    // Display recommendations
    const recommendationsList = document.getElementById('recommendationsList');
    if (recommendationsList) {
        recommendationsList.innerHTML = recommendations
            .map(rec => `<li>${rec}</li>`)
            .join('');
    }

    // Log recommendations for debugging
    console.log('Financial Recommendations:', {
        score,
        monthlyIncome: formatCurrency(monthlyIncome),
        monthlyExpenses: formatCurrency(monthlyExpenses),
        savingsRatio: (savingsRatio * 100).toFixed(1) + '%',
        essentialRatio: (essentialRatio * 100).toFixed(1) + '%',
        recommendations
    });
}

// Create health score display
function displayScore(score) {
    const scoreElement = document.getElementById('healthScore');
    const scoreCircle = document.querySelector('.score-circle');
    
    if (scoreElement) {
        scoreElement.textContent = score;
        
        // Add appropriate class based on score
        scoreCircle.className = 'score-circle';
        if (score >= 80) {
            scoreCircle.classList.add('excellent');
        } else if (score >= 60) {
            scoreCircle.classList.add('good');
        } else if (score >= 40) {
            scoreCircle.classList.add('fair');
        } else {
            scoreCircle.classList.add('poor');
        }
    }
}

// Helper function to get monthly data
function getMonthlyData() {
    const today = new Date();
    const targetMonths = [];
    
    // Get previous 3 months from today
    for (let i = 3; i > 0; i--) {
        const date = new Date();
        date.setMonth(today.getMonth() - i);
        targetMonths.push({
            month: date.getMonth(),
            year: date.getFullYear()
        });
    }

    const months = [];
    const income = [];
    const expenses = [];

    targetMonths.forEach(({ month, year }) => {
        // Set start and end of month for accurate filtering
        const startOfMonth = new Date(year, month, 1);
        const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59);
        
        // Get month name
        const monthName = startOfMonth.toLocaleString('default', { month: 'short' });
        
        // Calculate income for the month
        const monthIncome = transactions
            .filter(t => {
                const tDate = new Date(t.date);
                return t.type === 'income' && 
                       tDate >= startOfMonth && 
                       tDate <= endOfMonth;
            })
            .reduce((sum, t) => sum + t.amount, 0);
        
        // Calculate expenses for the month
        const monthExpenses = transactions
            .filter(t => {
                const tDate = new Date(t.date);
                return t.type === 'expense' && 
                       tDate >= startOfMonth && 
                       tDate <= endOfMonth;
            })
            .reduce((sum, t) => sum + t.amount, 0);
        
        months.push(`${monthName} ${year}`);
        income.push(monthIncome);
        expenses.push(monthExpenses);
    });

    console.log('Monthly Data:', { months, income, expenses });
    return { labels: months, income, expenses };
}

// Create monthly comparison chart
function createMonthlyComparisonChart() {
    const ctx = document.getElementById('monthlyComparisonChart').getContext('2d');
    const monthlyData = getMonthlyData();

    if (monthlyComparisonChart) {
        monthlyComparisonChart.destroy();
    }

    // Set chart height
    ctx.canvas.parentNode.style.height = '300px';

    monthlyComparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: monthlyData.labels,
            datasets: [{
                label: 'Income',
                data: monthlyData.income,
                backgroundColor: 'rgba(46, 204, 113, 0.5)',
                borderColor: 'rgba(46, 204, 113, 1)',
                borderWidth: 1,
                barPercentage: 0.7,
                categoryPercentage: 0.8
            }, {
                label: 'Expenses',
                data: monthlyData.expenses,
                backgroundColor: 'rgba(255, 107, 107, 0.5)',
                borderColor: 'rgba(255, 107, 107, 1)',
                borderWidth: 1,
                barPercentage: 0.7,
                categoryPercentage: 0.8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    top: 10
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        callback: function(value) {
                            return '₹' + value.toLocaleString('en-IN');
                        },
                        font: {
                            size: 11
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        font: {
                            size: 11
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        font: {
                            size: 12
                        },
                        padding: 15,
                        boxWidth: 12,
                        boxHeight: 12
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: {
                        size: 13
                    },
                    bodyFont: {
                        size: 12
                    },
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += formatCurrency(context.raw);
                            return label;
                        }
                    }
                }
            }
        }
    });
}

// Create spending pattern chart
function createSpendingPatternChart() {
    const ctx = document.getElementById('spendingPatternChart').getContext('2d');
    const categoryData = getCategoryData();

    if (spendingPatternChart) {
        spendingPatternChart.destroy();
    }

    spendingPatternChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: categoryData.labels,
            datasets: [{
                label: 'Current Month',
                data: categoryData.current,
                backgroundColor: 'rgba(108, 99, 255, 0.2)',
                borderColor: 'rgba(108, 99, 255, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(108, 99, 255, 1)'
            }, {
                label: 'Previous Month',
                data: categoryData.previous,
                backgroundColor: 'rgba(78, 205, 196, 0.2)',
                borderColor: 'rgba(78, 205, 196, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(78, 205, 196, 1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        backdropColor: 'transparent'
                    },
                    pointLabels: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                }
            }
        }
    });
}

// Helper function to get category data
function getCategoryData() {
    const categories = ['Shopping', 'Groceries', 'Transportation', 'Entertainment', 'Utilities', 'Healthcare'];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    const current = categories.map(category => 
        transactions
            .filter(t => {
                const date = new Date(t.date);
                return t.type === 'expense' && 
                       t.category.toLowerCase().includes(category.toLowerCase()) &&
                       date.getMonth() === currentMonth &&
                       date.getFullYear() === currentYear;
            })
            .reduce((sum, t) => sum + t.amount, 0)
    );
    
    const previous = categories.map(category =>
        transactions
            .filter(t => {
                const date = new Date(t.date);
                return t.type === 'expense' && 
                       t.category.toLowerCase().includes(category.toLowerCase()) &&
                       date.getMonth() === previousMonth &&
                       date.getFullYear() === previousYear;
            })
            .reduce((sum, t) => sum + t.amount, 0)
    );
    
    return { labels: categories, current, previous };
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Generate predictions for next month
function generatePredictions() {
    // Use the latest transaction date as reference instead of current date
    const latestTransaction = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    const referenceDate = latestTransaction ? new Date(latestTransaction.date) : new Date('2025-02-15');
    
    const threeMonthsAgo = new Date(referenceDate);
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    // Get the most recent monthly income (latest month)
    const latestMonthIncome = transactions
        .filter(t => {
            const date = new Date(t.date);
            const latestMonth = referenceDate.getMonth();
            const latestYear = referenceDate.getFullYear();
            return t.type === 'income' && 
                   date.getMonth() === latestMonth &&
                   date.getFullYear() === latestYear;
        })
        .reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate category-wise predictions
    const categories = ['Shopping', 'Groceries', 'Transportation', 'Entertainment', 'Utilities', 'Healthcare'];
    const predictions = categories.map(category => {
        const categoryTransactions = transactions
            .filter(t => {
                const date = new Date(t.date);
                return t.type === 'expense' && 
                       t.category.toLowerCase().includes(category.toLowerCase()) &&
                       date >= threeMonthsAgo;
            });
            
        // Calculate average and trend
        const monthlyTotals = {};
        categoryTransactions.forEach(t => {
            const date = new Date(t.date);
            const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
            monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + t.amount;
        });
        
        const monthlyAmounts = Object.values(monthlyTotals);
        const average = monthlyAmounts.reduce((sum, amount) => sum + amount, 0) / Math.max(1, monthlyAmounts.length);
        
        // Add trend-based adjustment (recent months weighted more)
        const trend = monthlyAmounts.length >= 2 ? 
            (monthlyAmounts[monthlyAmounts.length - 1] - monthlyAmounts[monthlyAmounts.length - 2]) / monthlyAmounts[monthlyAmounts.length - 2] : 0;
        
        const predictedAmount = Math.round(average * (1 + trend * 0.5)); // Adjust prediction based on trend
            
        return {
            category,
            amount: predictedAmount,
            trend: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable'
        };
    });
    
    // Calculate overall prediction
    const totalCurrentExpenses = transactions
        .filter(t => {
            const date = new Date(t.date);
            return t.type === 'expense' && date >= threeMonthsAgo;
        })
        .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyAverage = totalCurrentExpenses / 3;
    const predictedTotal = Math.round(monthlyAverage);
    
    // Use the latest month's income for prediction instead of average
    const expectedSavings = latestMonthIncome - predictedTotal;
    
    const predictionDetails = document.getElementById('predictionDetails');
    predictionDetails.innerHTML = `
        <div class="prediction-summary">
            <div class="prediction-total">
                <span>Monthly Income (Latest)</span>
                <span class="prediction-amount">${formatCurrency(latestMonthIncome)}</span>
            </div>
            <div class="prediction-total">
                <span>Predicted Total Expense</span>
                <span class="prediction-amount">${formatCurrency(predictedTotal)}</span>
            </div>
            <div class="prediction-savings">
                <span>Expected Savings</span>
                <span class="prediction-amount ${expectedSavings >= 0 ? 'positive' : 'negative'}">
                    ${formatCurrency(expectedSavings)}
                </span>
            </div>
        </div>
        <div class="prediction-categories">
            ${predictions.map(p => `
                <div class="prediction-item">
                    <div class="prediction-info">
                        <span class="prediction-category">${p.category}</span>
                        <span class="prediction-trend ${p.trend}">${p.trend}</span>
                    </div>
                    <span class="prediction-amount">${formatCurrency(p.amount)}</span>
                </div>
            `).join('')}
        </div>
    `;
}

// Generate category insights
function generateInsights() {
    const categoryTotals = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
            const category = t.category;
            acc[category] = (acc[category] || 0) + t.amount;
            return acc;
        }, {});
        
    const totalExpenses = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
    
    const insights = Object.entries(categoryTotals)
        .map(([category, amount]) => ({
            category: capitalizeCategory(category),
            percentage: ((amount / totalExpenses) * 100).toFixed(1),
            amount
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);
        
    const insightsList = document.getElementById('categoryInsights');
    insightsList.innerHTML = insights
        .map(insight => `
            <div class="insight-item">
                <div class="insight-header">
                    <span class="insight-category">${insight.category}</span>
                    <span class="insight-percentage">${insight.percentage}%</span>
                </div>
                <p class="insight-message">
                    ${getInsightMessage(insight.category, insight.percentage)}
                </p>
            </div>
        `)
        .join('');
}

// Helper function to get insight messages
function getInsightMessage(category, percentage) {
    if (percentage > 30) {
        return `High spending in ${category}. Consider setting a budget for this category.`;
    } else if (percentage > 20) {
        return `Moderate spending in ${category}. Monitor this category for potential savings.`;
    } else {
        return `Healthy spending level in ${category}. Keep maintaining this pattern.`;
    }
}

// Helper function to capitalize category
function capitalizeCategory(category) {
    return category
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

// Initialize the insights page
function initInsights() {
    console.log('Initializing insights page...');
    loadData();
    
    // Check if data is loaded properly
    console.log('Loaded transactions:', transactions.length);
    console.log('Monthly budget:', monthlyBudget);
    
    // Get current date info
    const today = new Date();
    console.log('Current date:', today.toISOString());
    
    // Verify transaction dates
    transactions.forEach(t => {
        console.log(`Transaction: ${t.description}, Date: ${t.date}, Amount: ${t.amount}`);
    });
    
    const score = calculateHealthScore();
    console.log('Financial health score:', score);
    
    displayScore(score);
    generateRecommendations();
    
    // Create charts with proper height
    const chartCards = document.querySelectorAll('.chart-card');
    chartCards.forEach(card => {
        card.style.height = '300px';
    });
    
    createMonthlyComparisonChart();
    createSpendingPatternChart();
    generatePredictions();
    generateInsights();
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', initInsights);

// Create and update chart
function createChart() {
    const ctx = expenseChart.getContext('2d');
    
    if (chart) {
        chart.destroy();
    }

    // Get the latest month's data
    const latestTransaction = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    const currentDate = latestTransaction ? new Date(latestTransaction.date) : new Date('2025-02-15');
    
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Filter transactions for current month
    const currentMonthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return t.type === 'expense' && 
               tDate.getMonth() === currentMonth &&
               tDate.getFullYear() === currentYear;
    });

    // Calculate category totals for current month
    const categoryTotals = currentMonthTransactions.reduce((acc, t) => {
        const category = capitalizeCategory(t.category);
        acc[category] = (acc[category] || 0) + t.amount;
        return acc;
    }, {});

    const monthName = currentDate.toLocaleString('default', { month: 'long' });
    const total = Object.values(categoryTotals).reduce((sum, value) => sum + value, 0);
    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);
    const percentages = data.map(value => ((value / total) * 100).toFixed(1));

    const chartColors = [
        'rgb(46, 204, 113)',    // Green
        'rgb(52, 152, 219)',    // Blue
        'rgb(155, 89, 182)',    // Purple
        'rgb(241, 196, 15)',    // Yellow
        'rgb(230, 126, 34)',    // Orange
        'rgb(231, 76, 60)',     // Red
        'rgb(26, 188, 156)',    // Turquoise
        'rgb(142, 68, 173)',    // Deep Purple
        'rgb(243, 156, 18)',    // Dark Yellow
        'rgb(192, 57, 43)',     // Dark Red
        'rgb(22, 160, 133)',    // Dark Turquoise
        'rgb(39, 174, 96)'      // Dark Green
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
                    top: 20,
                    bottom: 20
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: `Expense Breakdown - ${monthName} ${currentYear}`,
                    color: 'rgba(255, 255, 255, 0.9)',
                    font: {
                        size: 16,
                        weight: '600'
                    },
                    padding: {
                        bottom: 20
                    }
                },
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        padding: 15,
                        font: {
                            size: 12
                        },
                        generateLabels: function(chart) {
                            const data = chart.data;
                            if (data.labels.length && data.datasets.length) {
                                return data.labels.map((label, i) => {
                                    const value = formatCurrency(data.datasets[0].data[i]);
                                    const percentage = percentages[i];
                                    return {
                                        text: `${label}: ${value} (${percentage}%)`,
                                        fillStyle: chartColors[i],
                                        strokeStyle: chartColors[i],
                                        lineWidth: 0,
                                        hidden: false,
                                        index: i
                                    };
                                });
                            }
                            return [];
                        }
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
            }
        }
    });
} 