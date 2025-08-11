// Supabase Configuration
const SUPABASE_URL = 'https://sbpublishableapi.supabase.co';
const SUPABASE_KEY = 'sb_publishable_GxkSILjR3fusTkuAw12zwQ_WpmlZb7E';

// Initialize Supabase client
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Authentication Functions
async function signUpUser(email, password, name) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name
                }
            }
        });
        
        if (error) throw error;
        
        // Create user profile in profiles table
        if (data.user) {
            await createUserProfile(data.user.id, name, email);
        }
        
        return data;
    } catch (error) {
        console.error('Error signing up:', error);
        throw error;
    }
}

async function signInUser(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        
        return data;
    } catch (error) {
        console.error('Error signing in:', error);
        throw error;
    }
}

async function signOutUser() {
    try {
        const { error } = await supabase.auth.signOut();
        
        if (error) throw error;
        
        return true;
    } catch (error) {
        console.error('Error signing out:', error);
        throw error;
    }
}

async function checkAuthState() {
    try {
        const { data } = await supabase.auth.getSession();
        
        if (data.session) {
            // User is logged in
            handleAuthStateChange(data.session.user);
        } else {
            // User is not logged in
            handleAuthStateChange(null);
        }
    } catch (error) {
        console.error('Error checking auth state:', error);
    }
}

// User Profile Functions
async function createUserProfile(userId, name, email) {
    try {
        const { error } = await supabase
            .from('profiles')
            .insert({
                id: userId,
                name,
                email,
                created_at: new Date()
            });
        
        if (error) throw error;
        
        return true;
    } catch (error) {
        console.error('Error creating user profile:', error);
        throw error;
    }
}

async function getUserProfile(userId) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        
        if (error) throw error;
        
        return data;
    } catch (error) {
        console.error('Error getting user profile:', error);
        throw error;
    }
}

async function updateUserProfile(userId, updates) {
    try {
        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId);
        
        if (error) throw error;
        
        return true;
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
}

// Article Functions
async function getFeaturedArticles() {
    try {
        const { data, error } = await supabase
            .from('articles')
            .select('*')
            .eq('is_featured', true)
            .order('created_at', { ascending: false })
            .limit(3);
        
        if (error) throw error;
        
        return data;
    } catch (error) {
        console.error('Error getting featured articles:', error);
        throw error;
    }
}

async function getAllArticles() {
    try {
        const { data, error } = await supabase
            .from('articles')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        return data;
    } catch (error) {
        console.error('Error getting all articles:', error);
        throw error;
    }
}

async function getArticleById(id) {
    try {
        const { data, error } = await supabase
            .from('articles')
            .select(`
                *,
                profiles:author_id (name)
            `)
            .eq('id', id)
            .single();
        
        if (error) throw error;
        
        return data;
    } catch (error) {
        console.error('Error getting article by ID:', error);
        throw error;
    }
}

async function createArticle(article) {
    try {
        const { data, error } = await supabase
            .from('articles')
            .insert(article)
            .select();
        
        if (error) throw error;
        
        return data[0];
    } catch (error) {
        console.error('Error creating article:', error);
        throw error;
    }
}

async function updateArticle(id, updates) {
    try {
        const { error } = await supabase
            .from('articles')
            .update(updates)
            .eq('id', id);
        
        if (error) throw error;
        
        return true;
    } catch (error) {
        console.error('Error updating article:', error);
        throw error;
    }
}

async function deleteArticle(id) {
    try {
        const { error } = await supabase
            .from('articles')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        return true;
    } catch (error) {
        console.error('Error deleting article:', error);
        throw error;
    }
}

// Comment Functions
async function getArticleComments(articleId) {
    try {
        const { data, error } = await supabase
            .from('comments')
            .select(`
                *,
                profiles:user_id (name)
            `)
            .eq('article_id', articleId)
            .order('created_at', { ascending: true });
        
        if (error) throw error;
        
        return data;
    } catch (error) {
        console.error('Error getting article comments:', error);
        throw error;
    }
}

async function createComment(comment) {
    try {
        const { data, error } = await supabase
            .from('comments')
            .insert(comment)
            .select();
        
        if (error) throw error;
        
        return data[0];
    } catch (error) {
        console.error('Error creating comment:', error);
        throw error;
    }
}

async function deleteComment(id, userId) {
    try {
        const { error } = await supabase
            .from('comments')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);
        
        if (error) throw error;
        
        return true;
    } catch (error) {
        console.error('Error deleting comment:', error);
        throw error;
    }
}

// Newsletter Functions
async function subscribeToNewsletter(email) {
    try {
        const { data, error } = await supabase
            .from('newsletter_subscribers')
            .insert({ email, subscribed_at: new Date() })
            .select();
        
        if (error) {
            // Check if error is due to duplicate email
            if (error.code === '23505') {
                throw new Error('You are already subscribed to the newsletter');
            }
            throw error;
        }
        
        return data[0];
    } catch (error) {
        console.error('Error subscribing to newsletter:', error);
        throw error;
    }
}

// Writer Authentication
async function isWriter(email) {
    try {
        const { data, error } = await supabase
            .from('writers')
            .select('*')
            .eq('email', email)
            .single();
        
        if (error) {
            if (error.code === 'PGRST116') {
                // No writer found with this email
                return false;
            }
            throw error;
        }
        
        return true;
    } catch (error) {
        console.error('Error checking writer status:', error);
        return false;
    }
}

// Initialize Supabase Tables
async function initializeSupabaseTables() {
    try {
        // Create profiles table
        const { error: profilesError } = await supabase.rpc('create_profiles_table');
        if (profilesError) throw profilesError;
        
        // Create articles table
        const { error: articlesError } = await supabase.rpc('create_articles_table');
        if (articlesError) throw articlesError;
        
        // Create comments table
        const { error: commentsError } = await supabase.rpc('create_comments_table');
        if (commentsError) throw commentsError;
        
        // Create newsletter_subscribers table
        const { error: newsletterError } = await supabase.rpc('create_newsletter_table');
        if (newsletterError) throw newsletterError;
        
        // Create writers table
        const { error: writersError } = await supabase.rpc('create_writers_table');
        if (writersError) throw writersError;
        
        // Insert sample data
        await insertSampleData();
        
        console.log('Supabase tables initialized successfully');
        return true;
    } catch (error) {
        console.error('Error initializing Supabase tables:', error);
        throw error;
    }
}

// Insert sample data
async function insertSampleData() {
    try {
        // Insert sample writers
        const writers = [
            { email: 'writer1@finrise.com', name: 'Alex Johnson' },
            { email: 'writer2@finrise.com', name: 'Maya Rodriguez' },
            { email: 'writer3@finrise.com', name: 'Jordan Lee' }
        ];
        
        const { error: writersError } = await supabase
            .from('writers')
            .insert(writers);
        
        if (writersError) throw writersError;
        
        // Insert sample articles
        const articles = [
            {
                title: 'Getting Started with Investing: A Gen Z Guide',
                content: `
# Getting Started with Investing: A Gen Z Guide

## Introduction
Investing can seem intimidating, especially when you're just starting out. But as a Gen Z, you have a powerful advantage: time. Starting early, even with small amounts, can lead to significant growth over time thanks to compound interest.

## Why Start Investing Now?
1. **Time is on your side**: The longer your money is invested, the more it can grow.
2. **Compound interest**: Your returns generate their own returns over time.
3. **Inflation protection**: Investing helps your money maintain its purchasing power.
4. **Financial independence**: Building wealth now can give you more freedom later.

## How to Start with Limited Funds
### Micro-Investing Apps
Apps like Acorns, Stash, or Robinhood allow you to start investing with just a few dollars. Some even round up your purchases and invest the spare change.

### Fractional Shares
Many brokerages now offer fractional shares, meaning you can buy a portion of expensive stocks like Amazon or Google with as little as $1.

### Index Funds and ETFs
These investment vehicles give you instant diversification by spreading your money across many companies. Look for low-cost options with expense ratios under 0.2%.

## Building Your First Portfolio
As a beginner, consider the following allocation:
- 70-80% in broad market index funds (like S&P 500)
- 10-20% in international stocks
- 5-10% in bonds or cash equivalents

## Common Mistakes to Avoid
1. **Trying to time the market**: Even professionals rarely succeed at this.
2. **Checking your investments daily**: This can lead to emotional decisions.
3. **Investing money you'll need soon**: Only invest money you won't need for at least 5 years.
4. **Ignoring fees**: High fees can significantly reduce your returns over time.

## Next Steps
1. Open an account with a reputable broker
2. Set up automatic contributions (even $10-20 per week)
3. Choose a simple, diversified investment strategy
4. Learn continuously, but don't overthink it

Remember, the best investment strategy is one you can stick with. Start small, stay consistent, and give your investments time to grow.
                `,
                summary: 'Learn the basics of investing and how to start building your portfolio with minimal funds.',
                image_url: 'src/assets/images/article1.jpg',
                category: 'Investing',
                author_id: 'writer1@finrise.com',
                is_featured: true,
                created_at: new Date()
            },
            {
                title: 'The 50/30/20 Rule: Budgeting Made Simple',
                content: `
# The 50/30/20 Rule: Budgeting Made Simple

## Introduction
Budgeting doesn't have to be complicated. The 50/30/20 rule is a straightforward budgeting method that allocates your after-tax income to three main categories: needs, wants, and savings/debt repayment.

## How the 50/30/20 Rule Works

### 50% for Needs
Half of your income goes toward necessities, including:
- Rent or mortgage payments
- Groceries
- Utilities
- Transportation
- Minimum debt payments
- Health insurance

### 30% for Wants
This category covers non-essential expenses that improve your quality of life:
- Dining out
- Entertainment subscriptions
- Shopping
- Hobbies
- Travel
- Gym memberships

### 20% for Savings and Debt Repayment
The final portion is dedicated to building financial security:
- Emergency fund contributions
- Retirement savings
- Investments
- Extra debt payments (beyond minimums)

## Implementing the 50/30/20 Rule

### Step 1: Calculate Your After-Tax Income
This is your take-home pay after taxes and other deductions like health insurance or 401(k) contributions.

### Step 2: Track Your Spending
For one month, record all your expenses and categorize them as needs, wants, or savings/debt repayment.

### Step 3: Analyze and Adjust
Compare your actual spending to the 50/30/20 targets. If you're spending too much in one category, look for ways to reduce those expenses.

### Step 4: Create a Plan
Based on your analysis, create a spending plan that aligns with the 50/30/20 rule.

## Common Challenges and Solutions

### Living in a High-Cost Area
If housing costs more than 30% of your income:
- Consider roommates
- Look for more affordable neighborhoods
- Reduce other "needs" expenses

### High Debt Burden
If minimum debt payments exceed 20% of your income:
- Consider debt consolidation
- Negotiate with creditors
- Temporarily allocate more than 20% to debt repayment

### Irregular Income
If your income varies month to month:
- Budget based on your lowest monthly income
- Save extra income during good months
- Build a larger emergency fund

## Benefits of the 50/30/20 Rule
- **Simplicity**: Easy to understand and implement
- **Flexibility**: Adapts to different income levels and lifestyles
- **Balance**: Allows for enjoyment while building financial security
- **Sustainability**: Realistic approach that you can maintain long-term

## Final Thoughts
The 50/30/20 rule isn't rigid—it's a guideline to help you create a balanced financial life. Adjust the percentages to fit your unique situation while maintaining the core principle of balancing current needs, lifestyle choices, and future financial goals.
                `,
                summary: 'Master the popular budgeting technique that allocates your income to needs, wants, and savings.',
                image_url: 'src/assets/images/article2.jpg',
                category: 'Budgeting',
                author_id: 'writer2@finrise.com',
                is_featured: true,
                created_at: new Date()
            },
            {
                title: 'Automate Your Savings: Set It and Forget It',
                content: `
# Automate Your Savings: Set It and Forget It

## Introduction
One of the most effective ways to build wealth is to make saving automatic. By removing the decision-making process from saving, you eliminate the temptation to spend that money elsewhere and ensure consistent progress toward your financial goals.

## Why Automation Works
Automation leverages behavioral psychology to your advantage:
- **Eliminates decision fatigue**: No need to decide whether to save each month
- **Reduces temptation**: Money is saved before you can spend it
- **Creates positive habits**: Consistent saving becomes your default behavior
- **Minimizes effort**: Once set up, saving requires no additional work

## Essential Automated Savings Systems

### 1. Direct Deposit Splitting
Many employers allow you to split your direct deposit between multiple accounts. Consider directing:
- 10-20% of your paycheck to a savings account
- The remainder to your checking account for expenses

### 2. Automatic Transfers
Set up recurring transfers from checking to savings accounts:
- Schedule transfers for right after payday
- Start with a small amount you won't miss
- Gradually increase the amount over time

### 3. Round-Up Apps
Apps like Acorns, Chime, and Qapital round up your purchases and save the difference:
- Buy a coffee for $4.25, and $0.75 gets saved
- These small amounts add up surprisingly quickly
- Many apps offer additional features like investing the saved money

### 4. Automated Investment Contributions
Set up automatic contributions to investment accounts:
- 401(k) or workplace retirement plans
- Individual Retirement Accounts (IRAs)
- Brokerage accounts for non-retirement goals

## Creating a Tiered Savings Approach

### Tier 1: Emergency Fund
- Automatically save until you have 3-6 months of expenses
- Keep in a high-yield savings account for accessibility

### Tier 2: Retirement Savings
- Contribute at least enough to get any employer match
- Aim to increase to 15% of income over time

### Tier 3: Short and Medium-Term Goals
- Set up separate automated savings for specific goals
- Consider using different accounts for different timeframes

## Optimizing Your Automated System

### Start Small
- Begin with just 1-2% of your income if necessary
- Increase by 1% every few months

### Time Your Automations Strategically
- Schedule transfers right after payday
- Align bill payments with your pay schedule

### Make It Difficult to Access Savings
- Use separate banks for checking and savings
- Disable easy transfers between accounts
- Consider certificates of deposit (CDs) for longer-term goals

### Review and Adjust Quarterly
- Increase savings rate after raises or debt payoffs
- Redirect completed goal savings to new priorities

## Overcoming Common Challenges

### Irregular Income
- Build a larger emergency fund first
- Set a minimum automatic savings amount
- Add manual "bonus" savings during better months

### Tight Budget
- Start with just $5-10 per week
- Look for expenses to trim
- Consider a side hustle specifically for savings

### Multiple Financial Goals
- Prioritize goals based on timeline and importance
- Split your automatic savings between multiple accounts
- Focus on one goal at a time if necessary

## Conclusion
Automating your savings is one of the most powerful financial habits you can develop. By making saving your default behavior rather than a conscious choice, you dramatically increase your chances of reaching your financial goals. Start small, be consistent, and watch your savings grow with minimal effort.
                `,
                summary: 'Discover how automation can help you save more money without even thinking about it.',
                image_url: 'src/assets/images/article3.jpg',
                category: 'Saving',
                author_id: 'writer3@finrise.com',
                is_featured: true,
                created_at: new Date()
            },
            {
                title: 'Understanding Credit Scores: Why They Matter for Gen Z',
                content: `
# Understanding Credit Scores: Why They Matter for Gen Z

## Introduction
Your credit score might seem like just a number, but it has a significant impact on your financial life. For Gen Z, building good credit early can open doors to better financial opportunities and save thousands of dollars over your lifetime.

## What Is a Credit Score?
A credit score is a three-digit number (typically between 300-850) that represents your creditworthiness. Lenders use this score to determine:
- Whether to approve your applications
- What interest rates to charge you
- What credit limits to offer

## Why Credit Scores Matter for Gen Z
1. **Apartment rentals**: Many landlords check credit scores
2. **Car loans**: Better scores mean lower interest rates
3. **Job opportunities**: Some employers check credit reports
4. **Insurance rates**: Many insurers use credit-based insurance scores
5. **Future mortgage rates**: Could save/cost you thousands over the life of a loan

## How Credit Scores Are Calculated
Your FICO score, the most widely used credit score, is based on five factors:

### Payment History (35%)
- Whether you pay bills on time
- How late payments were
- How recently they occurred

### Credit Utilization (30%)
- How much of your available credit you're using
- Aim to keep this under 30%

### Length of Credit History (15%)
- How long accounts have been open
- Age of oldest and newest accounts
- Average age of all accounts

### Credit Mix (10%)
- Types of credit (credit cards, loans, etc.)
- Having a mix of credit types can help

### New Credit (10%)
- Recent applications for credit
- Too many hard inquiries can lower your score

## Building Credit from Scratch

### Secured Credit Cards
- Require a security deposit
- Great first credit product
- Use for small purchases and pay in full

### Become an Authorized User
- Ask a family member to add you to their card
- Their good payment history can help your score
- Make sure they have good credit habits!

### Credit Builder Loans
- Specifically designed to help build credit
- You make payments before receiving the loan amount
- Available at many credit unions

### Student Credit Cards
- Designed for college students with limited credit
- Often have lower credit limits and student-focused rewards
- May have more lenient approval requirements

## Credit Score Myths Debunked

### Myth: Checking your own score lowers it
**Truth**: Checking your own score is a "soft inquiry" and doesn't affect your score.

### Myth: You need to carry a balance to build credit
**Truth**: Paying your balance in full each month is best for your score and financial health.

### Myth: Closing old accounts helps your score
**Truth**: Keeping old accounts open (especially with no annual fee) helps your length of credit history.

### Myth: You and your partner share a credit score
**Truth**: Credit scores are individual, even if you have joint accounts.

## Monitoring Your Credit

### Free Credit Reports
- Get free reports annually from annualcreditreport.com
- Check for errors and signs of identity theft

### Credit Monitoring Services
- Many banks and credit cards offer free monitoring
- Consider services like Credit Karma or Experian

## Recovering from Credit Mistakes
- **Late payments**: Get current and stay current
- **High utilization**: Pay down balances and request credit limit increases
- **Too many applications**: Wait 6-12 months between new applications
- **Collections**: Try to negotiate "pay for delete" arrangements

## Conclusion
Your credit score is a financial tool that can either work for or against you. By understanding how credit scores work and taking steps to build good credit early, you're setting yourself up for better financial opportunities throughout your life. Start small, be consistent, and watch your score grow over time.
                `,
                summary: 'Learn why your credit score matters and how to build good credit from an early age.',
                image_url: 'src/assets/images/article4.jpg',
                category: 'Credit',
                author_id: 'writer1@finrise.com',
                is_featured: false,
                created_at: new Date()
            },
            {
                title: 'Side Hustles for College Students: Earn While You Learn',
                content: `
# Side Hustles for College Students: Earn While You Learn

## Introduction
College is expensive, and balancing studies with work can be challenging. The good news is that there are numerous flexible side hustles that can help you earn money without sacrificing your academic performance. These opportunities can not only provide income but also help you gain valuable skills and experience.

## Why Start a Side Hustle in College?
- **Extra income**: Reduce student loan debt or cover living expenses
- **Flexible schedule**: Work around your classes and study time
- **Skill development**: Gain practical experience in your field of interest
- **Resume building**: Add valuable experience to your resume
- **Networking**: Connect with professionals and potential employers

## Online Side Hustles

### Content Creation
- **Blogging**: Write about your interests or expertise
- **YouTube**: Create educational or entertainment content
- **Podcasting**: Start a show about topics you're passionate about
- **Social media management**: Help small businesses with their online presence

### Freelancing
- **Writing**: Content writing, copywriting, or academic writing
- **Graphic design**: Create logos, social media graphics, or illustrations
- **Web development**: Build or maintain websites for clients
- **Virtual assistance**: Provide administrative support remotely

### Tutoring and Teaching
- **Academic tutoring**: Help other students in subjects you excel in
- **Test prep**: Assist with SAT, ACT, or graduate exam preparation
- **Language teaching**: Teach your native language to international students
- **Skill sharing**: Teach music, art, coding, or other skills

## On-Campus Opportunities

### Work-Study Programs
- **Library assistant**: Help with circulation, shelving, or research
- **Research assistant**: Support professors with their research projects
- **Campus tour guide**: Show prospective students around campus
- **Resident advisor**: Get free or reduced housing while helping other students

### Campus Services
- **IT help desk**: Provide technical support to students and faculty
- **Fitness center staff**: Work at the campus gym or recreation center
- **Event staff**: Help with campus events and activities
- **Dining services**: Work in campus cafeterias or coffee shops

## Local Community Side Hustles

### Service-Based
- **Food delivery**: Work for services like DoorDash or Uber Eats
- **Ride-sharing**: Drive for Uber or Lyft during safe hours
- **Pet sitting/dog walking**: Care for pets when owners are away
- **House sitting**: Watch homes while residents are on vacation

### Retail and Hospitality
- **Barista or server**: Work in coffee shops or restaurants
- **Retail associate**: Work in stores with student-friendly schedules
- **Brand ambassador**: Represent companies at campus events
- **Event staff**: Work at local venues for concerts or sporting events

## Entrepreneurial Ventures

### Product-Based Businesses
- **Handmade crafts**: Sell on Etsy or at campus markets
- **Print-on-demand merchandise**: Design and sell custom apparel
- **Dropshipping**: Sell products online without holding inventory
- **Flipping items**: Buy low and sell high on marketplace platforms

### Service-Based Businesses
- **Event photography**: Photograph campus events or local gatherings
- **DJ services**: Provide music for parties and events
- **Moving assistance**: Help students move in/out of dorms or apartments
- **Cleaning services**: Offer end-of-semester cleaning for dorms or apartments

## Balancing Work and Studies

### Time Management Tips
- **Set clear boundaries**: Dedicate specific hours to work and study
- **Use a planner**: Schedule all your commitments in advance
- **Prioritize academics**: Reduce work hours during exam periods
- **Take advantage of breaks**: Increase work during holidays and summer

### Avoiding Burnout
- **Be realistic**: Don't overcommit yourself
- **Schedule downtime**: Make time for rest and social activities
- **Evaluate regularly**: Assess whether your side hustle is sustainable
- **Know when to scale back**: Reduce hours if your grades start to suffer

## Legal and Financial Considerations

### Tax Obligations
- **Track your income**: Keep records of all earnings
- **Set aside money for taxes**: Self-employment income is taxable
- **Look into deductions**: Many business expenses are tax-deductible
- **Consider quarterly payments**: You may need to pay estimated taxes

### Business Regulations
- **Check campus policies**: Some schools restrict certain types of student businesses
- **Research local laws**: Ensure your side hustle complies with local regulations
- **Consider business registration**: Some ventures may require formal registration
- **Obtain necessary permits**: Certain activities require special permissions

## Conclusion
A well-chosen side hustle can provide not only financial benefits but also valuable experience and skills that will serve you well after graduation. Start small, find something that aligns with your interests and schedule, and don't be afraid to try different options until you find the right fit. With the right balance, you can successfully earn while you learn.
                `,
                summary: 'Explore flexible ways to make money while maintaining your focus on academics.',
                image_url: 'src/assets/images/article5.jpg',
                category: 'Income',
                author_id: 'writer2@finrise.com',
                is_featured: false,
                created_at: new Date()
            }
        ];
        
        const { error: articlesError } = await supabase
            .from('articles')
            .insert(articles);
        
        if (articlesError) throw articlesError;
        
        console.log('Sample data inserted successfully');
        return true;
    } catch (error) {
        console.error('Error inserting sample data:', error);
        throw error;
    }
}

// Export functions
window.signUpUser = signUpUser;
window.signInUser = signInUser;
window.signOutUser = signOutUser;
window.checkAuthState = checkAuthState;
window.getUserProfile = getUserProfile;
window.updateUserProfile = updateUserProfile;
window.getFeaturedArticles = getFeaturedArticles;
window.getAllArticles = getAllArticles;
window.getArticleById = getArticleById;
window.createArticle = createArticle;
window.updateArticle = updateArticle;
window.deleteArticle = deleteArticle;
window.getArticleComments = getArticleComments;
window.createComment = createComment;
window.deleteComment = deleteComment;
window.subscribeToNewsletter = subscribeToNewsletter;
window.isWriter = isWriter;
window.initializeSupabaseTables = initializeSupabaseTables;