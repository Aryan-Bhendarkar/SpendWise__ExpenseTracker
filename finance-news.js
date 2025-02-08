// API Keys
const FINNHUB_API_KEY = 'cujens1r01qm7p9nvr00cujens1r01qm7p9nvr0g'; // Get your free API key from https://finnhub.io/

// DOM Elements
const marketIndicators = document.getElementById('marketIndicators');
const newsContainer = document.getElementById('newsContainer');
const tipsCarousel = document.getElementById('tipsCarousel');
const resourcesGrid = document.getElementById('resourcesGrid');
const filterButtons = document.querySelectorAll('.filter-btn');

// Market Data Configuration
const marketIndices = {
    us: [
        { symbol: 'SPY', name: 'S&P 500 ETF', type: 'index', currency: 'USD', description: 'Tracks 500 largest US companies' },
        { symbol: 'QQQ', name: 'NASDAQ ETF', type: 'index', currency: 'USD', description: 'Tracks 100 largest non-financial companies' },
        { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology', currency: 'USD', description: 'Consumer electronics & software' },
        { symbol: 'MSFT', name: 'Microsoft', sector: 'Technology', currency: 'USD', description: 'Software & cloud services' },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology', currency: 'USD', description: 'Internet services & AI' },
        { symbol: 'TSLA', name: 'Tesla, Inc.', sector: 'Automotive', currency: 'USD', description: 'Electric vehicles & clean energy' }
    ]
};

// Function to check if API keys are configured
function checkAPIKeys() {
    if (!FINNHUB_API_KEY) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <p>⚠️ Missing Finnhub API Key</p>
            <p>Please follow these steps to get your API key:</p>
            <ol>
                <li>
                    <strong>Finnhub (US Markets):</strong>
                    <ul>
                        <li>Visit <a href="https://finnhub.io/" target="_blank">Finnhub</a></li>
                        <li>Click "Sign Up" and create an account</li>
                        <li>Get your API key from the dashboard</li>
                    </ul>
                </li>
                <li>
                    <strong>Update the code:</strong>
                    <ul>
                        <li>Open finance-news.js</li>
                        <li>Replace the empty API key string with your Finnhub key</li>
                    </ul>
                </li>
            </ol>
        `;
        marketIndicators.innerHTML = '';
        marketIndicators.appendChild(errorDiv);
        return false;
    }
    return true;
}

// Function to fetch US market data from Finnhub
async function fetchUSMarketData(symbol) {
    try {
        const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`);
        if (!response.ok) throw new Error(`Failed to fetch data for ${symbol}`);
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error fetching US market data for ${symbol}:`, error);
        return null;
    }
}

// Function to fetch historical data
async function fetchHistoricalData(symbol) {
    try {
        const endDate = Math.floor(Date.now() / 1000);
        const startDate = endDate - (30 * 24 * 60 * 60); // 30 days ago
        const resolution = 'D'; // Daily candles

        const response = await fetch(
            `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${startDate}&to=${endDate}&token=${FINNHUB_API_KEY}`
        );
        
        if (!response.ok) throw new Error(`Failed to fetch historical data for ${symbol}`);
        return await response.json();
    } catch (error) {
        console.error(`Error fetching historical data for ${symbol}:`, error);
        return null;
    }
}

// Initialize the page with enhanced error handling
async function init() {
    try {
        // First check if API keys are configured
        if (!checkAPIKeys()) {
            return; // Stop initialization if API keys are missing
        }

        // Load static content
        loadFinancialTips();
        loadResources();
        
        // Show loading state
        marketIndicators.classList.add('loading');

        // Show loading message
        const warningDiv = document.createElement('div');
        warningDiv.className = 'fallback-warning';
        warningDiv.innerHTML = `
            <p>⚠️ Loading market data... This may take a few moments.</p>
        `;
        marketIndicators.appendChild(warningDiv);

        // Fetch both current and historical data
        const usData = await Promise.all(
            marketIndices.us.map(async (index) => {
                const [quote, historical] = await Promise.all([
                    fetchUSMarketData(index.symbol),
                    fetchHistoricalData(index.symbol)
                ]);
                return { ...index, quote, historical };
            })
        );

        // Filter out failed requests
        const validUSData = usData.filter(item => item.quote);

        // Display data
        displayMarketData({
            us: validUSData
        });

        // Fetch and display news
        await fetchAndDisplayNews();

    } catch (error) {
        console.error('Error initializing page:', error);
        handleError(error);
    } finally {
        marketIndicators.classList.remove('loading');
    }
}

// Fetch and display news with improved filtering
async function fetchAndDisplayNews(category = 'general') {
    try {
        newsContainer.classList.add('loading');
        
        // Map filter categories to Finnhub categories
        const categoryMap = {
            'all': 'general',
            'market': 'forex',
            'economy': 'general',
            'personal': 'general'  // Changed to general to get broader results
        };

        const finnhubCategory = categoryMap[category] || 'general';
        const response = await fetch(`https://finnhub.io/api/v1/news?category=${finnhubCategory}&token=${FINNHUB_API_KEY}`);
        if (!response.ok) throw new Error('Failed to fetch news');
        
        const articles = await response.json();
        
        // Enhanced filtering logic
        let filteredArticles = articles;
        if (category !== 'all') {
            filteredArticles = articles.filter(article => {
                const searchText = (article.headline + ' ' + article.summary + ' ' + article.category).toLowerCase();
                switch (category) {
                    case 'market':
                        return searchText.includes('market') || searchText.includes('trading') || 
                               searchText.includes('stocks') || searchText.includes('shares');
                    case 'economy':
                        return searchText.includes('economy') || searchText.includes('gdp') || 
                               searchText.includes('inflation') || searchText.includes('federal reserve');
                    case 'personal':
                        return searchText.includes('personal finance') || searchText.includes('savings') || 
                               searchText.includes('investment') || searchText.includes('retirement') ||
                               searchText.includes('credit') || searchText.includes('debt') ||
                               searchText.includes('budget') || searchText.includes('personal wealth');
                    default:
                        return true;
                }
            });
        }
        
        displayNews(filteredArticles.slice(0, 15)); // Show more articles
    } catch (error) {
        console.error('Error fetching news:', error);
        handleError(error);
    } finally {
        newsContainer.classList.remove('loading');
    }
}

// Enhanced error handling
function handleError(error) {
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.innerHTML = `
        <p>⚠️ Error loading data: ${error.message}</p>
        <p>This might be due to:</p>
        <ul>
            <li>API rate limits</li>
            <li>Network connectivity issues</li>
            <li>Invalid API key</li>
        </ul>
        <button onclick="retryFetch()" class="retry-button">Retry</button>
    `;
    
    if (error.message.includes('market')) {
        marketIndicators.innerHTML = '';
        marketIndicators.appendChild(errorMessage);
    } else if (error.message.includes('news')) {
        newsContainer.innerHTML = '';
        newsContainer.appendChild(errorMessage);
    }
}

// Add retry functionality
async function retryFetch() {
    try {
        await Promise.all([
            fetchAndDisplayMarketData(),
            fetchAndDisplayNews()
        ]);
    } catch (error) {
        console.error('Error retrying fetch:', error);
        handleError(error);
    }
}

// Display Market Data with historical context
function displayMarketData(data) {
    const { us } = data;
    
    let html = `
        <div class="market-section">
            <h2 class="market-section-title">US Markets</h2>
            <div class="market-grid">
                ${renderMarketItems(us)}
            </div>
        </div>
    `;

    marketIndicators.innerHTML = html;
}

// Helper function to render market items with historical data
function renderMarketItems(items) {
    return items.map(item => {
        const quote = item.quote;
        const historical = item.historical;
        
        if (!quote) {
            return `
                <div class="market-indicator error">
                    <div class="indicator-header">
                        <div class="indicator-title">${item.name}</div>
                        <div class="indicator-symbol">${item.symbol}</div>
                    </div>
                    <div class="error-message">Unable to load data</div>
                </div>
            `;
        }

        const price = quote.c;
        const previousClose = quote.pc;
        const change = quote.change || (price - previousClose);
        const percentChange = quote.changePercent || ((change / previousClose) * 100);
        const historicalChanges = historical ? calculateChange(historical) : null;
        
        return `
            <div class="market-indicator">
                <div class="indicator-header">
                    <div class="indicator-title">
                        ${item.name}
                        <span class="indicator-description">${item.description}</span>
                    </div>
                    <div class="indicator-symbol">${item.symbol}</div>
                </div>
                <div class="indicator-value">$${Number(price).toFixed(2)}</div>
                <div class="indicator-changes">
                    <div class="indicator-change ${change >= 0 ? 'change-positive' : 'change-negative'}">
                        Today: ${change >= 0 ? '↑' : '↓'} $${Math.abs(change).toFixed(2)} (${Math.abs(percentChange).toFixed(2)}%)
                    </div>
                    ${historicalChanges ? `
                        <div class="indicator-change ${historicalChanges.weeklyChange >= 0 ? 'change-positive' : 'change-negative'}">
                            Week: ${historicalChanges.weeklyChange >= 0 ? '↑' : '↓'} ${Math.abs(historicalChanges.weeklyChange).toFixed(2)}%
                        </div>
                        <div class="indicator-change ${historicalChanges.monthlyChange >= 0 ? 'change-positive' : 'change-negative'}">
                            Month: ${historicalChanges.monthlyChange >= 0 ? '↑' : '↓'} ${Math.abs(historicalChanges.monthlyChange).toFixed(2)}%
                        </div>
                    ` : ''}
                </div>
                <div class="indicator-details">
                    <div class="detail-item">
                        <span>Open:</span>
                        <span>$${Number(quote.o).toFixed(2)}</span>
                    </div>
                    <div class="detail-item">
                        <span>High:</span>
                        <span>$${Number(quote.h).toFixed(2)}</span>
                    </div>
                    <div class="detail-item">
                        <span>Low:</span>
                        <span>$${Number(quote.l).toFixed(2)}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Helper function to calculate price change and trend
function calculateChange(historicalData) {
    if (!historicalData || !historicalData.c || historicalData.c.length < 2) return null;
    
    const prices = historicalData.c;
    const current = prices[prices.length - 1];
    const weekAgo = prices[prices.length - 6] || prices[0];
    const monthAgo = prices[0];
    
    return {
        weeklyChange: ((current - weekAgo) / weekAgo) * 100,
        monthlyChange: ((current - monthAgo) / monthAgo) * 100,
        trend: prices.slice(-7).map((price, index) => ({
            day: index,
            price: price
        }))
    };
}

// Display News Articles
function displayNews(articles) {
    newsContainer.innerHTML = articles.slice(0, 10).map(article => `
        <div class="news-item">
            <div class="news-header">
                <h3 class="news-title">${article.headline}</h3>
                <span class="news-date">${formatDate(article.datetime * 1000)}</span>
            </div>
            <p class="news-summary">${article.summary || ''}</p>
            <div class="news-meta">
                <span class="news-category">${article.category}</span>
                <a href="${article.url}" target="_blank" class="news-source">Read more at ${article.source}</a>
            </div>
        </div>
    `).join('');
}

// Format Date
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

// Financial Tips Data with categories
const financialTips = [
    {
        icon: '💰',
        title: '50/30/20 Rule',
        content: 'Allocate 50% of your income to needs, 30% to wants, and 20% to savings and debt repayment.',
        category: 'budgeting'
    },
    {
        icon: '🎯',
        title: 'Emergency Fund',
        content: 'Aim to save 3-6 months of living expenses in an easily accessible emergency fund.',
        category: 'savings'
    },
    {
        icon: '📊',
        title: 'Diversification',
        content: 'Don\'t put all your eggs in one basket. Spread your investments across different asset classes.',
        category: 'investing'
    },
    {
        icon: '💳',
        title: 'Credit Score',
        content: 'Maintain a good credit score by paying bills on time and keeping credit utilization below 30%.',
        category: 'credit'
    },
    {
        icon: '📈',
        title: 'Compound Interest',
        content: 'Start investing early to take advantage of compound interest over time.',
        category: 'investing'
    },
    {
        icon: '🏦',
        title: 'Automate Savings',
        content: 'Set up automatic transfers to your savings account on payday to ensure consistent saving.',
        category: 'savings'
    },
    {
        icon: '📱',
        title: 'Track Expenses',
        content: 'Use budgeting apps to track your daily expenses and identify areas where you can cut back.',
        category: 'budgeting'
    },
    {
        icon: '🎓',
        title: 'Student Loans',
        content: 'Consider refinancing student loans when interest rates are low to save money over time.',
        category: 'debt'
    },
    {
        icon: '🏠',
        title: 'Housing Costs',
        content: 'Keep housing costs below 30% of your monthly income for better financial stability.',
        category: 'budgeting'
    },
    {
        icon: '🛡️',
        title: 'Insurance Coverage',
        content: 'Review your insurance policies annually to ensure adequate coverage at competitive rates.',
        category: 'protection'
    }
];

// Function to get today's tip based on date
function getTodaysTip() {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    return financialTips[dayOfYear % financialTips.length];
}

// Function to get random tips excluding today's tip
function getRandomTips(count) {
    const todaysTip = getTodaysTip();
    const otherTips = financialTips.filter(tip => tip !== todaysTip);
    const shuffled = otherTips.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// Load Financial Tips with daily update feature
function loadFinancialTips() {
    const todaysTip = getTodaysTip();
    const additionalTips = getRandomTips(2); // Get 2 additional random tips
    
    tipsCarousel.innerHTML = `
        <div class="tips-header">
            <h3>Tip of the Day</h3>
            <span class="tips-date">${formatDate(new Date())}</span>
        </div>
        <div class="tip-card featured">
            <div class="tip-header">
                <span class="tip-icon">${todaysTip.icon}</span>
                <h3 class="tip-title">${todaysTip.title}</h3>
                <span class="tip-category">${todaysTip.category}</span>
            </div>
            <p class="tip-content">${todaysTip.content}</p>
        </div>
        <div class="more-tips">
            <h3>More Tips</h3>
            <div class="tips-grid">
                ${additionalTips.map(tip => `
                    <div class="tip-card">
                        <div class="tip-header">
                            <span class="tip-icon">${tip.icon}</span>
                            <h3 class="tip-title">${tip.title}</h3>
                            <span class="tip-category">${tip.category}</span>
                        </div>
                        <p class="tip-content">${tip.content}</p>
                    </div>
                `).join('')}
            </div>
        </div>
        <div class="tips-controls">
            <button onclick="refreshTips()" class="refresh-tips-btn">
                <span class="refresh-icon">🔄</span> Show More Tips
            </button>
        </div>
    `;
}

// Function to refresh tips
function refreshTips() {
    const newTips = getRandomTips(2);
    const tipsGrid = document.querySelector('.tips-grid');
    
    if (tipsGrid) {
        tipsGrid.innerHTML = newTips.map(tip => `
            <div class="tip-card">
                <div class="tip-header">
                    <span class="tip-icon">${tip.icon}</span>
                    <h3 class="tip-title">${tip.title}</h3>
                    <span class="tip-category">${tip.category}</span>
                </div>
                <p class="tip-content">${tip.content}</p>
            </div>
        `).join('');
    }
}

// Add this to your existing CSS (finance-news.css)
const tipStyles = `
.tips-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.tips-date {
    color: var(--text-secondary);
    font-size: 0.9rem;
}

.tip-card.featured {
    background: linear-gradient(145deg, var(--primary-color), var(--secondary-color));
    transform: scale(1.02);
}

.tip-category {
    background: rgba(255, 255, 255, 0.1);
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.tips-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-top: 20px;
}

.tips-controls {
    display: flex;
    justify-content: center;
    margin-top: 20px;
}

.refresh-tips-btn {
    background: var(--darker-bg);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
    padding: 10px 20px;
    border-radius: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
}

.refresh-tips-btn:hover {
    background: var(--primary-color);
    transform: translateY(-2px);
}

.refresh-icon {
    font-size: 1.2rem;
}
`;

// Add styles to the document
const styleSheet = document.createElement('style');
styleSheet.textContent = tipStyles;
document.head.appendChild(styleSheet);

// Learning Resources Data
const resources = [
    {
        title: 'Budgeting Basics',
        description: 'Learn the fundamentals of creating and maintaining a budget with practical tips and templates.',
        link: 'https://www.investopedia.com/personal-finance-4427760',
        source: 'Investopedia'
    },
    {
        title: 'Investment 101',
        description: 'A comprehensive guide to understanding different investment options and building a balanced portfolio.',
        link: 'https://www.nerdwallet.com/article/investing/how-to-start-investing',
        source: 'NerdWallet'
    },
    {
        title: 'Debt Management',
        description: 'Expert strategies for managing and reducing debt, including debt avalanche and snowball methods.',
        link: 'https://www.bankrate.com/personal-finance/debt/what-is-debt-management/',
        source: 'Bankrate'
    },
    {
        title: 'Retirement Planning',
        description: 'Essential guide to planning for retirement at any age with practical steps and calculators.',
        link: 'https://www.nerdwallet.com/h/category/retirement-planning?trk=nw_gn_6.0',
        source: 'NerdWallet'
    },
    {
        title: 'Emergency Fund Guide',
        description: 'Learn how to build and maintain an emergency fund to protect your financial future.',
        link: 'https://www.nerdwallet.com/article/banking/emergency-fund-why-it-matters',
        source: 'NerdWallet'
    },
    {
        title: 'Tax Planning Basics',
        description: 'Understanding tax basics and strategies to optimize your tax situation.',
        link: 'https://www.nerdwallet.com/h/category/tax-strategy-planning?trk=nw_gn_6.0',
        source: 'NerdWallet'
    }
];

// Load Learning Resources with enhanced display
function loadResources() {
    resourcesGrid.innerHTML = resources.map(resource => `
        <div class="resource-card">
            <h3 class="resource-title">${resource.title}</h3>
            <p class="resource-description">${resource.description}</p>
            <div class="resource-footer">
                <span class="resource-source">Source: ${resource.source}</span>
                <a href="${resource.link}" target="_blank" rel="noopener noreferrer" class="resource-link">
                    Read Article <span class="arrow">→</span>
                </a>
            </div>
        </div>
    `).join('');
}

// Add new styles for enhanced resource cards
const resourceStyles = `
.resource-card {
    position: relative;
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.resource-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.resource-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
    opacity: 0;
    transition: opacity 0.3s ease;
}

.resource-card:hover::before {
    opacity: 1;
}

.resource-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.resource-source {
    color: var(--text-secondary);
    font-size: 0.9rem;
    opacity: 0.8;
}

.resource-link {
    color: var(--primary-color);
    text-decoration: none;
    font-size: 0.95rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 5px;
    transition: all 0.3s ease;
}

.resource-link:hover {
    color: var(--secondary-color);
}

.resource-link .arrow {
    transition: transform 0.3s ease;
}

.resource-link:hover .arrow {
    transform: translateX(5px);
}
`;

// Add resource styles to the document
const resourceStyleSheet = document.createElement('style');
resourceStyleSheet.textContent = resourceStyles;
document.head.appendChild(resourceStyleSheet);

// Event Listeners
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        const category = button.getAttribute('data-category');
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        fetchAndDisplayNews(category);
    });
});

// Initialize the page
init(); 