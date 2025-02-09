# SpendWise - Track Smart, Save Smarter 💰

<div align="center">
  <p><strong>Your Personal Finance Companion</strong></p>
</div>

## 📑 Table of Contents
- [Overview](#-overview)
- [Key Features](#-key-features)
- [Technical Architecture](#-technical-architecture)
- [Special Features](#-special-features)
- [Usage Guide](#-usage-guide)
- [API Integration](#-api-integration)
- [Contributing](#-contributing)
- [Contact](#-contact)

## 🌟 Overview

SpendWise is a sophisticated expense tracking application designed to revolutionize personal finance management. Built with modern web technologies and focused on user experience, it provides real-time insights, market updates, and intelligent predictions to help users make informed financial decisions.

### Why SpendWise?
- 📊 **Data-Driven Insights**: Transform raw financial data into actionable insights
- 🔒 **Privacy-Focused**: All data stored locally, no server dependencies
- 🎯 **Goal-Oriented**: Set and track financial goals with intelligent monitoring
- 📱 **Cross-Platform**: Works seamlessly across all devices and browsers

## 💫 Key Features

### 💹 Smart Dashboard
- **Real-time Tracking**
  - Instant transaction recording and categorization
  - Live balance updates and category-wise breakdown
  - Smart search and filtering capabilities
  
- **Visual Analytics**
  - Interactive pie charts for expense distribution
  - Time-series graphs for spending trends
  - Category-wise comparison charts

### 📊 Financial Insights
- **Health Score System**
  - Comprehensive financial health assessment
  - Multi-factor scoring algorithm
  - Personalized improvement recommendations

- **Predictive Analytics**
  - Prediction made by looking into the past 3 months data 
  - Pattern recognition for recurring expenses
  - Anomaly detection in spending behavior

### 📰 Market Integration
- **Live Market Data**
  - Real-time stock market indicators
  - Currency exchange rates
  - Economic news updates

## 🏗 Technical Architecture

### Frontend Technologies
```plaintext
SpendWise/
├── assets/                 # Static assets and icons
├── styles/                 # CSS stylesheets
│   ├── styles.css         # Main styles
│   ├── insights.css       # Insights page styles
│   └── finance-news.css   # News page styles
├── scripts/               # JavaScript modules
│   ├── script.js          # Core functionality
│   ├── insights.js        # Analytics engine
│   └── finance-news.js    # Market data integration
└── index.html             # Main entry point
```

### Key Components
- **Storage Engine**: LocalStorage
- **UI Framework**: Vanilla JavaScript with Custom Components
- **Data Visualization**: Chart.js
- **API Integration**: Finnhub and Exchange Rates API

## 🚀 Special Features

### 1. Financial Health Score Algorithm
```javascript
class HealthScoreCalculator {
    constructor(transactions, budget) {
        this.transactions = transactions;
        this.budget = budget;
    }

    calculateScore() {
        const savingsRatio = this.calculateSavingsRatio();
        const budgetAdherence = this.calculateBudgetAdherence();
        const essentialSpending = this.calculateEssentialSpending();

        return (savingsRatio * 0.4) + 
               (budgetAdherence * 0.3) + 
               (essentialSpending * 0.3);
    }
}
```

### 2. Predictive Analysis System
- **Historical Data Analysis**
  - Rolling 3-month transaction history
  - Category-wise trend analysis
  - Seasonal pattern detection

- **Prediction Models**
  ```javascript
  prediction = baselineSpending + 
              (trendFactor * seasonalWeight) + 
              (varianceAdjustment * confidenceScore)
  ```

### 3. Real-time Currency Conversion
- Support for 13 major currencies
- Live exchange rate updates
- Historical rate tracking
- Rate change notifications


## 📱 Usage Guide

### First-Time Setup
1. Go to :: https://aryan-bhendarkar.github.io/SpendWise__ExpenseTracker/
2. Set monthly budget
3. Configure expense categories
4. Add recurring transactions
5. Set financial goals

### Daily Usage
1. Record transactions
2. Check insights
3. Review market updates
4. Track goal progress

## 🔌 API Integration

### Finnhub API
- Market data and financial news
- Real-time stock updates
- Documentation: [Finnhub Docs](https://finnhub.io/docs/api)

### Exchange Rates API
- Currency conversion
- Historical rates
- Documentation: [Exchange Rates API](https://exchangeratesapi.io/documentation/)


## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

PS :: If you have any ideas, feel free to connect with me on LinkedIn and share your thoughts😊.


## 📞 Contact

Project Maintainer: Aryan Bhendarkar
- Email: bhendarkararyan@gmail.com
- LinkedIn: www.linkedin.com/in/aryan-bhendarkar-4335b3313

## 🙏 Acknowledgments

### Libraries & Tools
- [Chart.js](https://www.chartjs.org/) - Data visualization
- [Finnhub](https://finnhub.io/) - Market data
- [Exchange Rates API](https://exchangeratesapi.io/) - Currency conversion

### Special Thanks
- Mrinal Bhattacharya Sir
---
<div align="center">
  Made with ❤️ by SpendWise Team
  <br>
  © 2025 SpendWise. All rights reserved.
</div> 