"""
Fetch REAL monthly closing prices (Jan 2014 - Dec 2024) via yfinance.
Outputs: public/data/monthly_prices_2014_2024.csv
Uses "Close" column consistently.
"""

import yfinance as yf
import pandas as pd
import os

TICKERS = {
    # Crypto
    "BTC-USD": "BTC-USD",
    "ETH-USD": "ETH-USD",
    "ADA-USD": "ADA-USD",
    "MATIC-USD": "MATIC-USD",
    "LINK-USD": "LINK-USD",
    "SOL-USD": "SOL-USD",
    "AVAX-USD": "AVAX-USD",
    # Stocks / Indices / ETFs
    "^GSPC": "^GSPC",
    "^IXIC": "^IXIC",
    "^RUT": "^RUT",
    "^FTSE": "^FTSE",
    "^N225": "^N225",
    "^GDAXI": "^GDAXI",
    "QQQ": "QQQ",
    "VTI": "VTI",
    "VNQ": "VNQ",
    # Commodities
    "GC=F": "GC=F",
    "SI=F": "SI=F",
    "CL=F": "CL=F",
    "HG=F": "HG=F",
    "NG=F": "NG=F",
}

START = "2014-01-01"
END = "2025-01-01"  # end is exclusive in yfinance, so use Jan 1 2025 to include Dec 2024

all_data = {}
failed = []

for name, ticker in TICKERS.items():
    print(f"Downloading {ticker}...")
    try:
        df = yf.download(ticker, start=START, end=END, interval="1mo", progress=False)
        if df.empty:
            print(f"  WARNING: No data returned for {ticker}")
            failed.append(ticker)
            continue

        # yfinance may return MultiIndex columns; flatten if needed
        if isinstance(df.columns, pd.MultiIndex):
            df.columns = df.columns.get_level_values(0)

        # Use Close column
        close = df["Close"].copy()
        close.index = close.index.to_period("M")
        all_data[name] = close
        print(f"  Got {len(close)} months, range: {close.index[0]} to {close.index[-1]}")
    except Exception as e:
        print(f"  FAILED: {e}")
        failed.append(ticker)

# Build full date range
full_range = pd.period_range("2014-01", "2024-12", freq="M")
result = pd.DataFrame(index=full_range)
result.index.name = "Month"

for name, series in all_data.items():
    result[name] = series

# Round to 2 decimal places
result = result.round(2)

# Save
out_dir = os.path.join(os.path.dirname(__file__), "..", "public", "data")
out_path = os.path.join(out_dir, "monthly_prices_2014_2024.csv")
result.to_csv(out_path)
print(f"\nSaved to {out_path}")
print(f"Shape: {result.shape} (months x tickers)")

# Sanity checks
print("\n=== SANITY CHECKS ===")
try:
    btc_dec2017 = result.loc["2017-12", "BTC-USD"]
    print(f"BTC-USD Dec 2017: ${btc_dec2017:,.2f}  (expected ~$13,000-$19,000)")
except Exception as e:
    print(f"BTC Dec 2017 check failed: {e}")

try:
    sp500_dec2019 = result.loc["2019-12", "^GSPC"]
    print(f"^GSPC Dec 2019:   ${sp500_dec2019:,.2f}  (expected ~$3,230)")
except Exception as e:
    print(f"S&P 500 Dec 2019 check failed: {e}")

try:
    eth_series = result["ETH-USD"].dropna()
    if len(eth_series) > 0:
        print(f"ETH-USD first available: {eth_series.index[0]}, price: ${eth_series.iloc[0]:,.2f}")
    else:
        print("ETH-USD: no data available")
except Exception as e:
    print(f"ETH first month check failed: {e}")

if failed:
    print(f"\nFAILED tickers: {failed}")
else:
    print("\nAll tickers downloaded successfully.")

# Show NaN summary
nan_counts = result.isna().sum()
has_gaps = nan_counts[nan_counts > 0]
if len(has_gaps) > 0:
    print("\nTickers with missing months (NaN count):")
    for t, c in has_gaps.items():
        first_valid = result[t].first_valid_index()
        print(f"  {t}: {c} missing months, first data: {first_valid}")
