const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return { 
            statusCode: 405, 
            body: JSON.stringify({ error: 'Method Not Allowed' }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        };
    }

    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: ''
        };
    }

    try {
        const { userMessage } = JSON.parse(event.body);
        
        if (!process.env.GROQ_API_KEY) {
            throw new Error('GROQ_API_KEY is not configured');
        }

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
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
                ]
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`API request failed: ${response.status} ${error}`);
        }

        const data = await response.json();
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(data)
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                error: 'Failed to process request',
                message: error.message 
            })
        };
    }
};
