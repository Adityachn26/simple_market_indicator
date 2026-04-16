const API_URL = '/api';

// Elements
const tickerInput = document.getElementById('tickerInput');
const fetchBtn = document.getElementById('fetchBtn');
const autoRefreshSwitch = document.getElementById('autoRefresh');
const spinner = document.getElementById('spinner');
const btnText = document.getElementById('btnText');

// State
let refreshIntervalId = null;
let currentData = null;

// Indicator colors
const colors = {
    sma: '#f59e0b',
    ema: '#8b5cf6',
    bb: 'rgba(56, 189, 248, 0.4)',
    bbLine: '#38bdf8',
    macd: '#ec4899',
    macdsignal: '#64748b',
    rsi: '#10b981',
    primary: '#3b82f6',
    down: '#ef4444',
    up: '#10b981'
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchData();
    setupEventListeners();
    setupAutoRefresh();
});

function setupEventListeners() {
    fetchBtn.addEventListener('click', fetchData);
    
    // Listen for Enter key on input
    tickerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') fetchData();
    });

    // Listen to checkboxes
    const checkboxes = document.querySelectorAll('input[type="checkbox"][id^="ind-"]');
    checkboxes.forEach(cb => {
        cb.addEventListener('change', fetchData);
    });

    autoRefreshSwitch.addEventListener('change', setupAutoRefresh);
}

function setupAutoRefresh() {
    if (refreshIntervalId) {
        clearInterval(refreshIntervalId);
        refreshIntervalId = null;
    }
    
    if (autoRefreshSwitch.checked) {
        refreshIntervalId = setInterval(fetchData, 10000); // 10 seconds
    }
}

function getSelectedIndicators() {
    const selected = [];
    const checkboxes = document.querySelectorAll('input[type="checkbox"][id^="ind-"]:checked');
    checkboxes.forEach(cb => {
        selected.push(cb.value);
    });
    return selected.join(',');
}

async function fetchData() {
    const ticker = tickerInput.value.trim().toUpperCase();
    if (!ticker) return;

    setLoading(true);

    const indicators = getSelectedIndicators();
    const url = `${API_URL}/get-data?ticker=${ticker}&indicators=${indicators}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || 'Failed to fetch data');
        }
        
        const data = await response.json();
        currentData = data;
        renderCharts();
    } catch (error) {
        console.error("Error fetching data:", error);
        // We only append error if we have no data to show, otherwise silent fail to not interrupt auto-refresh
        if (!currentData) {
            alert(error.message);
        }
    } finally {
        setLoading(false);
    }
}

function setLoading(isLoading) {
    if (isLoading) {
        spinner.classList.remove('hidden');
        fetchBtn.disabled = true;
    } else {
        spinner.classList.add('hidden');
        fetchBtn.disabled = false;
    }
}

function renderCharts() {
    if (!currentData || !currentData.data || currentData.data.length === 0) return;

    const records = currentData.data;
    const ticker = currentData.ticker;
    
    const times = records.map(r => r.Time);
    const opens = records.map(r => r.Open);
    const highs = records.map(r => r.High);
    const lows = records.map(r => r.Low);
    const closes = records.map(r => r.Close);

    // Candlestick Trace
    const candlestickTrace = {
        x: times,
        open: opens,
        high: highs,
        low: lows,
        close: closes,
        type: 'candlestick',
        name: ticker,
        increasing: { line: { color: colors.up } },
        decreasing: { line: { color: colors.down } }
    };

    const traces = [candlestickTrace];
    
    const selectedInds = getSelectedIndicators().split(',').filter(Boolean);

    // 1. Overlays on Price Chart
    if (selectedInds.includes('sma') && records[0].SMA !== undefined) {
        traces.push({
            x: times,
            y: records.map(r => r.SMA),
            type: 'scatter',
            mode: 'lines',
            name: 'SMA (20)',
            line: { color: colors.sma, width: 2 }
        });
    }

    if (selectedInds.includes('ema') && records[0].EMA !== undefined) {
        traces.push({
            x: times,
            y: records.map(r => r.EMA),
            type: 'scatter',
            mode: 'lines',
            name: 'EMA (20)',
            line: { color: colors.ema, width: 2 }
        });
    }

    if (selectedInds.includes('bb') && records[0].BB_Upper !== undefined) {
        traces.push({
            x: times,
            y: records.map(r => r.BB_Upper),
            type: 'scatter',
            mode: 'lines',
            name: 'BB Upper',
            line: { color: colors.bbLine, width: 1, dash: 'dot' }
        });
        traces.push({
            x: times,
            y: records.map(r => r.BB_Lower),
            type: 'scatter',
            mode: 'lines',
            name: 'BB Lower',
            line: { color: colors.bbLine, width: 1, dash: 'dot' },
            fill: 'tonexty',
            fillcolor: colors.bb
        });
    }

    const priceLayout = {
        title: {
            text: `${ticker} Live Price`,
            font: { color: '#e2e8f0', size: 18 }
        },
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        font: { color: '#e2e8f0', family: 'Inter' },
        xaxis: { 
            gridcolor: 'rgba(255,255,255,0.1)', 
            rangeslider: { visible: false },
            type: 'category' // prevents gaps for nights/weekends in intra-day data
        },
        yaxis: { 
            gridcolor: 'rgba(255,255,255,0.1)',
            title: 'Price'
        },
        margin: { l: 50, r: 20, t: 50, b: 40 },
        showlegend: true,
        legend: { x: 0, y: 1, bgcolor: 'rgba(0,0,0,0.5)' }
    };

    Plotly.react('priceChart', traces, priceLayout, {responsive: true});

    // 2. Oscillator Chart (MACD, RSI)
    const oscillatorTraces = [];
    const hasOscillator = selectedInds.includes('macd') || selectedInds.includes('rsi');
    const oscContainer = document.getElementById('oscillatorChart');

    if (hasOscillator) {
        oscContainer.style.display = 'block';

        if (selectedInds.includes('macd') && records.some(r => r.MACD_Line !== undefined)) {
            oscillatorTraces.push({
                x: times,
                y: records.map(r => r.MACD_Line),
                type: 'scatter',
                mode: 'lines',
                name: 'MACD Line',
                line: { color: colors.macd },
                yaxis: 'y'
            });
            oscillatorTraces.push({
                x: times,
                y: records.map(r => r.MACD_Signal),
                type: 'scatter',
                mode: 'lines',
                name: 'Signal',
                line: { color: colors.macdsignal },
                yaxis: 'y'
            });
            oscillatorTraces.push({
                x: times,
                y: records.map(r => r.MACD_Histogram),
                type: 'bar',
                name: 'Histogram',
                marker: {
                    color: records.map(r => r.MACD_Histogram >= 0 ? colors.up : colors.down)
                },
                yaxis: 'y'
            });
        }

        if (selectedInds.includes('rsi') && records.some(r => r.RSI !== undefined)) {
            oscillatorTraces.push({
                x: times,
                y: records.map(r => r.RSI),
                type: 'scatter',
                mode: 'lines',
                name: 'RSI',
                line: { color: colors.rsi },
                yaxis: selectedInds.includes('macd') ? 'y2' : 'y'
            });
            
            // Overbought/Oversold lines
            oscillatorTraces.push({
                x: [times[0], times[times.length-1]],
                y: [70, 70],
                mode: 'lines',
                name: 'Overbought',
                line: { color: 'rgba(255,255,255,0.3)', dash: 'dot', width: 1},
                yaxis: selectedInds.includes('macd') ? 'y2' : 'y',
                hoverinfo: 'none',
                showlegend: false
            });
            oscillatorTraces.push({
                x: [times[0], times[times.length-1]],
                y: [30, 30],
                mode: 'lines',
                name: 'Oversold',
                line: { color: 'rgba(255,255,255,0.3)', dash: 'dot', width: 1},
                yaxis: selectedInds.includes('macd') ? 'y2' : 'y',
                hoverinfo: 'none',
                showlegend: false
            });
        }

        const oscLayout = {
            paper_bgcolor: 'transparent',
            plot_bgcolor: 'transparent',
            font: { color: '#e2e8f0', family: 'Inter' },
            xaxis: { 
                gridcolor: 'rgba(255,255,255,0.1)',
                type: 'category'
            },
            yaxis: { title: selectedInds.includes('macd') ? 'MACD' : 'RSI', gridcolor: 'rgba(255,255,255,0.1)' },
            yaxis2: { title: 'RSI', overlaying: 'y', side: 'right', range: [0, 100], showgrid: false },
            margin: { l: 50, r: 50, t: 20, b: 40 },
            showlegend: true,
            legend: { x: 0, y: 1, bgcolor: 'rgba(0,0,0,0.5)' }
        };

        if (selectedInds.includes('macd') && selectedInds.includes('rsi')) {
             // dual axis configured above
        } else if (selectedInds.includes('rsi')) {
             oscLayout.yaxis.range = [0, 100];
        }

        Plotly.react('oscillatorChart', oscillatorTraces, oscLayout, {responsive: true});

    } else {
        oscContainer.style.display = 'none';
        Plotly.purge(oscContainer);
    }
}
