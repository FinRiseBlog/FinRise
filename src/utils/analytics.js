// Analytics Module for FinRise
// This module provides analytics tracking functionality for the website

// Initialize analytics
let analyticsData = {
    pageViews: {},
    articleViews: {},
    userInteractions: [],
    toolUsage: {}
};

// Load analytics data from localStorage if available
function loadAnalyticsData() {
    const savedData = localStorage.getItem('finriseAnalytics');
    if (savedData) {
        try {
            analyticsData = JSON.parse(savedData);
        } catch (error) {
            console.error('Error loading analytics data:', error);
            // Reset analytics data if there's an error
            resetAnalyticsData();
        }
    }
}

// Save analytics data to localStorage
function saveAnalyticsData() {
    try {
        localStorage.setItem('finriseAnalytics', JSON.stringify(analyticsData));
    } catch (error) {
        console.error('Error saving analytics data:', error);
    }
}

// Reset analytics data
function resetAnalyticsData() {
    analyticsData = {
        pageViews: {},
        articleViews: {},
        userInteractions: [],
        toolUsage: {}
    };
    saveAnalyticsData();
}

// Track page view
function trackPageView(pagePath) {
    // Get current date for daily tracking
    const today = new Date().toISOString().split('T')[0];
    
    // Initialize page data if it doesn't exist
    if (!analyticsData.pageViews[pagePath]) {
        analyticsData.pageViews[pagePath] = {};
    }
    
    // Initialize date data if it doesn't exist
    if (!analyticsData.pageViews[pagePath][today]) {
        analyticsData.pageViews[pagePath][today] = 0;
    }
    
    // Increment page view count
    analyticsData.pageViews[pagePath][today]++;
    
    // Save analytics data
    saveAnalyticsData();
}

// Track article view
function trackArticleView(articleId, articleTitle) {
    // Get current date for daily tracking
    const today = new Date().toISOString().split('T')[0];
    
    // Initialize article data if it doesn't exist
    if (!analyticsData.articleViews[articleId]) {
        analyticsData.articleViews[articleId] = {
            title: articleTitle,
            views: {}
        };
    }
    
    // Initialize date data if it doesn't exist
    if (!analyticsData.articleViews[articleId].views[today]) {
        analyticsData.articleViews[articleId].views[today] = 0;
    }
    
    // Increment article view count
    analyticsData.articleViews[articleId].views[today]++;
    
    // Save analytics data
    saveAnalyticsData();
}

// Track user interaction
function trackInteraction(interactionType, details = {}) {
    // Create interaction object
    const interaction = {
        type: interactionType,
        timestamp: new Date().toISOString(),
        details: details
    };
    
    // Add interaction to array
    analyticsData.userInteractions.push(interaction);
    
    // Limit the number of stored interactions to prevent localStorage overflow
    if (analyticsData.userInteractions.length > 1000) {
        analyticsData.userInteractions = analyticsData.userInteractions.slice(-1000);
    }
    
    // Save analytics data
    saveAnalyticsData();
}

// Track tool usage
function trackToolUsage(toolName) {
    // Get current date for daily tracking
    const today = new Date().toISOString().split('T')[0];
    
    // Initialize tool data if it doesn't exist
    if (!analyticsData.toolUsage[toolName]) {
        analyticsData.toolUsage[toolName] = {};
    }
    
    // Initialize date data if it doesn't exist
    if (!analyticsData.toolUsage[toolName][today]) {
        analyticsData.toolUsage[toolName][today] = 0;
    }
    
    // Increment tool usage count
    analyticsData.toolUsage[toolName][today]++;
    
    // Save analytics data
    saveAnalyticsData();
}

// Get analytics data for dashboard
function getAnalyticsData() {
    return analyticsData;
}

// Get total page views
function getTotalPageViews() {
    let total = 0;
    
    // Sum up all page views
    Object.keys(analyticsData.pageViews).forEach(page => {
        Object.keys(analyticsData.pageViews[page]).forEach(date => {
            total += analyticsData.pageViews[page][date];
        });
    });
    
    return total;
}

// Get total article views
function getTotalArticleViews() {
    let total = 0;
    
    // Sum up all article views
    Object.keys(analyticsData.articleViews).forEach(articleId => {
        Object.keys(analyticsData.articleViews[articleId].views).forEach(date => {
            total += analyticsData.articleViews[articleId].views[date];
        });
    });
    
    return total;
}

// Get most viewed articles
function getMostViewedArticles(limit = 5) {
    // Create array of articles with total views
    const articles = Object.keys(analyticsData.articleViews).map(articleId => {
        let totalViews = 0;
        
        Object.keys(analyticsData.articleViews[articleId].views).forEach(date => {
            totalViews += analyticsData.articleViews[articleId].views[date];
        });
        
        return {
            id: articleId,
            title: analyticsData.articleViews[articleId].title,
            views: totalViews
        };
    });
    
    // Sort articles by views (descending)
    articles.sort((a, b) => b.views - a.views);
    
    // Return top articles
    return articles.slice(0, limit);
}

// Get most used tools
function getMostUsedTools(limit = 5) {
    // Create array of tools with total usage
    const tools = Object.keys(analyticsData.toolUsage).map(toolName => {
        let totalUsage = 0;
        
        Object.keys(analyticsData.toolUsage[toolName]).forEach(date => {
            totalUsage += analyticsData.toolUsage[toolName][date];
        });
        
        return {
            name: toolName,
            usage: totalUsage
        };
    });
    
    // Sort tools by usage (descending)
    tools.sort((a, b) => b.usage - a.usage);
    
    // Return top tools
    return tools.slice(0, limit);
}

// Get recent user interactions
function getRecentInteractions(limit = 10) {
    // Return most recent interactions
    return analyticsData.userInteractions.slice(-limit).reverse();
}

// Initialize analytics
loadAnalyticsData();

// Export analytics functions
window.trackPageView = trackPageView;
window.trackArticleView = trackArticleView;
window.trackInteraction = trackInteraction;
window.trackToolUsage = trackToolUsage;
window.getAnalyticsData = getAnalyticsData;
window.getTotalPageViews = getTotalPageViews;
window.getTotalArticleViews = getTotalArticleViews;
window.getMostViewedArticles = getMostViewedArticles;
window.getMostUsedTools = getMostUsedTools;
window.getRecentInteractions = getRecentInteractions;
window.resetAnalyticsData = resetAnalyticsData;