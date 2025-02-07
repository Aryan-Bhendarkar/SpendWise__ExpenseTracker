// API Key for Finnhub
const FINNHUB_API_KEY = 'cuj62g1r01qm7p9ndn2gcuj62g1r01qm7p9ndn30';

// DOM Elements
const marketIndicators = document.getElementById('marketIndicators');
const newsContainer = document.getElementById('newsContainer');
const tipsCarousel = document.getElementById('tipsCarousel');
const resourcesGrid = document.getElementById('resourcesGrid');
const filterButtons = document.querySelectorAll('.filter-btn');
const newsletterForm = document.getElementById('newsletterForm');

// Market Data with both US and Indian markets
const marketIndices = [
    // Indian Indices
    {
        symbol: 'NSEI',
        name: 'Nifty 50',
        currency: 'INR',
        isIndian: true,
        sector: 'Index',
        type: 'index'
    },
    {
        symbol: 'BSESN',
        name: 'BSE SENSEX',
        currency: 'INR',
        isIndian: true,
        sector: 'Index',
        type: 'index'
    },
    {
        symbol: 'BANKNIFTY',
        name: 'Bank Nifty',
        currency: 'INR',
        isIndian: true,
        sector: 'Index',
        type: 'index'
    },
    // Banking & Financial Services
    {
        symbol: 'HDFCBANK',
        name: 'HDFC Bank',
        currency: 'INR',
        isIndian: true,
        sector: 'Banking'
    },
    {
        symbol: 'ICICIBANK',
        name: 'ICICI Bank',
        currency: 'INR',
        isIndian: true,
        sector: 'Banking'
    },
    {
        symbol: 'SBIN',
        name: 'State Bank of India',
        currency: 'INR',
        isIndian: true,
        sector: 'Banking'
    },
    {
        symbol: 'BAJFINANCE',
        name: 'Bajaj Finance',
        currency: 'INR',
        isIndian: true,
        sector: 'Financial Services'
    },
    // IT & Technology
    {
        symbol: 'TCS',
        name: 'Tata Consultancy',
        currency: 'INR',
        isIndian: true,
        sector: 'IT'
    },
    {
        symbol: 'INFY',
        name: 'Infosys',
        currency: 'INR',
        isIndian: true,
        sector: 'IT'
    },
    {
        symbol: 'WIPRO',
        name: 'Wipro Ltd',
        currency: 'INR',
        isIndian: true,
        sector: 'IT'
    },
    {
        symbol: 'HCLTECH',
        name: 'HCL Technologies',
        currency: 'INR',
        isIndian: true,
        sector: 'IT'
    },
    // Energy & Oil
    {
        symbol: 'RELIANCE',
        name: 'Reliance Industries',
        currency: 'INR',
        isIndian: true,
        sector: 'Energy'
    },
    {
        symbol: 'ONGC',
        name: 'Oil & Natural Gas',
        currency: 'INR',
        isIndian: true,
        sector: 'Energy'
    },
    {
        symbol: 'POWERGRID',
        name: 'Power Grid Corp',
        currency: 'INR',
        isIndian: true,
        sector: 'Energy'
    },
    // Automotive
    {
        symbol: 'TATAMOTORS',
        name: 'Tata Motors',
        currency: 'INR',
        isIndian: true,
        sector: 'Automotive'
    },
    {
        symbol: 'MARUTI',
        name: 'Maruti Suzuki',
        currency: 'INR',
        isIndian: true,
        sector: 'Automotive'
    },
    {
        symbol: 'M&M',
        name: 'Mahindra & Mahindra',
        currency: 'INR',
        isIndian: true,
        sector: 'Automotive'
    },
    // Consumer Goods
    {
        symbol: 'HINDUNILVR',
        name: 'Hindustan Unilever',
        currency: 'INR',
        isIndian: true,
        sector: 'Consumer Goods'
    },
    {
        symbol: 'ITC',
        name: 'ITC Limited',
        currency: 'INR',
        isIndian: true,
        sector: 'Consumer Goods'
    },
    {
        symbol: 'NESTLEIND',
        name: 'Nestle India',
        currency: 'INR',
        isIndian: true,
        sector: 'Consumer Goods'
    },
    // Pharma & Healthcare
    {
        symbol: 'SUNPHARMA',
        name: 'Sun Pharma',
        currency: 'INR',
        isIndian: true,
        sector: 'Healthcare'
    },
    {
        symbol: 'DRREDDY',
        name: 'Dr Reddys Labs',
        currency: 'INR',
        isIndian: true,
        sector: 'Healthcare'
    },
    {
        symbol: 'DIVISLAB',
        name: 'Divi\'s Labs',
        currency: 'INR',
        isIndian: true,
        sector: 'Healthcare'
    },
    // US Market Section
    { 
        symbol: 'SPY',
        name: 'S&P 500 ETF',
        currency: 'USD',
        isIndian: false,
        sector: 'Index',
        type: 'index'
    },
    { 
        symbol: 'QQQ',
        name: 'NASDAQ ETF',
        currency: 'USD',
        isIndian: false,
        sector: 'Index',
        type: 'index'
    },
    { 
        symbol: 'AAPL',
        name: 'Apple Inc.',
        currency: 'USD',
        isIndian: false,
        sector: 'Technology'
    },
    { 
        symbol: 'MSFT',
        name: 'Microsoft',
        currency: 'USD',
        isIndian: false,
        sector: 'Technology'
    }
];

// Fallback market data for when API fails
const fallbackData = {
    'NSEI': { c: 22012.45, pc: 21982.80, o: 21990.15, h: 22039.25, l: 21961.70 },
    'BSESN': { c: 72568.25, pc: 72470.30, o: 72485.60, h: 72650.40, l: 72380.15 },
    'BANKNIFTY': { c: 46785.90, pc: 46650.25, o: 46670.80, h: 46820.35, l: 46580.45 },
    'HDFCBANK': { c: 1475.60, pc: 1468.90, o: 1470.25, h: 1478.50, l: 1465.30 },
    'ICICIBANK': { c: 1028.75, pc: 1022.40, o: 1024.50, h: 1030.80, l: 1020.15 },
    'SBIN': { c: 628.45, pc: 625.80, o: 626.90, h: 630.25, l: 624.50 },
    'BAJFINANCE': { c: 6890.25, pc: 6845.70, o: 6855.40, h: 6905.80, l: 6830.25 },
    'TCS': { c: 3985.60, pc: 3965.30, o: 3970.45, h: 3990.80, l: 3960.25 },
    'INFY': { c: 1565.80, pc: 1558.40, o: 1560.25, h: 1570.45, l: 1555.30 },
    'WIPRO': { c: 485.25, pc: 482.90, o: 483.50, h: 486.70, l: 481.80 },
    'HCLTECH': { c: 1685.40, pc: 1675.60, o: 1678.30, h: 1690.25, l: 1672.45 },
    'RELIANCE': { c: 2890.75, pc: 2875.40, o: 2880.25, h: 2895.60, l: 2870.30 },
    'ONGC': { c: 275.60, pc: 273.80, o: 274.25, h: 276.90, l: 273.15 },
    'POWERGRID': { c: 285.45, pc: 283.70, o: 284.15, h: 286.80, l: 283.20 },
    'TATAMOTORS': { c: 985.25, pc: 978.60, o: 980.45, h: 988.70, l: 976.30 },
    'MARUTI': { c: 10245.80, pc: 10180.40, o: 10195.60, h: 10280.35, l: 10165.25 },
    'M&M': { c: 1685.40, pc: 1675.60, o: 1678.90, h: 1690.25, l: 1672.45 },
    'HINDUNILVR': { c: 2485.60, pc: 2475.30, o: 2478.45, h: 2490.80, l: 2470.25 },
    'ITC': { c: 428.75, pc: 426.40, o: 427.25, h: 430.60, l: 425.80 },
    'NESTLEIND': { c: 24850.60, pc: 24780.30, o: 24805.45, h: 24890.80, l: 24760.25 },
    'SUNPHARMA': { c: 1385.45, pc: 1378.60, o: 1380.25, h: 1390.70, l: 1375.30 },
    'DRREDDY': { c: 5785.60, pc: 5755.30, o: 5765.45, h: 5795.80, l: 5745.25 },
    'DIVISLAB': { c: 3685.75, pc: 3665.40, o: 3670.25, h: 3695.60, l: 3660.30 },
    'SPY': { c: 508.75, pc: 506.40, o: 507.25, h: 509.60, l: 505.80 },
    'QQQ': { c: 438.60, pc: 436.30, o: 437.45, h: 439.80, l: 435.25 },
    'AAPL': { c: 185.85, pc: 184.60, o: 185.25, h: 186.70, l: 184.30 },
    'MSFT': { c: 415.45, pc: 413.60, o: 414.25, h: 416.90, l: 413.15 }
};

// Initialize the page
async function init() {
    await Promise.all([
        fetchMarketData(),
        fetchFinancialNews(),
        loadFinancialTips(),
        loadResources()
    ]);
}

// Fetch Market Data with fallback
async function fetchMarketData() {
    try {
        marketIndicators.classList.add('loading');
        marketIndicators.innerHTML = '<p>Loading market data...</p>';
        
        const promises = marketIndices.map(async index => {
            try {
                // Try to fetch from API first
                const quoteResponse = await fetch(`https://finnhub.io/api/v1/quote?symbol=${index.symbol}&token=${FINNHUB_API_KEY}`);
                if (!quoteResponse.ok) {
                    throw new Error(`Failed to fetch quote data for ${index.symbol}`);
                }
                const quoteData = await quoteResponse.json();
                
                // Check if we got valid quote data
                if (!quoteData.c || quoteData.c === 0) {
                    throw new Error(`Invalid quote data for ${index.symbol}`);
                }
                
                return { 
                    ...index, 
                    quote: quoteData,
                    company: {},
                    usedFallback: false
                };
            } catch (error) {
                console.warn(`Using fallback data for ${index.symbol}:`, error);
                // Use fallback data
                return {
                    ...index,
                    quote: fallbackData[index.symbol],
                    company: {},
                    usedFallback: true
                };
            }
        });

        const results = await Promise.all(promises);
        displayMarketData(results);
        
        // Show warning if using fallback data
        const usedFallback = results.some(result => result.usedFallback);
        if (usedFallback) {
            showFallbackWarning();
        }
    } catch (error) {
        console.error('Error fetching market data:', error);
        // Use all fallback data if everything fails
        const fallbackResults = marketIndices.map(index => ({
            ...index,
            quote: fallbackData[index.symbol],
            company: {},
            usedFallback: true
        }));
        displayMarketData(fallbackResults);
        showFallbackWarning();
    } finally {
        marketIndicators.classList.remove('loading');
    }
}

// Display Market Data with enhanced information
function displayMarketData(data) {
    // First show indices
    const indices = data.filter(item => item.type === 'index' && item.isIndian);
    
    // Group other Indian stocks by sector
    const indianStocks = data.filter(item => item.isIndian && !item.type);
    const sectors = [...new Set(indianStocks.map(item => item.sector))];
    
    // US markets
    const usMarkets = data.filter(item => !item.isIndian);

    let html = `
        <div class="market-section-title">Indian Indices</div>
        <div class="market-grid">
            ${renderMarketItems(indices)}
        </div>
    `;

    // Add each sector
    sectors.forEach(sector => {
        const sectorStocks = indianStocks.filter(item => item.sector === sector);
        html += `
            <div class="market-section-title">${sector}</div>
            <div class="market-grid">
                ${renderMarketItems(sectorStocks)}
            </div>
        `;
    });

    // Add US markets
    html += `
        <div class="market-section-title">US Markets</div>
        <div class="market-grid">
            ${renderMarketItems(usMarkets)}
        </div>
    `;

    marketIndicators.innerHTML = html;
}

// Helper function to render market items
function renderMarketItems(items) {
    return items.map(item => {
        const price = item.quote.c;
        const previousClose = item.quote.pc;
        const change = price - previousClose;
        const percentChange = (change / previousClose) * 100;
        const isPositive = change > 0;
        const currencySymbol = item.currency === 'INR' ? '₹' : '$';

        return `
            <div class="market-indicator">
                <div class="indicator-header">
                    <div class="indicator-title">
                        ${item.name}
                        ${item.company.logo ? `<img src="${item.company.logo}" alt="${item.name} logo" class="company-logo">` : ''}
                    </div>
                    <div class="indicator-symbol">${item.symbol}</div>
                </div>
                <div class="indicator-value">${currencySymbol}${price.toFixed(2)}</div>
                <div class="indicator-change ${isPositive ? 'change-positive' : 'change-negative'}">
                    ${isPositive ? '↑' : '↓'} ${currencySymbol}${Math.abs(change).toFixed(2)} (${Math.abs(percentChange).toFixed(2)}%)
                </div>
                <div class="indicator-details">
                    <div class="detail-item">
                        <span>Open:</span>
                        <span>${currencySymbol}${item.quote.o.toFixed(2)}</span>
                    </div>
                    <div class="detail-item">
                        <span>High:</span>
                        <span>${currencySymbol}${item.quote.h.toFixed(2)}</span>
                    </div>
                    <div class="detail-item">
                        <span>Low:</span>
                        <span>${currencySymbol}${item.quote.l.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Fetch Financial News using Finnhub
async function fetchFinancialNews(category = 'general') {
    try {
        newsContainer.classList.add('loading');
        
        // Get current date and date from 7 days ago
        const toDate = Math.floor(Date.now() / 1000);
        const fromDate = toDate - (7 * 24 * 60 * 60); // 7 days ago
        
        let query = '';
        switch(category) {
            case 'market':
                query = 'stock market';
                break;
            case 'economy':
                query = 'economy';
                break;
            case 'personal':
                query = 'personal finance';
                break;
            default:
                query = 'finance';
        }
        
        const response = await fetch(`https://finnhub.io/api/v1/news?category=general&token=${FINNHUB_API_KEY}`);
        const articles = await response.json();
        
        // Filter articles based on category if needed
        const filteredArticles = category === 'all' 
            ? articles 
            : articles.filter(article => 
                article.category.toLowerCase().includes(category) ||
                article.headline.toLowerCase().includes(query)
              );
        
        displayNews(filteredArticles);
    } catch (error) {
        console.error('Error fetching news:', error);
        newsContainer.innerHTML = '<p class="error">Failed to load news</p>';
    } finally {
        newsContainer.classList.remove('loading');
    }
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

// Financial Tips Data
const financialTips = [
    {
        icon: '💰',
        title: '50/30/20 Rule',
        content: 'Allocate 50% of your income to needs, 30% to wants, and 20% to savings and debt repayment.'
    },
    {
        icon: '🎯',
        title: 'Emergency Fund',
        content: 'Aim to save 3-6 months of living expenses in an easily accessible emergency fund.'
    },
    {
        icon: '📊',
        title: 'Diversification',
        content: 'Don\'t put all your eggs in one basket. Spread your investments across different asset classes.'
    },
    {
        icon: '💳',
        title: 'Credit Score',
        content: 'Maintain a good credit score by paying bills on time and keeping credit utilization below 30%.'
    },
    {
        icon: '📈',
        title: 'Compound Interest',
        content: 'Start investing early to take advantage of compound interest over time.'
    }
];

// Load Financial Tips
function loadFinancialTips() {
    tipsCarousel.innerHTML = financialTips.map(tip => `
        <div class="tip-card">
            <div class="tip-header">
                <span class="tip-icon">${tip.icon}</span>
                <h3 class="tip-title">${tip.title}</h3>
            </div>
            <p class="tip-content">${tip.content}</p>
        </div>
    `).join('');
}

// Learning Resources Data
const resources = [
    {
        title: 'Budgeting Basics',
        description: 'Learn the fundamentals of creating and maintaining a budget.',
        link: '#'
    },
    {
        title: 'Investment 101',
        description: 'Understanding different investment options and strategies.',
        link: '#'
    },
    {
        title: 'Debt Management',
        description: 'Strategies for managing and reducing debt effectively.',
        link: '#'
    },
    {
        title: 'Retirement Planning',
        description: 'Planning for a secure financial future.',
        link: '#'
    }
];

// Load Learning Resources
function loadResources() {
    resourcesGrid.innerHTML = resources.map(resource => `
        <div class="resource-card">
            <h3 class="resource-title">${resource.title}</h3>
            <p class="resource-description">${resource.description}</p>
            <a href="${resource.link}" class="resource-link">Learn More →</a>
        </div>
    `).join('');
}

// Event Listeners
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        fetchFinancialNews(button.dataset.category);
    });
});

newsletterForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('emailInput').value;
    
    // Here you would typically send this to your backend
    console.log('Newsletter subscription:', email);
    alert('Thank you for subscribing!');
    newsletterForm.reset();
});

// Auto-refresh market data every 5 minutes
setInterval(fetchMarketData, 300000);

// Initialize the page
init();

// Show warning for fallback data
function showFallbackWarning() {
    const warningDiv = document.createElement('div');
    warningDiv.className = 'fallback-warning';
    warningDiv.innerHTML = `
        <p>⚠️ Using demo market data. For real-time data, please add your Finnhub API key.</p>
        <button onclick="fetchMarketData()" class="retry-button">Retry with API</button>
    `;
    
    // Insert warning at the top of market section
    marketIndicators.insertBefore(warningDiv, marketIndicators.firstChild);
} 