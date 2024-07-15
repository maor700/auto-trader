import { BarSizeSetting, Contract, IBApiNext, IBApiNextError, Order, OrderAction, OrderType, SecType, WhatToShow } from "@stoqey/ib";


async function main() {
  const ib = new IBApiNext({
    // clientId: 0,
    // host: '127.0.0.1',
    port: 7497,
  });

  ib.connect();

  ib.error.subscribe(
    ({ error, code, reqId }: IBApiNextError) => {
      console.error(`${error.message} - code: ${code} - reqId: ${reqId}`);
    }
  );

  const contract: Contract = {
    symbol: "AMZN",
    exchange: "SMART",
    currency: "USD",
    secType: SecType.STK,
  };

  const time = await ib.getCurrentTime()
  console.log('Current time:', new Date(time));

  ib.setMarketDataType(3);
  // ib.getMarketData(contract, '101,105', false, false).subscribe((marketData) => {
  //   console.log('getMarketData:', marketData);
  // });

  ib.getHistoricalDataUpdates(contract, BarSizeSetting.HOURS_ONE, WhatToShow.MIDPOINT, 1)
  .subscribe((historicalData) => {
    console.log('getHistoricalDataUpdates:', historicalData);
  } );

  const orderId = await ib.getNextValidOrderId();


  const historyData = await ib.getHistoricalData(
    contract,
    "20240114 10:00:00",
    "1 D",
    BarSizeSetting.HOURS_ONE,
    "TRADES",
    1,
    1
  )
  
  console.log('History data:', historyData);

  const order: Order = {
    orderType: OrderType.LMT,
    action: OrderAction.BUY,
    lmtPrice: 1,
    orderId,
    totalQuantity: 1,
    account: "YOUR_ACCOUNT_ID",
  };

  const trade = await ib.placeNewOrder(contract, order);
  console.log('Trade:', trade);
}

main();