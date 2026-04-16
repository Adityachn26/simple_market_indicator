import pandas as pd

def calculate_sma(df: pd.DataFrame, window: int = 20) -> pd.DataFrame:
    df[f'SMA'] = df['Close'].rolling(window=window).mean()
    return df

def calculate_ema(df: pd.DataFrame, window: int = 20) -> pd.DataFrame:
    df[f'EMA'] = df['Close'].ewm(span=window, adjust=False).mean()
    return df

def calculate_bollinger_bands(df: pd.DataFrame, window: int = 20, num_std: int = 2) -> pd.DataFrame:
    sma = df['Close'].rolling(window=window).mean()
    std = df['Close'].rolling(window=window).std()
    df['BB_Upper'] = sma + (std * num_std)
    df['BB_Lower'] = sma - (std * num_std)
    df['BB_Middle'] = sma
    return df

def calculate_macd(df: pd.DataFrame, fast: int = 12, slow: int = 26, signal: int = 9) -> pd.DataFrame:
    fast_ema = df['Close'].ewm(span=fast, adjust=False).mean()
    slow_ema = df['Close'].ewm(span=slow, adjust=False).mean()
    df['MACD_Line'] = fast_ema - slow_ema
    df['MACD_Signal'] = df['MACD_Line'].ewm(span=signal, adjust=False).mean()
    df['MACD_Histogram'] = df['MACD_Line'] - df['MACD_Signal']
    return df

def calculate_rsi(df: pd.DataFrame, window: int = 14) -> pd.DataFrame:
    delta = df['Close'].diff()
    gain = (delta.where(delta > 0, 0)).fillna(0)
    loss = (-delta.where(delta < 0, 0)).fillna(0)
    
    avg_gain = gain.rolling(window=window, min_periods=1).mean()
    avg_loss = loss.rolling(window=window, min_periods=1).mean()
    
    rs = avg_gain / avg_loss
    df['RSI'] = 100 - (100 / (1 + rs))
    return df
