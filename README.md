# Real-Time Market Data Dashboard

A Python-based dashboard that fetches live stock and cryptocurrency market data using `yfinance` and provides interactive, real-time charting capabilities directly in your browser. This project is built specifically to demonstrate a seamless integration between a high-performance Python FastAPI backend and a clean, responsive HTML/JS/CSS frontend—without the need for complex web frameworks.

## 🌟 Key Features

- **Real-Time Market Data**: Fetch near real-time (down to 1-minute intervals) price data for standard tickers (e.g., AAPL, TSLA) and crypto pairs (e.g., BTC-USD).
- **Technical Indicators Engine**: Dynamically toggle advanced mathematical overlays without refreshing the page:
  - **SMA** (Simple Moving Average)
  - **EMA** (Exponential Moving Average)
  - **Bollinger Bands**
  - **MACD** (Moving Average Convergence Divergence)
  - **RSI** (Relative Strength Index)
- **Interactive Aesthetics**: A fully responsive, premium dark-mode interface built with CSS glassmorphism standards.
- **Plotly.js Charting**: Next-generation dual-chart system combining candlestick traces, price line overlays, and detached oscillator graphs.
- **Auto-Refresh Daemon**: Live 10-second polling to update charting data over time automatically.

## 🛠 Tech Stack

- **Backend**: Python 3, FastAPI, Uvicorn, Pandas, Numpy
- **Data Source**: yfinance
- **Frontend**: Vanilla HTML5, CSS3, Vanilla JavaScript
- **Visualization**: Plotly.js

## 🚀 Getting Locally Setup

### Prerequisites
Make sure you have Python 3.9+ installed on your system.

### 1. Installation

Navigate into the project directory:
```bash
cd market_dashboard
```

Set up a virtual environment (highly recommended):
```bash
python3 -m venv venv
source venv/bin/activate  # Or `venv\Scripts\activate` on Windows
```

Install backend dependencies:
```bash
pip install -r backend/requirements.txt
```

### 2. Running the Application

Ensure your virtual environment is still activated, then start the FastAPI server:
```bash
uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

Open your web browser and navigate directly to:
**[http://127.0.0.1:8000](http://127.0.0.1:8000)**

## 📂 Project Structure

```
market_dashboard/
├── backend/
│   ├── data_fetcher.py   # Handles yfinance data collection & parsing
│   ├── indicators.py     # Pure pandas mathematical calculations for SMA, MACD, etc.
│   ├── main.py           # Core FastAPI application mapping and static routing
│   └── requirements.txt  # Python pip dependencies
├── frontend/
│   ├── index.html        # Main dashboard UI structure
│   ├── script.js         # REST API integration & Plotly dual-axis rendering logic
│   └── styles.css        # Premium dark-mode styling utilizing CSS variables
└── README.md
```

## ⚖️ Customization
This dashboard is completely modular. You can easily add new indicators by introducing new python functions in `indicators.py` and creating corresponding chart traces inside `script.js`.
