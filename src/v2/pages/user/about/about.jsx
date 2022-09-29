import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import IconFont from '../../../../components/iconfont'

export default class About extends Component {

	render () {
		return (
			<View className={'about container row col bg_light'}>
				<View className={'row ai_ct jc_sb p_30 bg_white bottom_light'} onClick={() => {
                    Taro.navigateTo({
                        url: '/v2/pages/user/about/content?type=0'
                    })
                }}>
                    <Text>关于我们</Text>
                    <IconFont name={'right'} size={24} color={'#999999'}/>
                </View>
                <View className={'row ai_ct jc_sb p_30 bg_white bottom_light'} onClick={() => {
                    Taro.navigateTo({
                        url: '/v2/pages/user/about/content?type=1'
                    })
                }}>
                    <Text>隐私条款</Text>
                    <IconFont name={'right'} size={24} color={'#999999'}/>
                </View>
                <View className={'row ai_ct jc_sb p_30 bg_white bottom_light'} onClick={() => {
                    Taro.navigateTo({
                        url: '/v2/pages/user/about/content?type=2'
                    })
                }}>
                    <Text>版权声明</Text>
                    <IconFont name={'right'} size={24} color={'#999999'}/>
                </View>
                <View className={'row ai_ct jc_sb p_30 bg_white bottom_light'} onClick={() => {
                    Taro.navigateTo({
                        url: '/v2/pages/user/about/content?type=3'
                    })
                }}>
                    <Text>联系我们</Text>
                    <IconFont name={'right'} size={24} color={'#999999'}/>
                </View>
                <View className={'row ai_ct jc_sb p_30 bg_white bottom_light'} onClick={() => {
                    Taro.navigateTo({
                        url: '/v2/pages/user/about/content?type=4'
                    })
                }}>
                    <Text>商业使用</Text>
                    <IconFont name={'right'} size={24} color={'#999999'}/>
                </View>
                <View className={'row ai_ct jc_sb p_30 bg_white bottom_light'} onClick={() => {
                    Taro.navigateTo({
                        url: '/v2/pages/user/about/content?type=5'
                    })
                }}>
                    <Text>证照信息</Text>
                    <IconFont name={'right'} size={24} color={'#999999'}/>
                </View>
                <View className={'row ai_ct jc_sb p_30 bg_white bottom_light'} onClick={() => {
                    Taro.navigateTo({
                        url: '/v2/pages/user/about/content?type=6'
                    })
                }}>
                    <Text>用户服务使用协议</Text>
                    <IconFont name={'right'} size={24} color={'#999999'}/>
                </View>
			</View>
		)
	}
}
