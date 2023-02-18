const fs = require('fs')
const path = require('path')
const dayjs = require('dayjs')
const jsonfile = require('jsonfile')
const BinanceConnector = require('./binanceConnectorHelper')
const { delay } = require('./helper')

const getOldKlineData = async (
  symbol = 'BTCUSDT',
  interval = '1d',
  limit = 1000
) => {
  try {
    const binanceConnector = new BinanceConnector()
    const filePath = path.join(
      __dirname,
      'results',
      `${interval}`,
      `${symbol}.json`
    )

    if (fs.existsSync(filePath)) {
      const oldData = jsonfile.readFileSync(filePath)
      const oldestRecord = oldData.data[0]
      const oldestOpenTime = oldestRecord[0]

      const response = await binanceConnector.klines({
        symbol,
        interval,
        options: { limit, endTime: +oldestOpenTime - 1 },
      })

      const obj = { data: response.concat(oldData.data) }
      jsonfile.writeFileSync(filePath, obj)

      return response?.length > 0
    } else {
      const response = await binanceConnector.klines({
        symbol,
        interval,
        options: { limit },
      })
  
      const obj = { data: response }
      jsonfile.writeFileSync(filePath, obj)

      return response?.length > 0
    }
  } catch(err) {
    console.error(err)
  }
}

/**
 * 
 * @param {String} symbol    BTCUSDT, ETHUSDT, ...
 * @param {String} interval  15m, 1h, 1d, 1w, ...
 * @param {Number} limit     0 - 1000
 */
const getKlinesforSingleSymbol = async (
  symbol = 'BTCUSDT',
  interval = '1d',
  limit = 1000
) => {
  let _continue = true
  while (_continue) {
    _continue = await getOldKlineData(symbol, interval, limit)
    await delay(5000)
  }

  const filePathJson = path.join(
    __dirname,
    'results',
    `${interval}`,
    `${symbol}.json`
  )

  if (fs.existsSync(filePathJson)) {
    const filePathTxt = path.join(
      __dirname,
      'results',
      `${interval}`,
      `${symbol}.txt`
    )

    if (fs.existsSync(filePathTxt)) return console.log(`Please delete file: ${filePathTxt}`)

    const fetchedData = jsonfile.readFileSync(filePathJson)
    console.log(fetchedData)
    fetchedData.data.forEach(klineData => {
      const record = `${symbol},` + 
        `${dayjs(+klineData[0]).format(['1d', '1w'].includes(interval) ? 'YYYYMMDD' : 'YYYYMMDD,HH:mm:ss')},` +
        `${klineData[1]},` +
        `${klineData[2]},` +
        `${klineData[3]},` +
        `${klineData[4]},` +
        `${klineData[5]}\r\n`
      fs.appendFileSync(filePathTxt, record)
    })
  }
  
  console.log('DONE!')
}

getKlinesforSingleSymbol('BTCUSDT', '1d', 1000)
