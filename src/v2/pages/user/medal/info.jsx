import React, { Component } from 'react'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { View, ScrollView, Swiper, SwiperItem, Image, Button, Text } from '@tarojs/components'
import classNames from 'classnames'
import connectComponent from '../../../../util/connect'
import './medal.less'

class Info extends Component {

    state = {
        index: 0,
        current: getCurrentInstance().router.params.current || 0
    }

    medals = this.props.medal

    onShareAppMessage = (res) => {
        
        return {
            title: '您的好友在纳视界获得了勋章，快去围观吧～',
            path: '/pages/home/index?fromuid=' + global.uid + '&utype=' + global.utype,
        }

    }

	render () {
        const {index, current} = this.state
        const medal = this.medals[current]
        const cmedal = medal.child[index]

		return (
			<View className={'medal container row col bg_light'}>
				<View className={'col_1 h_100'}>
                    <ScrollView
                            scrollY 
                            className={'h_full'}
                        >
                        <Swiper
                            className={'mt_30'}
                            previousMargin={'100rpx'}
                            nextMargin={'100rpx'}
                            displayMultipleItems={1}
                            current={index}

                            onChange={(e) => {
                                this.setState({
                                    index: e.detail.current
                                })
                            }}
                        >
                            {medal.child.map((item, index) => {
                                return (
                                    <SwiperItem>
                                        <View className={'row col ai_ct'}>
                                            <Image src={item.img} className={classNames('medal', {'thumb_disable': !item.have})}/>
                                        </View>
                                    </SwiperItem>
                                )
                            })}
                        </Swiper>

                        <View className={'p_100 row col ai_ct'}>
                            <Text className={'label_16'}>{cmedal.title}Lv.{cmedal.lv}</Text>
                            <Text className={'label_12 label_light row mt_5'}>当前进度{medal.nowNum}/{medal.allNum}</Text>
                            <Text className={'row mt_30'}>{cmedal.description}</Text>
                            <Button className={'bg_blue label_white mt_30'}  openType={'share'} size={'mini'}>分享</Button>
                        </View>
                    </ScrollView>
				</View>
			</View>
		)
	}
}

const LayoutComponent = Info;

function mapStateToProps(state) {
	return {
        medal: state.user.medal,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})