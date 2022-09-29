import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, ScrollView, Picker, Image, Text } from '@tarojs/components'

import connectComponent from '../../../util/connect'
import './user.less'

class Account extends Component {

    state = {
        sex: 0,
        birthday: '',
		refresh: false,
	}

    sex = ['保密', '男', '女']

    componentDidShow() {
		this.onHeaderRefresh();
	}

    componentWillReceiveProps(nextProps) {
        const {user} = nextProps;

        if (user !== this.props.user) {
            this.setState({
                sex: user.sex,
                birthday: user.birthday,
            })
        }
    }

    onHeaderRefresh = () => {
        const {actions} = this.props;
        actions.user.user();

		this.setState({
			refresh: true,
		})
    }

    onAvatar = () => {
        const {actions} = this.props;

        Taro.chooseImage({
			count: 1,
			sizeType: ["original", "compressed"],
			sourceType: ['album', 'camera'],
			success: (res) => {
				if (res.errMsg === 'chooseImage:ok') {
					const tf = res.tempFilePaths[0];
					Taro.getFileSystemManager().readFile({
                        filePath: tf,
                        encoding: 'base64',
                        success: (e) => {
                            actions.site.upload({
                                file:'data:image/jpeg;base64,' + e.data,
                                resolved: (data) => {
                                    this.onUpdate('avatar', data)
                                },
                                rejected: (msg) => {
                                    Taro.showToast({
                                        title: '上传失败',
                                        icon: 'none',
                                    })
                                },
                            });
                        }
                    })
				}
			}
		})
    }

    onUpdate = (key, val) => {
        const {actions} = this.props;

        if (key == 'sex') {
            this.setState({
                sex: val
            })
        } else if (key == 'birthday') {
            this.setState({
                birthday: val
            })
        }

        actions.user.account({
            field: key,
            val: val,
            resolved: (data) => {
                this.onHeaderRefresh();
                Taro.showToast({
                    title: '修改成功',
                    icon: 'none',
                })
            },
            rejected: (msg) => {
                Taro.showToast({
                    title: '修改失败',
                    icon: 'none',
                })
            },
        });
    }

	render () {
        const {user} = this.props;
        const {refresh, sex, birthday} = this.state;

		return (
			<View className={'account container row col bg_light'}>
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
                        <View className={'p_30 row ai_ct jc_sb bg_white mt_30 mb_30'} onClick={this.onAvatar}>
                            <Text>头像</Text>
                            <Image src={user.avatar} className={'avatar bg_light'}/>
                        </View>
                        <View className={'p_30 row ai_ct jc_sb bg_white border_bottom'} onClick={() => {
                            Taro.navigateTo({
                                url: '/v2/pages/user/nickname?nickname=' + user.nickname,
                            })
                        }}>
                            <Text>昵称</Text>
                            <Text className={'label_gray label_12'}>{user.nickname}</Text>
                        </View>
						<View className={'p_30 row ai_ct jc_sb bg_white border_bottom'}>
                            <Text>性别</Text>
                            <Picker mode='selector' range={this.sex} value={sex} onChange={(e) => {
                                this.onUpdate('sex', e.detail.value);
                            }}>
                                <Text className={'label_gray label_12'}>{this.sex[sex]}</Text>
                            </Picker>
                        </View>
                        <View className={'p_30 row ai_ct jc_sb bg_white border_bottom'}>
                            <Text>生日</Text>
                            <Picker mode='date' value={birthday} onChange={(e) => {
                                this.onUpdate('birthday', e.detail.value);
                            }}>
                                <Text className={'label_gray label_12'}>{birthday || '选择生日'}</Text>
                            </Picker>
                        </View>
                        <View className={'p_30 row ai_ct jc_sb bg_white border_bottom'}>
                            <Text>联系方式</Text>
                            <Text className={'label_gray label_12'}>{user.mobile}</Text>
                        </View>
					</ScrollView>
				</View>
			</View>
		)
	}
}

const LayoutComponent = Account;

function mapStateToProps(state) {
	return {
		user: state.user.user,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})