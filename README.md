# Project of Data Visualization (COM-480)

| Student's name | SCIPER |
| -------------- | ------ |
|Nicholas Brandstätter |330394 |
|Marko Djuric |330515 |
|Toufan Kashaev |347341 |

[Milestone 1](#milestone-1) • [Milestone 2](#milestone-2) • [Milestone 3](#milestone-3)

## Milestone 1 (20th March, 5pm)

**10% of the final grade**

This is a preliminary milestone to let you set up goals for your final project and assess the feasibility of your ideas.
Please, fill the following sections about your project.

*(max. 2000 characters per section)*

### Dataset

This project is an interactive investment comparator visualizing from 2014 to 2026, the performance, volatility, and correlations across cryptocurrencies (Bitcoin, Ethereum, Solana) and traditional assets (S&P 500, NASDAQ-100/QQQ, Russell 2000/IWM, Gold, Silver, WTI Oil, US Real Estate via Case-Shiller). It uses four clean, public datasets from Kaggle and official sources, drawing from Yahoo Finance (stocks/ETFs), CoinMarketCap & CoinGecko (crypto), Macrotrends.net & Kitco (gold/silver), EIA (WTI Oil), LBMA/COMEX (metals), and FRED (housing). Preprocessing is minimal: date parsing, year-end extraction, merging, and return/volatility calculations in pandas.

#### Dataset Breakdown

* **Cryptocurrency Historical Prices** *by sudalairajkumar (Kaggle)*: 
  Daily closes for BTC (2013+), ETH (2015+), Solana.
  > **Visualization goal**: Year-end prices, performance (%), volatility and line charts.
  >
  > **Data status**: Very clean, filter years only.

* **30-yrs Stock Market Data** *by asimislam (Kaggle)*: 
  Daily adjusted closes for S&P 500, QQQ, IWM from Yahoo Finance.
  > **Visualization goal**: Multi-asset comparisons.
  >
  > **Data status**: Minor date/column cleanup.

* **Bitcoin, Gold, Oil, S&P 500** *by prasertk*, **Gold and Silver Prices** *by lbronchal (Kaggle)*: 
  Gold, Silver, WTI Oil from EIA, LBMA/COMEX, Yahoo Finance.
  > **Visualization goal**: Volatility heatmaps, inflation-hedge dashboards.
  >
  > **Data status**: Date-merge required.

* **Case-Shiller Home Price Index (CSUSHPINSA)** *from FRED*: 
  Monthly housing index.
  > **Visualization goal**: Real-estate cycle charts vs crypto volatility.
  >
  > **Data status**: Slice December values.

These datasets enable EDA and visualizations (matplotlib/seaborn, Streamlit) with no scraping and high accuracy from primary sources.

### Problematic

This project analyzes and compares different asset classes over 2014–2026, focusing on cryptocurrencies (Bitcoin, Ethereum, Solana) versus traditional investments (S&P 500, NASDAQ-100, Russell 2000, Gold, Silver, WTI Oil, and US real estate via Case-Shiller).
What are we trying to show?
The main axis is the risk-return profile and diversification potential of these assets: how do cryptocurrencies deliver dramatically higher but far more volatile returns compared to traditional assets? What patterns emerge during market cycles (crypto booms/busts vs. stable stock/real estate growth), and how do assets behave as inflation hedges during economic uncertainty? Through interactive visualizations (line charts, bar charts, heatmaps, scatter plots), We aim to reveal whether crypto acts as a true alternative asset class or simply amplifies risk.
We want this project to build an educational investment comparator letting users explore historical data to understand asset class behaviors. Our motivation stems from the growing interest in crypto among retail investors and the need for clear, data-driven comparisons to counter hype or fear. The target audience includes students, beginner investors, and finance enthusiasts seeking accessible insights without deep financial knowledge. Built in Python with Streamlit, matplotlib, and seaborn, the tool will be interactive, letting users select time periods, assets, and metrics to answer: "Is crypto worth the risk compared to gold, stocks, and real estate?"

### Exploratory Data Analysis

> The full analysis is in our Jupyter notebook [`eda.ipynb`](milestones/milestone1/eda.ipynb), which contains all the code, computed statistics, and generated visualizations ([`correlation_matrix.png`](milestones/milestone2/img/correlation_matrix.png), [`risk_return_scatter.png`](milestones/milestone2/img/risk_return_scatter.png), [`growth_by_category.png`](milestones/milestone2/img/growth_by_category.png)). Below is a summary of the key findings.

**Preprocessing.** Raw daily/monthly prices from four Kaggle datasets and FRED were reduced to year-end closing values (2014–2024), producing a dataframe of 11 rows x 10 assets. Each series was normalized to base 100 at launch. Solana has 6 missing values (2014–2019, `NaN`); all other assets have full coverage. Total missing: 6/110 cells (5.5%).

**Basic Statistics (computed via pandas).** Mean annual returns by category: Crypto +1,163% (std 2,074), Traditional +11.8% (std 15.4), Commodities +8.9% (std 23.2). Best single-year returns: Solana +11,189% (2021), Bitcoin +1,362% (2017), Ethereum +825% (2017). Worst: Solana −94% (2022), Ethereum −82% (2018), Bitcoin −74% (2018). Traditional worst: all in 2022 (S&P −19%, NASDAQ −34%, Russell −22%). Real Estate never had a negative year (min +3.9%). Correlation analysis shows BTC-ETH are strongly correlated (r = 0.69), stock indices cluster tightly (S&P/NASDAQ/Russell r = 0.82–0.89), while Gold-Silver (r = 0.70) form a separate group. Crypto to stocks correlation is moderate (r = 0.28–0.56).

**Insights.** The risk-return scatter plot reveals three distinct clusters confirming the category taxonomy. Crypto assets are extreme outliers in both return and volatility. Gold's best year was 2024 (+62%), decorrelating from equities that fell in 2022, suggesting hedging value. Real Estate shows the lowest std (3.8%) with steady positive returns, acting as a volatility anchor.

### Related work

**What others have already done with the data ?**
The datasets used have been widely explored in finance and data communities. On Kaggle, many notebooks visualize Bitcoin price evolution, crypto trends, or simple BTC vs. Gold/S&P 500 comparisons (line charts, correlation heatmaps, volatility clustering). Sites like CoinMarketCap, TradingView, and Yahoo Finance offer built-in historical charts. Macrotrends.net publishes long-term gold/oil/stock charts, and academic papers (SSRN, arXiv) analyze crypto as an asset class using FRED or EIA data.

**Why is our approach original ?**
Existing work often focuses on single assets or narrow comparisons. Our project will create an interactive, multi-asset comparator letting users dynamically select any combination of 10+ assets (crypto, stocks, commodities, real estate) across the period 2014–2024. It emphasizes visual storytelling of risk-return trade-offs and diversification through unified dashboards : normalized growth lines, annual performance bars, correlation heatmaps or Sharpe ratio scatter plots. This holistic, user-driven view is more educational and accessible than static notebooks or blog posts.

**Sources of inspiration :**
Portfolio Visualizer (interactive backtesting), TradingView correlation tools, NYT/FT interactive graphics, CoinGecko/Messari dashboards, and Tableau Public finance galleries influenced the interactive filtering, normalized price lines starting from 100, and asset color-coding.

**Previous exploration :**
We have not previously explored these datasets in another course (ML, ADA, or semester project). This is a new project built specifically for this visualization milestone.

## Milestone 2 (17th April, 5pm)

**10% of the final grade**

Full report: [milestone2.md](milestones/milestone2/milestone2.md) | [milestone2.pdf](milestones/milestone2/milestone2.pdf)

### Functional Prototype

This repository ships a working prototype of the Investment Comparator.
The core exploration loop (select assets, pick a period, see performance)
works end to end, while advanced features (risk metrics, correlation
matrix, event annotations, PDF export) are held for the final version.

**Pages**

- `/` — Main comparator: 21 assets across 3 categories, 1Y / 5Y / 10Y
  period selector, configurable investment amount, multi-asset performance
  line chart with historical event annotations, per-asset result cards,
  comparison table, and guided tour for new users.
- `/dca-calculator` — Dollar-Cost Averaging simulator: pick assets,
  monthly contribution, and horizon to see how DCA would have performed.
- `/risk-analysis` — Risk dashboard with 15 metrics (Volatility, Sharpe,
  Sortino, Max Drawdown, Beta, Alpha, Calmar, VaR, CVaR, etc.),
  correlation matrix heatmap, volatility-over-time heatmap, and
  risk-return scatter plot.
- `/portfolio-optimizer` — Markowitz efficient frontier with Max Sharpe
  and Min Variance portfolios, plus weight allocation bars.
- `/asset-evolution` — Animated Hans Rosling-style bubble chart showing
  how 21 assets evolved from 2014 to 2024 (D3.js).
- `/inflation-hedge` — Inflation-hedge analysis using real US CPI data
  from FRED (series CPIAUCSL). Compares nominal vs real returns using the
  Fisher equation, with a grouped bar chart, cumulative growth chart, and
  inflation-hedge ranking table.
- `/assistant` — Full-screen AI educational assistant (also available as a
  floating widget on every page).

### Live Demo

**[View Live Application](https://burek.vercel.app)**

The fully functional prototype is deployed and accessible at [burek.vercel.app](https://burek.vercel.app).

**Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4,
Recharts, D3.js, lucide-react, react-joyride.

## Milestone 3 (29th May, 5pm)

**80% of the final grade**

### Final Visualizations

The project now includes 7 custom interactive visualizations across 7 pages:

1. **Performance Evolution Chart** (`/`) — Normalized line chart (base 100) comparing up to 21 assets over 1Y/5Y/10Y, with toggleable historical event markers (COVID crash, crypto winter, etc.).
2. **Asset Evolution Bubble Chart** (`/asset-evolution`) — Animated Hans Rosling-style D3.js bubble chart. Play/pause/scrub through 2014–2024; bubble position encodes risk vs return, size encodes magnitude.
3. **Volatility Heatmap** (`/risk-analysis`) — D3.js heatmap showing annualized volatility per asset per year (2014–2024). Sequential green→yellow→orange→red color scale. Grey cells for assets that didn't exist yet. *Fulfills Milestone 1 planned feature.*
4. **Correlation Matrix** (`/risk-analysis`) — D3.js heatmap of pairwise asset correlations with diverging blue/red color scale and category filters.
5. **Inflation-Hedge Dashboard** (`/inflation-hedge`) — Nominal vs real return bar chart, cumulative $10k growth chart (nominal vs inflation-adjusted), and ranked hedge table. Uses real US CPI data from FRED (series CPIAUCSL, Jan 2014–Dec 2024). Real returns computed via Fisher equation: `real_return = (1 + nominal) / (1 + inflation) - 1`. *Fulfills Milestone 1 planned feature.*
6. **Efficient Frontier** (`/portfolio-optimizer`) — Markowitz Modern Portfolio Theory visualization with Max Sharpe and Min Variance optimal portfolios, plus weight allocation bars.
7. **DCA Simulator** (`/dca-calculator`) — Dual-line chart showing portfolio value vs total invested for dollar-cost averaging strategies.

### Additional Features

- **AI Educational Assistant** — Claude-powered chatbot (FastAPI + SSE streaming, deployed on Railway) available as a floating widget on every page and as a full-screen interface at `/assistant`.
- **Guided Tour** — 9-step react-joyride walkthrough for first-time visitors.
- **Risk Metrics** — 15 institutional-grade metrics per asset (Sharpe, Sortino, Alpha, Beta, Max Drawdown, VaR, CVaR, Calmar, Treynor, Information Ratio, etc.).
- **Risk-Return Scatter Plot** — Category-filtered scatter showing all assets by annualized return vs volatility.
- **PDF Export** — Generate a PDF report of the comparison results.

### Data Sources

| Dataset | Source | Period | Usage |
|---------|--------|--------|-------|
| Crypto prices (BTC, ETH, SOL, ADA, etc.) | CoinMarketCap, CoinGecko via Kaggle | 2014–2024 | Performance, volatility, correlations |
| Stock indices (S&P 500, NASDAQ, Russell 2000, etc.) | Yahoo Finance via Kaggle | 2014–2024 | Benchmark comparisons |
| Commodities (Gold, Silver, WTI Oil, Copper, Natural Gas) | EIA, LBMA/COMEX via Kaggle | 2014–2024 | Commodity performance |
| US Real Estate (Case-Shiller CSUSHPINSA) | FRED | 2014–2024 | Housing market comparison |
| US CPI (CPIAUCSL) | FRED | Jan 2014–Dec 2024 | Inflation-adjusted real return calculations |
| Correlation matrix | Pre-computed from daily returns | 2014–2024 | Asset correlation heatmap |
| Annual evolution (per-year volatility) | Pre-computed from daily returns | 2014–2024 | Volatility heatmap |

### Technical Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4
- **Charts:** Recharts (line, bar, scatter, area), D3.js (heatmaps, bubble chart)
- **UI:** lucide-react icons, react-joyride guided tour
- **AI Backend:** FastAPI + Anthropic Claude SDK, SSE streaming, deployed on Railway
- **Deployment:** Vercel (frontend), Railway (AI agent)

### Process Book

Full process book: [process-book.pdf](milestones/milestone3/process-book.pdf)


## Late policy

- < 24h: 80% of the grade for the milestone
- < 48h: 70% of the grade for the milestone


