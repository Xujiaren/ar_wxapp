import React, { Component } from 'react'
import Taro, {getCurrentInstance} from '@tarojs/taro'
import { View, WebView, Text } from '@tarojs/components'
import './base.less'

export default class Web extends Component {

	link = getCurrentInstance().router.params.link || ''
	
	render () {
		
		const link = decodeURIComponent(this.link).replace('http://', 'https://')

		console.info(link)

		return (
			<View className={'web container row col bg_light'}>
				<WebView src={link}/>
			</View>
		)
	}
}