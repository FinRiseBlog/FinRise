// Groq API Configuration
const GROQ_API_KEY = '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';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Function to get response from Groq API
async function getGroqResponse(userMessage) {
    try {
        // Show typing indicator
        showTypingIndicator();
        
        // Prepare the request
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama3-70b-8192',
                messages: [
                    {
                        role: 'system',
                        content: `You are a helpful AI assistant for FinRise, a finance education platform for Gen Z users. 
                        Your name is FinBot. You provide clear, concise, and accurate information about personal finance topics 
                        including budgeting, saving, investing, credit, debt management, and financial planning. 
                        Your tone is friendly, conversational, and encouraging. You avoid jargon and explain concepts in simple terms.
                        You should tailor your advice to young adults (18-25) who are likely new to managing their finances.
                        
                        When appropriate, suggest relevant FinRise blog articles or tools that might help the user.
                        
                        Available blog articles:
                        1. "Getting Started with Investing: A Gen Z Guide" - For questions about beginning to invest
                        2. "The 50/30/20 Rule: Budgeting Made Simple" - For budgeting questions
                        3. "Automate Your Savings: Set It and Forget It" - For saving strategy questions
                        4. "Understanding Credit Scores: Why They Matter for Gen Z" - For credit-related questions
                        5. "Side Hustles for College Students: Earn While You Learn" - For income questions
                        
                        Available tools:
                        1. Budget Planner - Helps create a personalized budget based on income and expenses
                        2. Savings Goal Calculator - Calculates how long it will take to reach savings goals
                        3. Subscription Tracker - Tracks and analyzes subscription costs
                        
                        If asked about topics outside of personal finance, politely redirect the conversation back to financial topics.
                        If you don't know the answer to a specific financial question, acknowledge this and suggest reliable resources 
                        where they might find the information.
                        
                        Keep your responses concise (under 150 words when possible) and focused on actionable advice.`
                    },
                    {
                        role: 'user',
                        content: userMessage
                    }
                ],
                temperature: 0.7,
                max_tokens: 800
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const botResponse = data.choices[0].message.content;
        
        // Remove typing indicator and add bot response
        removeTypingIndicator();
        addMessageToChat(botResponse, 'bot');
        
        return botResponse;
    } catch (error) {
        console.error('Error getting response from Groq API:', error);
        
        // Remove typing indicator and show error message
        removeTypingIndicator();
        addMessageToChat('Sorry, I encountered an error. Please try again later.', 'bot');
        
        return null;
    }
}

// Function to show typing indicator
function showTypingIndicator() {
    const typingIndicator = document.createElement('div');
    typingIndicator.classList.add('message', 'bot-message', 'typing-indicator');
    
    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');
    
    const dots = document.createElement('div');
    dots.classList.add('typing-dots');
    
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('span');
        dot.classList.add('dot');
        dots.appendChild(dot);
    }
    
    messageContent.appendChild(dots);
    typingIndicator.appendChild(messageContent);
    
    chatMessages.appendChild(typingIndicator);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Add typing indicator styles
    const typingStyles = document.createElement('style');
    typingStyles.textContent = `
        .typing-indicator {
            display: flex;
            align-items: center;
        }
        
        .typing-dots {
            display: flex;
            gap: 4px;
        }
        
        .typing-dots .dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: var(--gray-dark);
            animation: typingAnimation 1.5s infinite ease-in-out;
        }
        
        .typing-dots .dot:nth-child(1) {
            animation-delay: 0s;
        }
        
        .typing-dots .dot:nth-child(2) {
            animation-delay: 0.3s;
        }
        
        .typing-dots .dot:nth-child(3) {
            animation-delay: 0.6s;
        }
        
        @keyframes typingAnimation {
            0%, 60%, 100% {
                transform: translateY(0);
                opacity: 0.6;
            }
            30% {
                transform: translateY(-5px);
                opacity: 1;
            }
        }
    `;
    
    if (!document.head.querySelector('style[data-typing-styles]')) {
        typingStyles.setAttribute('data-typing-styles', 'true');
        document.head.appendChild(typingStyles);
    }
}

// Function to remove typing indicator
function removeTypingIndicator() {
    const typingIndicator = document.querySelector('.typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Function to suggest relevant articles or tools based on user query
function suggestRelevantContent(userMessage) {
    const message = userMessage.toLowerCase();
    
    // Define keywords for each category
    const investingKeywords = ['invest', 'stock', 'etf', 'portfolio', 'market', 'return', 'dividend'];
    const budgetingKeywords = ['budget', '50/30/20', 'spending', 'expense', 'income', 'track', 'allocate'];
    const savingKeywords = ['save', 'automate', 'emergency fund', 'goal', 'automatic', 'direct deposit'];
    const creditKeywords = ['credit score', 'credit card', 'fico', 'loan', 'debt', 'interest rate', 'borrow'];
    const incomeKeywords = ['side hustle', 'earn', 'job', 'income', 'money', 'gig', 'freelance', 'work'];
    const toolsKeywords = ['calculator', 'planner', 'tracker', 'subscription', 'tool', 'plan', 'calculate'];
    
    // Check for matches
    let suggestions = [];
    
    if (investingKeywords.some(keyword => message.includes(keyword))) {
        suggestions.push({
            type: 'article',
            title: 'Getting Started with Investing: A Gen Z Guide',
            url: 'src/pages/article.html?id=1'
        });
    }
    
    if (budgetingKeywords.some(keyword => message.includes(keyword))) {
        suggestions.push({
            type: 'article',
            title: 'The 50/30/20 Rule: Budgeting Made Simple',
            url: 'src/pages/article.html?id=2'
        });
        
        suggestions.push({
            type: 'tool',
            title: 'Budget Planner',
            url: 'src/pages/tools.html#budget-planner'
        });
    }
    
    if (savingKeywords.some(keyword => message.includes(keyword))) {
        suggestions.push({
            type: 'article',
            title: 'Automate Your Savings: Set It and Forget It',
            url: 'src/pages/article.html?id=3'
        });
        
        suggestions.push({
            type: 'tool',
            title: 'Savings Goal Calculator',
            url: 'src/pages/tools.html#savings-calculator'
        });
    }
    
    if (creditKeywords.some(keyword => message.includes(keyword))) {
        suggestions.push({
            type: 'article',
            title: 'Understanding Credit Scores: Why They Matter for Gen Z',
            url: 'src/pages/article.html?id=4'
        });
    }
    
    if (incomeKeywords.some(keyword => message.includes(keyword))) {
        suggestions.push({
            type: 'article',
            title: 'Side Hustles for College Students: Earn While You Learn',
            url: 'src/pages/article.html?id=5'
        });
    }
    
    if (toolsKeywords.some(keyword => message.includes(keyword))) {
        suggestions.push({
            type: 'tool',
            title: 'Budget Planner',
            url: 'src/pages/tools.html#budget-planner'
        });
        
        suggestions.push({
            type: 'tool',
            title: 'Savings Goal Calculator',
            url: 'src/pages/tools.html#savings-calculator'
        });
        
        suggestions.push({
            type: 'tool',
            title: 'Subscription Tracker',
            url: 'src/pages/tools.html#subscription-tracker'
        });
    }
    
    // Limit to 2 suggestions
    return suggestions.slice(0, 2);
}

// Function to add suggestions to chat
function addSuggestionsToChatbot(suggestions) {
    if (suggestions.length === 0) return;
    
    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.classList.add('chatbot-suggestions');
    
    const heading = document.createElement('p');
    heading.classList.add('suggestions-heading');
    heading.textContent = 'You might find these helpful:';
    suggestionsContainer.appendChild(heading);
    
    const suggestionsList = document.createElement('div');
    suggestionsList.classList.add('suggestions-list');
    
    suggestions.forEach(suggestion => {
        const suggestionItem = document.createElement('a');
        suggestionItem.classList.add('suggestion-item');
        suggestionItem.href = suggestion.url;
        
        const icon = document.createElement('i');
        icon.classList.add('fas');
        icon.classList.add(suggestion.type === 'article' ? 'fa-file-alt' : 'fa-tools');
        
        const text = document.createElement('span');
        text.textContent = suggestion.title;
        
        suggestionItem.appendChild(icon);
        suggestionItem.appendChild(text);
        suggestionsList.appendChild(suggestionItem);
    });
    
    suggestionsContainer.appendChild(suggestionsList);
    chatMessages.appendChild(suggestionsContainer);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Add suggestions styles
    const suggestionsStyles = document.createElement('style');
    suggestionsStyles.textContent = `
        .chatbot-suggestions {
            margin-top: var(--spacing-md);
            margin-bottom: var(--spacing-md);
            width: 100%;
        }
        
        .suggestions-heading {
            font-size: 0.85rem;
            color: var(--gray-dark);
            margin-bottom: var(--spacing-xs);
        }
        
        .suggestions-list {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-xs);
        }
        
        .suggestion-item {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
            padding: var(--spacing-sm) var(--spacing-md);
            background-color: var(--gray-light);
            border-radius: var(--border-radius-md);
            color: var(--dark-color);
            font-size: 0.9rem;
            transition: var(--transition-fast);
        }
        
        .suggestion-item:hover {
            background-color: var(--primary-light);
            color: white;
            transform: translateY(-2px);
        }
    `;
    
    if (!document.head.querySelector('style[data-suggestions-styles]')) {
        suggestionsStyles.setAttribute('data-suggestions-styles', 'true');
        document.head.appendChild(suggestionsStyles);
    }
}

// Export functions
window.getGroqResponse = getGroqResponse;
window.suggestRelevantContent = suggestRelevantContent;
window.addSuggestionsToChatbot = addSuggestionsToChatbot;