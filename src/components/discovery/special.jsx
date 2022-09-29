import React, { Component } from 'react'
import { View, Image, Text } from '@tarojs/components'

import './discovery.less'

export default class SpecialCell extends Component {
	render () {
        const {className = '', special = {}} = this.props;

		return (
			<View className={'special ' + className} onClick={() => this.props.onClick && this.props.onClick()}>
                <Image src={special.articleImg} className={'special_thumb bg_light circle_10'} mode={'aspectFill'}/>
                <View className={'pt_10'}>
                    <Text>{special.title}</Text>
                    <Text className={'row mt_5 label_12 label_light'}>{special.summary}</Text>
                </View>
			</View>
		)
	}
}