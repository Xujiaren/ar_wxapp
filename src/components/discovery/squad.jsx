import React, { Component } from 'react'
import { View, Image, Text } from '@tarojs/components'

import * as tool from '../../util/tool';
import './discovery.less'

export default class SquadCell extends Component {
	render () {
        const {className = '', squad = {}} = this.props;

		return (
			<View className={'squad ' + className} onClick={() => this.props.onClick && this.props.onClick()}>
                <Image src={squad.squadImg} className={'squad_thumb bg_light circle_10'} mode={'aspectFill'}/>
                <View className={'pt_10'}>
                    <Text>{squad.squadName}</Text>
                    <Text className={'row mt_5 label_12 label_light'}>发布时间：{tool.ts2dt(squad.beginTime)}-{tool.ts2dt(squad.endTime)}</Text>
                </View>
			</View>
		)
	}
}
