import React, { Component } from 'react'
import Taro, {getCurrentInstance} from '@tarojs/taro'
import { View, Input, Button, Text } from '@tarojs/components'

import connectComponent from '../../../util/connect'
import './user.less'

class Nickname extends Component {

    state = {
        nickname: getCurrentInstance().router.params.nickname || ''
    }

    onUpdate = () => {
        const {actions} = this.props;
        const {nickname} = this.state;

        if (nickname.length == 0) {
            Taro.showToast({
                title: '请先输入昵称',
                icon: 'none',
            })

            return
        }

        actions.user.account({
            field:'nickname',
            val: nickname,
            resolved: (data) => {
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
        const {nickname} = this.state

		return (
			<View className={'user container row col'}>
				<View className={'p_30 row ai_ct jc_sb bg_white border_bottom'}>
                    <Text>昵称</Text>
                    <Input placeholder={'请输入昵称'}  className={'label_end'} value={nickname}  onInput={(e) => {
                        this.setState({
                            nickname: e.detail.value,
                        })
                    }}/>
                </View>
                <View className={'p_30 mt_30'}>
					<Button className={'col_1 bg_blue label_white'} onClick={this.onUpdate}>提交</Button>
				</View>
			</View>
		)
	}
}

const LayoutComponent = Nickname;

function mapStateToProps(state) {
	return {
		
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})