"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import ChartComponent from 'lightweight-charts';

const StockNewsApp: React.FC = () => {
  const [symbol, setSymbol] = useState('AAPL');
  const [chartContainer, setChartContainer] = useState(null);
  const [newsItems, setNewsItems] = useState<any[]>([]);
  const [selectedNews, setSelectedNews] = useState(null);

  useEffect(() => {
    fetchStockData(symbol);
    fetchStockNews(symbol);
  }, [symbol]);

  const fetchStockData = async (symbol: string) => {
    const API_KEY = 'cqa4lvhr01qkfes2jof0cqa4lvhr01qkfes2jofg';
    const url = `/proxy/stock/candle?symbol=${symbol}&resolution=D&from=${Math.floor(Date.now() / 1000) - 365 * 24 * 60 * 60}&to=${Math.floor(Date.now() / 1000)}&token=${API_KEY}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      renderStockChart(data);
    } catch (error) {
      console.error('Error fetching stock data:', error);
    }
  };

  const fetchStockNews = async (symbol: string) => {
    const API_KEY = 'cqa4lvhr01qkfes2jof0cqa4lvhr01qkfes2jofg';
    const fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const url = `/proxy/company-news?symbol=${symbol}&from=${fromDate}&to=${new Date().toISOString().slice(0, 10)}&token=${API_KEY}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      setNewsItems(data);
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  };

  const renderStockChart = (data: any) => {
    const chartData = data.t.map((timestamp: number, index: number) => ({
      time: timestamp * 1000,
      open: data.o[index],
      high: data.h[index],
      low: data.l[index],
      close: data.c[index],
    }));

    if (chartContainer) {
      chartContainer?.remove();
    }

    const newChartContainer = ChartComponent.createChart(chartContainerRef.current, {
      width: 800,
      height: 600,
    });
    const candlestickSeries = newChartContainer.addCandlestickSeries();
    candlestickSeries.setData(chartData);

    newsItems.forEach((newsItem) => {
      const marker = newChartContainer.addMarkerXY(newsItem.datetime * 1000, data.c[data.t.indexOf(newsItem.datetime)], newsItem.headline);
      marker.applyOptions({
        shape: 'circle',
        size: 5,
        color: 'blue',
      });
      marker.onClick((e) => {
        console.log(`Clicked on ${newsItem.headline}`);
        setSelectedNews(newsItem);
      });
    });

    newChartContainer.timeScale().fitContent();

    setChartContainer(newChartContainer);
  };

  const chartContainerRef = React.useRef<HTMLDivElement>(null);

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ flex: 1 }}>
        <h1>Stock Price &amp; News</h1>
        <div>
          <label htmlFor="symbol-input">Enter Stock Symbol:</label>
          <input
            type="text"
            id="symbol-input"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
          />
        </div>
        <div ref={chartContainerRef} style={{ width: 800, height: 600 }}></div>
      </div>
      <div style={{ flex: 1, marginLeft: 20 }}>
        {selectedNews && (
          <div>
            <h2>{selectedNews.headline}</h2>
            <p>{selectedNews.summary}</p>
            <p>
              <a href={selectedNews.url} target="_blank" rel="noopener noreferrer">
                Read More
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockNewsApp;