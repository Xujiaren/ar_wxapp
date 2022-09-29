import React, { Component } from 'react'
import { View, Image, Text } from '@tarojs/components'

import * as tool from '../../util/tool';
import './discovery.less'

const status = ['进行中', '待开始', '已结束'];

export default class ActivityCell extends Component {
	render () {
        const {className = '', activity = {}} = this.props;

		return (
			<View className={'activity ' + className} onClick={() => this.props.onClick && this.props.onClick()}>
                <View className={'thumb'}>
                    <Image src={activity.activityImg} className={'activity_thumb bg_light circle_10'} mode={'aspectFill'}/>
                    <View className={'status'}>
                        <Text className={'label_12 label_white'}>{status[activity.astatus]}</Text>
                    </View>
                    <View className={'time p_5'}>
                        <Text className={'label_12 label_white'}>活动时间：{tool.ts2dt(activity.beginTime)}-{tool.ts2dt(activity.endTime)}</Text>
                    </View>
                </View>
                <View className={'row ai_ct jc_sb pt_10'}>
                    <Text>{activity.title}</Text>
                    <Text className={'label_12 label_light'}>{activity.num}人参与</Text>
                </View>
			</View>
		)
	}
}
