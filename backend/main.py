from fastapi import FastAPI, HTTPException, Query
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import pandas as pd
import numpy as np

from backend.data_fetcher import fetch_market_data
from backend.indicators import (
    calculate_sma,
    calculate_ema,
    calculate_bollinger_bands,
    calculate_macd,
    calculate_rsi
)

app = FastAPI(title="Real-Time Market Data Dashboard")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")

@app.get("/api/get-data")
def get_data(ticker: str = Query(..., description="Ticker symbol, e.g., AAPL"),
             interval: str = Query("1m", description="Data interval, e.g., 1m, 5m, 1d"),
             period: str = Query("1d", description="Total duration, e.g., 1d, 5d, 1mo"),
             indicators: str = Query("", description="Comma-separated list of indicators: sma,ema,bb,macd,rsi")):
    try:
        df = fetch_market_data(ticker, period=period, interval=interval)
        
        if indicators:
            ind_list = [i.strip().lower() for i in indicators.split(",")]
            
            if "sma" in ind_list:
                df = calculate_sma(df, window=20)
            if "ema" in ind_list:
                df = calculate_ema(df, window=20)
            if "bb" in ind_list:
                df = calculate_bollinger_bands(df, window=20, num_std=2)
            if "macd" in ind_list:
                df = calculate_macd(df)
            if "rsi" in ind_list:
                df = calculate_rsi(df, window=14)
                
        # Handle infinities
        df = df.replace([np.inf, -np.inf], np.nan)
        
        # Convert to dictionary
        records = df.to_dict(orient="records")
        
        # Manually safely replace NaN with None for valid JSON serialization
        cleaned_records = []
        for r in records:
            clean_dict = {}
            for k, v in r.items():
                if pd.isna(v):
                    clean_dict[k] = None
                else:
                    clean_dict[k] = v
            cleaned_records.append(clean_dict)
            
        return {"ticker": ticker.upper(), "data": cleaned_records}
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

# Mount the static frontend files
if os.path.exists(FRONTEND_DIR):
    app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
else:
    @app.get("/")
    def serve_fallback():
        return {"message": "Frontend directory not found. API is running."}
