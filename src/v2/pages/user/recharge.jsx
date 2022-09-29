import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, Button, Text } from '@tarojs/components'
import classNames from 'classnames'
import connectComponent from '../../../util/connect'
import './user.less'

class Recharge extends Component {

    state = {
        package_index: 0,
    }

    items = []

    componentDidShow() {
		this.onHeaderRefresh();
	}

    componentWillReceiveProps(nextProps) {
        const {recharge} = nextProps;

        if (recharge !== this.props.recharge) {
            this.items = recharge;
        }
    }

    onHeaderRefresh = () => {
        const {actions} = this.props;
        actions.config.recharge();
    }

    onPay = () => {
        const {actions} = this.props;
        const {package_index, pay_index} = this.state;

        const goods_id = this.items[package_index].goodsId;

        actions.order.recharge({
            pay_type: 2,
            goods_id: goods_id,
            goods_number: 1,
            remark: '',
            transaction_id: '', 
            payload: '',
            resolved: (data) => {
                const {pay_info} = data;

                Taro.requestPayment({
                    nonceStr: pay_info.nonceStr,
                    package: pay_info.package,
                    paySign: pay_info.sign,
                    timeStamp: pay_info.timeStamp + '',
                    signType: "MD5",
                    success: (res) => {
                        Taro.showToast({
                            title: '充值成功。',
                            icon: 'success',
                            duration: 2000,
                            success: () => {
                                Taro.navigateBack()
                            }
                        })
                    },
                    fail: (res) => {
                        Taro.showToast({
                            title: '充值失败。',
                            icon: 'noew',
                        })
                    }
                })
            },
            rejected: (msg) => {
                Taro.showToast({
                    title: '充值失败。',
                    icon: 'noew',
                })
            }
        })
    }

	render () {
        const {package_index} = this.state
        
		return (
			<View className={'recharge container row col bg_light'}>
                <View className={'p_40 bg_white'}>
                    <Text className={'label_20'}>请选择充值套餐</Text>
                    <View className={'row wrap mt_30'}>
                        {this.items.map((item, index) => {
                            const on = index == package_index;

                            return (
                                <View className={classNames('item row col ai_ct jc_ct', {'border_blue': on, 'border_light': !on})} onClick={() => this.setState({
                                    package_index: index,
                                })}>
                                    <Text className={classNames({'label_blue': on})}>{item.goodsName}</Text>
                                </View>
                            )
                        })}
                    </View>
                </View>
                <View className={'p_40'}>
                    <Button className={'bg_blue label_white'} onClick={this.onPay}>充值</Button>
                </View>
			</View>
		)
	}
}

const LayoutComponent = Recharge;

function mapStateToProps(state) {
	return {
		recharge: state.config.recharge,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})
