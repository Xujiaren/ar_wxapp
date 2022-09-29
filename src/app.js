import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { Provider } from 'react-redux'
import configureStore from './redux'
import JAnalyticsInterface from './util/janalytics-m-1.1.0'
import './app.less'


const store = configureStore()

class App extends Component {

	componentDidShow(options) {
		console.info(options.referrerInfo.extraData);

        if (options.referrerInfo.extraData) {
			Taro.eventCenter.trigger('pay', options.referrerInfo.extraData);
		}
    }

	componentDidMount () {
		global.fromuid = 0
		global.utype = Taro.getStorageSync('utype') || 0
		global.uid = Taro.getStorageSync('uid') || 0
		global.tip = Taro.getStorageSync('tip') || 1
		global.token = Taro.getStorageSync('token')
		global.cards = []
		global.cardCodes = Taro.getStorageSync('cardcodes') || []

		JAnalyticsInterface.init(this)
	}

	componentDidCatchError () {

	}

	render () {
		return (
			<Provider store={store}>
				{this.props.children}
			</Provider>
		)
	}
}

export default App
