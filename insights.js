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

    // Get last 3 months transactions using current date
    const today = new Date();
    const threeMonthsAgo = new Date(today);
    threeMonthsAgo.setMonth(today.getMonth() - 3);

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

    // Get last 3 months data using current date
    const today = new Date();
    const threeMonthsAgo = new Date(today);
    threeMonthsAgo.setMonth(today.getMonth() - 3);

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

    // Analyze spending trends
    const monthlyData = getMonthlyData();
    const expenseTrend = calculateTrend(monthlyData.expenses);
    const incomeTrend = calculateTrend(monthlyData.income);

    // Add trend-based recommendations
    if (expenseTrend > 0.1) {
        recommendations.push(`Your expenses have increased by ${(expenseTrend * 100).toFixed(1)}% over the last 3 months. Consider reviewing your spending patterns.`);
    } else if (expenseTrend < -0.1) {
        recommendations.push(`Great job! Your expenses have decreased by ${Math.abs(expenseTrend * 100).toFixed(1)}% over the last 3 months.`);
    }

    if (incomeTrend < -0.05) {
        recommendations.push(`Your income has decreased by ${Math.abs(incomeTrend * 100).toFixed(1)}%. Consider exploring additional income sources or discussing a raise.`);
    }

    // Analyze category-specific trends
    const categoryTrends = analyzeCategoryTrends(recentTransactions);
    const highestIncrease = categoryTrends.sort((a, b) => b.trend - a.trend)[0];
    if (highestIncrease && highestIncrease.trend > 0.2) {
        recommendations.push(`${capitalizeCategory(highestIncrease.category)} expenses have increased significantly. Consider setting a specific budget for this category.`);
    }

    // Base recommendations on specific financial metrics
    if (savingsRatio < 0.2) {
        const targetSavings = monthlyIncome * 0.2;
        const additionalSavingsNeeded = targetSavings - monthlySavings;
        recommendations.push(`Your current savings rate is ${(savingsRatio * 100).toFixed(1)}%. To reach the recommended 20% savings rate, try to save an additional ${formatCurrency(additionalSavingsNeeded)} per month.`);
    }

    if (overBudget) {
        const overspentAmount = monthlyExpenses - monthlyBudget;
        const topExpenseCategories = getTopExpenseCategories(recentTransactions, 3);
        recommendations.push(`You're over budget by ${formatCurrency(overspentAmount)}. Consider reducing spending in your top expense categories: ${topExpenseCategories.join(', ')}.`);
    }

    if (essentialRatio > 0.6) {
        const excessEssential = (essentialRatio - 0.6) * monthlyExpenses;
        recommendations.push(`Essential expenses are ${(essentialRatio * 100).toFixed(1)}% of your spending. Try to reduce them by ${formatCurrency(excessEssential)} to reach the recommended 60% threshold.`);
    } else if (essentialRatio < 0.5) {
        recommendations.push(`Essential expenses are only ${(essentialRatio * 100).toFixed(1)}% of spending. Review if you're accounting for all essential needs like insurance and healthcare.`);
    }

    // Score-based additional recommendations
    if (score < 50) {
        recommendations.push('Create a detailed budget breakdown for each category and track expenses daily.');
        recommendations.push(`Focus on reducing spending in non-essential categories: ${getNonEssentialCategories(recentTransactions).join(', ')}.`);
        recommendations.push('Consider automating your savings by setting up automatic transfers on payday.');
    } else if (score < 75) {
        if (!overBudget) {
            const surplus = monthlyBudget - monthlyExpenses;
            recommendations.push(`You're under budget by ${formatCurrency(surplus)}! Consider allocating this surplus to your emergency fund or investments.`);
        }
        recommendations.push('Build an emergency fund targeting 3-6 months of expenses: ' + formatCurrency(monthlyExpenses * 6));
        if (essentialRatio > 0.5) {
            recommendations.push('Research ways to optimize your essential expenses through better plans or providers.');
        }
    } else {
        recommendations.push(`With your healthy financial score of ${score}, consider investing in diversified portfolios for long-term growth.`);
        recommendations.push('Look into tax-saving investment options to optimize your finances further.');
        recommendations.push('Consider setting up multiple savings goals for different life objectives.');
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
        expenseTrend: (expenseTrend * 100).toFixed(1) + '%',
        incomeTrend: (incomeTrend * 100).toFixed(1) + '%',
        recommendations
    });
}

// Helper function to calculate trend (percentage change)
function calculateTrend(data) {
    if (data.length < 2) return 0;
    const oldValue = data[0];
    const newValue = data[data.length - 1];
    return oldValue === 0 ? 0 : (newValue - oldValue) / oldValue;
}

// Helper function to analyze category trends
function analyzeCategoryTrends(transactions) {
    const categories = [...new Set(transactions.map(t => t.category))];
    const monthlyTotals = {};

    // Calculate monthly totals for each category
    transactions.forEach(t => {
        const date = new Date(t.date);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        if (!monthlyTotals[monthKey]) {
            monthlyTotals[monthKey] = {};
        }
        monthlyTotals[monthKey][t.category] = (monthlyTotals[monthKey][t.category] || 0) + t.amount;
    });

    const monthKeys = Object.keys(monthlyTotals).sort();
    return categories.map(category => {
        const firstMonth = monthlyTotals[monthKeys[0]][category] || 0;
        const lastMonth = monthlyTotals[monthKeys[monthKeys.length - 1]][category] || 0;
        const trend = firstMonth === 0 ? 0 : (lastMonth - firstMonth) / firstMonth;
        return { category, trend };
    });
}

// Helper function to get top expense categories
function getTopExpenseCategories(transactions, limit = 3) {
    const categoryTotals = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
        }, {});

    return Object.entries(categoryTotals)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)
        .map(([category]) => capitalizeCategory(category));
}

// Helper function to get non-essential categories
function getNonEssentialCategories(transactions) {
    const essentialCategories = ['rent', 'utilities', 'groceries', 'healthcare', 'insurance'];
    const categories = [...new Set(transactions
        .filter(t => t.type === 'expense' && !essentialCategories.includes(t.category))
        .map(t => capitalizeCategory(t.category)))];
    return categories.slice(0, 3); // Return top 3 non-essential categories
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
        const date = new Date(today);
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
    // Use current date as reference
    const today = new Date();
    const threeMonthsAgo = new Date(today);
    threeMonthsAgo.setMonth(today.getMonth() - 3);
    
    // Get the most recent monthly income (latest month)
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const latestMonthIncome = transactions
        .filter(t => {
            const date = new Date(t.date);
            return t.type === 'income' && 
                   date.getMonth() === currentMonth &&
                   date.getFullYear() === currentYear;
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
    // Get transactions from last 3 months for better analysis
    const today = new Date();
    const threeMonthsAgo = new Date(today);
    threeMonthsAgo.setMonth(today.getMonth() - 3);

    const recentTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return t.type === 'expense' && tDate >= threeMonthsAgo;
    });

    // Calculate category totals and trends
    const categoryAnalysis = {};
    const monthlyTotals = {};
    const weekdayPatterns = {};
    const timeOfDayPatterns = {};

    recentTransactions.forEach(t => {
        const category = t.category;
        const date = new Date(t.date);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        const weekday = date.getDay();
        const hour = date.getHours();

        // Initialize category analysis
        if (!categoryAnalysis[category]) {
            categoryAnalysis[category] = {
                total: 0,
                count: 0,
                maxAmount: 0,
                minAmount: Infinity,
                monthlyTotals: {},
                weekdayTotals: Array(7).fill(0),
                timeOfDayTotals: Array(24).fill(0),
                transactions: [],
                regularityScore: 0
            };
        }

        // Update category analysis
        categoryAnalysis[category].total += t.amount;
        categoryAnalysis[category].count++;
        categoryAnalysis[category].maxAmount = Math.max(categoryAnalysis[category].maxAmount, t.amount);
        categoryAnalysis[category].minAmount = Math.min(categoryAnalysis[category].minAmount, t.amount);
        categoryAnalysis[category].weekdayTotals[weekday] += t.amount;
        categoryAnalysis[category].timeOfDayTotals[hour] += t.amount;
        categoryAnalysis[category].transactions.push({
            amount: t.amount,
            date: date,
            description: t.description
        });

        // Track monthly totals
        if (!categoryAnalysis[category].monthlyTotals[monthKey]) {
            categoryAnalysis[category].monthlyTotals[monthKey] = 0;
        }
        categoryAnalysis[category].monthlyTotals[monthKey] += t.amount;

        // Track overall monthly totals
        if (!monthlyTotals[monthKey]) {
            monthlyTotals[monthKey] = 0;
        }
        monthlyTotals[monthKey] += t.amount;
    });

    const totalExpenses = Object.values(categoryAnalysis).reduce((sum, cat) => sum + cat.total, 0);
    
    // Calculate advanced insights for each category
    const insights = Object.entries(categoryAnalysis).map(([category, analysis]) => {
        const percentage = (analysis.total / totalExpenses) * 100;
        const avgTransactionAmount = analysis.total / analysis.count;
        
        // Calculate month-over-month trend
        const monthlyAmounts = Object.values(analysis.monthlyTotals);
        const trend = calculateTrend(monthlyAmounts);

        // Calculate frequency (transactions per month)
        const transactionsPerMonth = analysis.count / 3;

        // Analyze spending patterns
        const patterns = analyzeSpendingPatterns(analysis);
        
        // Calculate spending regularity score (0-100)
        const regularityScore = calculateRegularityScore(analysis);

        // Identify potential savings opportunities
        const savingsOpportunities = identifySavingsOpportunities(analysis, avgTransactionAmount, patterns);

        // Generate smart recommendations
        const smartRecommendations = generateSmartRecommendations(
            category,
            analysis,
            patterns,
            regularityScore,
            trend,
            avgTransactionAmount
        );

        return {
            category: capitalizeCategory(category),
            percentage: percentage.toFixed(1),
            amount: analysis.total,
            avgAmount: avgTransactionAmount,
            maxAmount: analysis.maxAmount,
            minAmount: analysis.minAmount,
            frequency: transactionsPerMonth,
            trend: trend,
            patterns: patterns,
            regularityScore: regularityScore,
            savingsOpportunities: savingsOpportunities,
            recommendations: smartRecommendations
        };
    }).sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    const insightsList = document.getElementById('categoryInsights');
    insightsList.innerHTML = insights
        .map(insight => `
            <div class="insight-item">
                <div class="insight-header">
                    <span class="insight-category">${insight.category}</span>
                    <span class="insight-percentage">${insight.percentage}%</span>
                </div>
                <div class="insight-details">
                    <p class="insight-amount">Total: ${formatCurrency(insight.amount)}</p>
                    <p class="insight-frequency">Frequency: ${insight.frequency.toFixed(1)} times/month</p>
                    <p class="insight-trend ${insight.trend > 0 ? 'increasing' : insight.trend < 0 ? 'decreasing' : 'stable'}">
                        Trend: ${Math.abs(insight.trend * 100).toFixed(1)}% ${insight.trend > 0 ? '↑' : insight.trend < 0 ? '↓' : '→'}
                    </p>
                    <p class="insight-regularity">Regularity Score: ${insight.regularityScore.toFixed(0)}/100</p>
                </div>
                <div class="insight-patterns">
                    <h4>Spending Patterns</h4>
                    <ul>
                        ${insight.patterns.map(pattern => `<li>${pattern}</li>`).join('')}
                    </ul>
                </div>
                <div class="insight-recommendations">
                    <h4>Smart Recommendations</h4>
                    <ul>
                        ${insight.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
                ${insight.savingsOpportunities.length > 0 ? `
                    <div class="savings-opportunities">
                        <h4>Savings Opportunities</h4>
                        <ul>
                            ${insight.savingsOpportunities.map(opp => `<li>${opp}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `)
        .join('');
}

// Analyze spending patterns for a category
function analyzeSpendingPatterns(analysis) {
    const patterns = [];
    
    // Analyze weekday patterns
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const topWeekday = analysis.weekdayTotals
        .map((amount, index) => ({ day: weekdays[index], amount }))
        .sort((a, b) => b.amount - a.amount)[0];
    
    if (topWeekday.amount > 0) {
        patterns.push(`Highest spending on ${topWeekday.day}s`);
    }

    // Analyze time of day patterns
    const timeRanges = [
        { name: 'morning (6-11)', start: 6, end: 11 },
        { name: 'afternoon (12-17)', start: 12, end: 17 },
        { name: 'evening (18-23)', start: 18, end: 23 },
        { name: 'night (0-5)', start: 0, end: 5 }
    ];

    const timeRangeTotals = timeRanges.map(range => {
        const total = analysis.timeOfDayTotals
            .slice(range.start, range.end + 1)
            .reduce((sum, amount) => sum + amount, 0);
        return { name: range.name, total };
    });

    const topTimeRange = timeRangeTotals.sort((a, b) => b.total - a.total)[0];
    if (topTimeRange.total > 0) {
        patterns.push(`Most transactions during ${topTimeRange.name}`);
    }

    // Analyze transaction size patterns
    const transactions = analysis.transactions.sort((a, b) => b.amount - a.amount);
    const largeTransactions = transactions.filter(t => t.amount > analysis.avgAmount * 1.5);
    if (largeTransactions.length > 0) {
        patterns.push(`${largeTransactions.length} large transactions (>50% above average)`);
    }

    // Analyze spending consistency
    const monthlyAmounts = Object.values(analysis.monthlyTotals);
    const monthlyVariation = calculateVariation(monthlyAmounts);
    if (monthlyVariation < 0.1) {
        patterns.push('Very consistent monthly spending');
    } else if (monthlyVariation > 0.3) {
        patterns.push('Highly variable monthly spending');
    }

    return patterns;
}

// Calculate regularity score for spending pattern
function calculateRegularityScore(analysis) {
    let score = 0;
    const maxScore = 100;

    // Score based on transaction frequency consistency
    const monthlyAmounts = Object.values(analysis.monthlyTotals);
    const monthlyVariation = calculateVariation(monthlyAmounts);
    score += (1 - monthlyVariation) * 40; // Up to 40 points for consistent monthly amounts

    // Score based on timing patterns
    const weekdayVariation = calculateVariation(analysis.weekdayTotals);
    score += (1 - weekdayVariation) * 30; // Up to 30 points for consistent day-of-week patterns

    // Score based on transaction amount consistency
    const amounts = analysis.transactions.map(t => t.amount);
    const amountVariation = calculateVariation(amounts);
    score += (1 - amountVariation) * 30; // Up to 30 points for consistent transaction amounts

    return Math.min(Math.max(score, 0), maxScore);
}

// Helper function to calculate coefficient of variation
function calculateVariation(numbers) {
    if (numbers.length < 2) return 0;
    const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
    const variance = numbers.reduce((sum, n) => sum + Math.pow(n - mean, 2), 0) / numbers.length;
    const stdDev = Math.sqrt(variance);
    return mean === 0 ? 0 : stdDev / mean;
}

// Identify potential savings opportunities
function identifySavingsOpportunities(analysis, avgAmount, patterns) {
    const opportunities = [];
    
    // Check for high-value transactions that could be optimized
    const highValueThreshold = avgAmount * 1.5;
    const highValueTransactions = analysis.transactions
        .filter(t => t.amount > highValueThreshold)
        .length;
    
    if (highValueTransactions > 0) {
        opportunities.push(
            `Potential savings of ${formatCurrency(highValueThreshold * 0.2)} per transaction by optimizing ${highValueTransactions} high-value purchases`
        );
    }

    // Check for frequent small transactions that could be bundled
    const smallValueThreshold = avgAmount * 0.5;
    const smallTransactions = analysis.transactions
        .filter(t => t.amount < smallValueThreshold)
        .length;
    
    if (smallTransactions >= 5) {
        opportunities.push(
            `Bundle ${smallTransactions} small transactions to save on transaction costs and potentially get bulk discounts`
        );
    }

    // Identify potential timing-based savings
    const weekdayTotals = analysis.weekdayTotals;
    const maxWeekdaySpending = Math.max(...weekdayTotals);
    const minWeekdaySpending = Math.min(...weekdayTotals.filter(amount => amount > 0));
    
    if (maxWeekdaySpending > minWeekdaySpending * 1.5) {
        opportunities.push(
            'Consider shifting some purchases to lower-spending days for better deals and discounts'
        );
    }

    return opportunities;
}

// Generate smart recommendations based on spending patterns
function generateSmartRecommendations(category, analysis, patterns, regularityScore, trend, avgAmount) {
    const recommendations = [];
    
    // Recommendations based on spending regularity
    if (regularityScore < 40) {
        recommendations.push('Create a structured spending plan to improve consistency and predictability');
    } else if (regularityScore > 80) {
        recommendations.push('Your consistent spending pattern is ideal for automated budgeting and savings rules');
    }

    // Recommendations based on trend
    if (trend > 0.1) {
        recommendations.push(
            `Set up spending alerts for transactions above ${formatCurrency(avgAmount)} to maintain control`
        );
    } else if (trend < -0.1) {
        recommendations.push(
            'Maintain your successful spending reduction strategy'
        );
    }

    // Category-specific recommendations
    switch (category.toLowerCase()) {
        case 'groceries':
            recommendations.push('Use a shopping list app to track essential items and avoid impulse purchases');
            if (analysis.weekdayTotals[0] > 0 || analysis.weekdayTotals[6] > 0) {
                recommendations.push('Consider shopping on weekdays for better deals and less crowded stores');
            }
            break;
        case 'entertainment':
            if (trend > 0) {
                recommendations.push('Look for free or low-cost entertainment options in your area');
            }
            recommendations.push('Check for entertainment package deals or subscriptions to reduce per-event costs');
            break;
        case 'utilities':
            if (trend > 0) {
                recommendations.push('Consider a home energy audit to identify potential savings');
            }
            recommendations.push('Research off-peak usage discounts from your utility providers');
            break;
        case 'shopping':
            recommendations.push('Create a wishlist and wait for sales on non-essential items');
            if (patterns.some(p => p.includes('large transactions'))) {
                recommendations.push('Research price trends and timing for major purchases');
            }
            break;
        case 'transportation':
            recommendations.push('Compare costs of different transportation options for your regular routes');
            if (analysis.total > 1000) {
                recommendations.push('Consider carpooling or public transit options to reduce costs');
            }
            break;
        default:
            if (analysis.count > 10) {
                recommendations.push('Look for loyalty programs or bulk purchase options to reduce costs');
            }
    }

    // Add personalized recommendation based on timing patterns
    const timePatterns = patterns.find(p => p.includes('transactions during'));
    if (timePatterns) {
        recommendations.push('Consider adjusting purchase timing to take advantage of off-peak prices and promotions');
    }

    return recommendations.slice(0, 3); // Return top 3 most relevant recommendations
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

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
} 