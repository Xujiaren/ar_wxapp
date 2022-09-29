import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, ScrollView, Button, Text } from '@tarojs/components'
import classNames from 'classnames'
import IconFont from '../../../../components/iconfont'
import connectComponent from '../../../../util/connect'
import './address.less'

class Address extends Component {

    state = {
        refresh: false,
    }

    items = []
    
    componentDidShow() {
		this.onHeaderRefresh();
	}

    componentWillReceiveProps(nextProps) {
        const {address} = nextProps;

        if (address !== this.props.address) {
            this.items = address;

            this.setState({
                refresh: false,
            })
        }
    }

    onHeaderRefresh = () => {
        const {actions} = this.props;
        actions.user.address();

		this.setState({
			refresh: true,
		})
    }

    onFirst = (address_id) => {
        const {actions} = this.props;

        actions.user.firstAddress({
            address_id: address_id,
            resolved: (data) => {
                this.onHeaderRefresh();
            },
            rejected: (msg) => {
                
            }
        })
    }

    onRemove = (address_id) => {
        const {actions} = this.props;

        const that = this

        Taro.showModal({
			title: '地址管理',
			content: '确认删除地址?',
			success: function (res) {
				if (res.confirm) {
					actions.user.removeAddress({
                        address_id: address_id,
                        resolved: (data) => {
                            that.onHeaderRefresh();
                        },
                        rejected: (msg) => {
                            
                        }
                    })
				}
			}
		})
    }

	render () {
        const {refresh} = this.state;

		return (
			<View className={'address container row col bg_light'}>
				<View className={'col_1 h_100'}>
					<ScrollView
						scrollY 
						className={'h_full'}

                        refresherEnabled={true}
						refresherTriggered={refresh}

						onRefresherRefresh={(e) => {
							this.onHeaderRefresh()
						}}
					>

                        {this.items.map((address, index) => {
                            return (
                                <View className={'mt_30 bg_white p_40'}>
                                    <View className={'row ai_ct jc_sb'}>
                                        <Text>{address.realname}</Text>
                                        <Text>{address.mobile}</Text>
                                    </View>
                                    <Text className={'row mt_10'}>{address.province} {address.city} {address.district} {address.address}</Text>
                                    <View className={'row ai_ct jc_sb mt_10'}>
                                        <View className={'row ai_ct'} onClick={() => {
                                            this.onFirst(address.addressId)
                                        }}>
                                            <IconFont name={'gouxuan'} size={24} color={address.isFirst == 1 ? '#00A6F6' : '#999999'}/>
                                            <Text className={classNames('ml_5', {'label_blue': address.isFirst == 1})}>默认地址</Text>
                                        </View>

                                        <View className={'row ai_ct'}>
                                            <View className={'mr_5'} onClick={() => {
                                                Taro.navigateTo({
                                                    url: '/v2/pages/user/address/publish?addressId=' + address.addressId + '&realname=' + address.realname + '&mobile=' + address.mobile + '&province=' + address.province + '&city=' + address.city + '&district=' + address.district + '&address=' + address.address + '&is_first=' + address.isFirst
                                                })
                                            }}>
                                                <Text className={'label_light'}>编辑</Text>
                                            </View>
                                            <View onClick={() => {
                                                this.onRemove(address.addressId)
                                            }}>
                                                <Text className={'label_light'}>删除</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            )
                        })}

                    </ScrollView>
                </View>
                <View className={'row ai_ct p_10 bg_white top_light'}>
                    <Button className={'col_1 bg_blue label_white'} onClick={() => {
                        Taro.navigateTo({
                            url: '/v2/pages/user/address/publish'
                        })
                    }}>添加地址</Button>
                </View>
			</View>
		)
	}
}

const LayoutComponent = Address;

function mapStateToProps(state) {
	return {
		address: state.user.address,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})