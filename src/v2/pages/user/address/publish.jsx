import React, { Component } from 'react'
import Taro, {getCurrentInstance} from '@tarojs/taro'
import { View, ScrollView, Input, Picker, Button, Text } from '@tarojs/components'
import connectComponent from '../../../../util/connect'
import IconFont from '../../../../components/iconfont'
import './address.less'

class Publish extends Component {

    state = {
        addressId: getCurrentInstance().router.params.addressId || 0,
        realname: getCurrentInstance().router.params.realname || '',
        mobile: getCurrentInstance().router.params.mobile || '',
        province: getCurrentInstance().router.params.province || '',
        city: getCurrentInstance().router.params.city || '',
        district: getCurrentInstance().router.params.district || '',
        address: getCurrentInstance().router.params.address || '',
        is_first: getCurrentInstance().router.params.is_first || 0,
    }

    onPublish = () => {
        const {actions} = this.props;
        const {addressId, realname, mobile, province, city, district, address, is_first} = this.state;

        if (realname.length == 0) {
            Taro.showToast({
                title: '请输入收件人。',
                icon: 'none'
            })
            return;
        }

        if (mobile.length != 11) {
            Taro.showToast({
                title: '请输入手机号',
                icon: 'none'
            })
            return;
        }

        if (province.length == 0) {
            Taro.showToast({
                title: '请选择区域',
                icon: 'none'
            })
            return;
        }

        if (address.length == 0) {
            Taro.showToast({
                title: '请输入详细地址',
                icon: 'none'
            })
            return;
        }

        actions.user.saveAddress({
            address_id: addressId, 
            realname: realname, 
            mobile: mobile, 
            province: province, 
            city: city, 
            district: district, 
            address: address, 
            is_first: is_first,
            resolved: (data) => {
                Taro.showToast({
                    title: '提交成功',
                    icon: 'success',
                    duration: 1500,
                    success: () => {
                        Taro.navigateBack()
                    }
                })
            },
            rejected: (msg) => {
                Taro.showToast({
                    title: msg,
                    icon: 'none'
                })
            }
        })
    }

	render () {
        const {realname, mobile, province, city, district, address} = this.state;

		return (
			<View className={'address container row col bg_light'}>
				<View className={'col_1 h_100'}>
					<ScrollView
						scrollY 
						className={'h_full'}
					>
                        <View className={'p_30 row ai_ct jc_sb bg_white border_bottom'}>
                            <Text>收件人</Text>
                            <Input placeholder={'请填写收件人'} className={'label_end'} value={realname} onInput={(e) => {
                                this.setState({
                                    realname: e.detail.value,
                                })
                            }}/>
                        </View>
                        <View className={'p_30 row ai_ct jc_sb bg_white border_bottom'}>
                            <Text>联系方式</Text>
                            <Input placeholder={'请填写手机号'} className={'label_end'} value={mobile} onInput={(e) => {
                                this.setState({
                                    mobile: e.detail.value,
                                })
                            }}/>
                        </View>
                        <View className={'p_30 row ai_ct jc_sb bg_white border_bottom'}>
                            <Text>区域</Text>
                            <Picker mode={'region'} value={[province, city, district]} onChange={(e) => {
                                const v = e.detail.value;

                                this.setState({
                                    province: v[0],
                                    city: v[1],
                                    district: v[2],
                                })
                            }}>
                                <View className={'row ai_ct'}>
                                    <Text className={'label_light row mr_5'}>{province ? province + ' ' + city + ' ' + district : '选择区域'}</Text>
                                    <IconFont name={'right'} color={'#999999'}/>
                                </View>
                            </Picker>
                        </View>
                        <View className={'p_30 row ai_ct jc_sb bg_white border_bottom'}>
                            <Text>详细地址</Text>
                            <Input placeholder={'请填写'} className={'label_end'} value={address} onInput={(e) => {
                                this.setState({
                                    address: e.detail.value,
                                })
                            }}/>
                        </View>
                    </ScrollView>
                </View>
                <View className={'p_10 bg_white safe'}>
                    <Button className={'col_1 bg_blue label_white'} onClick={this.onPublish}>提交</Button>
                </View>
			</View>
		)
	}
}

const LayoutComponent = Publish;

function mapStateToProps(state) {
	return {
		
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})