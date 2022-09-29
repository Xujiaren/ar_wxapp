import React, { Component } from 'react'
import { View, Swiper, SwiperItem, Image, Text } from '@tarojs/components'
import connectComponent from '../../../../util/connect'
import './grow.less'

class Right extends Component {
    
    equity = []

    componentDidShow() {
		this.onHeaderRefresh();
	}

	componentWillReceiveProps(nextProps) {
        const {user} = nextProps;

        if (user !== this.props.user) {
            this.equity = user.equityList;
        }
    }

	onHeaderRefresh = () => {
        const {actions} = this.props;
        actions.user.user();
    }

	render () {
		return (
			<View className={'grow container row col bg_light'}>
				<Swiper
                    className={'mt_30 col_1'}
                    previousMargin={'70rpx'}
                    nextMargin={'70rpx'}
                    displayMultipleItems={1}
                >
                    {this.equity.map((eitem, index) => {
                        return (
                            <SwiperItem>
                                <View className={'ritem m_10'}>
                                    <View className={'bg_white shadow_bottom'}>
                                        <View className={'head row col ai_ct'}>
                                            <View className={'head_bg'}/>
                                            <View className={'head_icon'}>
                                                <Image src={eitem.equityImg} className={'hicon bg_light'}/>
                                                <Text className={'row mt_10'}>{eitem.equityName}</Text>
                                            </View>
                                        </View>
                                        <View className={'p_40'}>
                                            <View className={'row ai_fs'}>
                                                <View className={'vdot bg_yellow'}/>
                                                <View className={'ml_10'}>
                                                    <Text className={'label_16'}>服务用户</Text>
                                                    <Text className={'label_gray row mt_10'}>{eitem.leveStr == '' ? '全部用户' : eitem.leveStr}</Text>
                                                </View>
                                            </View>
                                            <View className={'row ai_fs mt_30'}>
                                                <View className={'vdot bg_yellow'}/>
                                                <View className={'ml_10'}>
                                                    <Text className={'label_16'}>权益说明</Text>
                                                    <Text className={'label_gray row mt_10'}>{eitem.content}</Text>
                                                </View>
                                            </View>
                                            <View className={'row col ai_ct mt_30'}>
                                                <Image src={eitem.bottomImg} className={'ricon'}/>
                                            </View>
                                        </View>
                                        
                                    </View>
                                </View>
                            </SwiperItem>
                        )
                    })}
                </Swiper>
			</View>
		)
	}
}

const LayoutComponent = Right;

function mapStateToProps(state) {
	return {
		user: state.user.user,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})