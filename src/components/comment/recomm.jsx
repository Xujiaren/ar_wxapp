import React, { Component } from 'react'
import { View, Text } from '@tarojs/components'

import CommetCell from './cell'
import './comment.less'

export default class Recomm extends Component {
	render () {
        const {className = '', comments = []} = this.props;

		return (
			<View className={'recomm ' + className}>
                <Text className={'label_16'}>精选评论 <Text className={'label_12 label_light'}>({comments.length})</Text></Text>
				{comments.map((comment, index) => {
					return (
						<CommetCell className={'mt_30'} comment={comment} onPraise={() => {
							this.props.onPraise && this.props.onPraise(index)
						}}/>
					)
				})}
                
			</View>
		)
	}
}
