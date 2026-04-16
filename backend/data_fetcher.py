import yfinance as yf
import pandas as pd

def fetch_market_data(ticker_symbol: str, period: str = "1d", interval: str = "1m") -> pd.DataFrame:
    """
    Fetches market data for a given ticker using yfinance.
    Use interval='1m' and period='1d' for near real-time intraday data.
    """
    ticker = yf.Ticker(ticker_symbol)
    df = ticker.history(period=period, interval=interval)
    
    if df.empty:
        raise ValueError(f"No data found for ticker {ticker_symbol}")
        
    # Reset index to make Date/Datetime a regular column for JSON serialization
    df.reset_index(inplace=True)
    
    # Rename 'Datetime' or 'Date' to a standard 'Time' column
    if 'Datetime' in df.columns:
        df.rename(columns={'Datetime': 'Time'}, inplace=True)
    elif 'Date' in df.columns:
        df.rename(columns={'Date': 'Time'}, inplace=True)
        
    # Convert 'Time' to string format for easier JSON handling
    df['Time'] = df['Time'].astype(str)
    
    return df
