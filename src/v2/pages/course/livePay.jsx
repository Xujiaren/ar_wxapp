import React, { Component } from 'react'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { View, Image, Text, Button } from '@tarojs/components'

import qs from 'query-string'
import './course.less'

const status = ['立即支付', '支付失败，重新支付。', '支付成功，点击返回。']

export default class LivePay extends Component {

    state = {
        payType: 0,
        url: '',
    }

    componentDidMount() {
        const that = this;

        Taro.eventCenter.on('pay', (data) => {

			if (data.payStatus == 'fail') {
                that.setState({
                    payType: 1,
                })
			} else if (data.payStatus == "success") {
                Taro.navigateTo({
                    url: '/v2/pages/base/web?link=' + encodeURIComponent(data.orderDetailUrl)
                })
			}
        })
    }

    componentWillUnmount() {
        Taro.eventCenter.off()
    }

    onPay = () => {
        const {payType} = this.state;
        
        if (payType < 2) {
            Taro.navigateToMiniProgram({
                appId: 'wx302125b2448fd5e3',
                path: 'pages/app-pay/index?isFromH5=true&' + qs.stringify(getCurrentInstance().router.params, {encode: false}),
                //path: 'pages/app-pay/index?isFromH5=true&backUrl=http%3A%2F%2Flocalhost%3A8080%2F%23%2Fshop%2FpaySuccess&payClient=H5&bankType=PAYNOW&payway=PAYNOW&paymentType=WECHAT_APPLET&payPassword=&payType=105&tradeNo=210615000015&walletPay=false&accountType=&ptUserId=&tradeType=&requesMiniAppType=pay&host=https%3A%2F%2Fmall-uat.anranshop.com%2Fbiz-mall-application&isFromH5=true&token=eyJhbGciOiJIUzI1NiJ9.eyJyZWFsTmFtZSI6IuWUkOahgueniyIsImluc3RhbmNlSWQiOi0xLCJwaG9uZSI6IjE4NTAyMDgxMTM2IiwibG9naW5OYW1lIjoiRDAwMDEwNSIsImNhcmRDb2RlIjoiRDAwMDEwNSIsImNoYW5uZWwiOiJiMmNfd2ViX2g1IiwidGVuYW50SWQiOi0xLCJpZCI6MTI1MjU4Njk0MjQ0MjY4NjU2NiwidXNlclR5cGUiOjIsImp0aSI6Ijg1YWMzMTZhLWQwZTQtNDc4OC05MTYwLTMwODM5MWZlYzk0NSIsIm5iZiI6MTYyMzc0MjA5MywiZXhwIjozNzcxMjI1NzQwfQ.Ju8SxGUxDnHTkVQ1-G82wrR9cMJFhio4xbC-Bhmd1JQ',
                envVersion: 'trial',
            })
        } else {
            Taro.switchTab({
                url: '/pages/home/index',
            })
        }
        
    }

	render () {
        const {payType} = this.state;

		return (
			<View className={'live-pay container row col'}>
                <View className={'col_1 row col ai_ct jc_ct'}>
                    <Button onClick={this.onPay} className={'bg_blue label_white'}>{status[payType]}</Button>
                </View>
				<View>
                    <Image src={'https://arsxy.oss-cn-beijing.aliyuncs.com/app/user/passport.bg.png'} className={'bg'}/>
                </View>
			</View>
		)
	}
}