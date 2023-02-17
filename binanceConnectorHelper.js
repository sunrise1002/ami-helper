const { Spot } = require('@binance/connector')
const { NUMBER_CANDLESTICK } = require('./config')

class BinanceConnector {
  #client

  async setClient(apiKey, apiSecret) {
		this.#client = new Spot(apiKey, apiSecret)
		return this.#client
	}

	async getClient() {
		return this.#client || (await this.setClient('', ''))
	}

  async exchangeInfo() {
		const client = await this.getClient()
		try {
			const response = await client.exchangeInfo()
			return response?.data || {}
		} catch (err) {
			console.error(err)
			throw new Error(JSON.stringify(err?.response?.data?.msg || err))
		}
	}

  async klines(queryParams) {
		const {
			symbol,
			interval,
			options: { startTime, endTime, limit },
		} = queryParams
		const client = await this.getClient()
		try {
			const response = await client.klines(symbol, interval, {
				limit: limit || NUMBER_CANDLESTICK,
				...(startTime && { startTime }),
				...(endTime && { endTime }),
			})

			return response?.data || []
		} catch (err) {
			console.error(err)
			throw new Error(JSON.stringify(err?.response?.data?.msg || err))
		}
	}
}

module.exports = BinanceConnector
