import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import IconFont from '../../../../components/iconfont'
import connectComponent from '../../../../util/connect'
import './message.less'

class Message extends Component {

    state = {
        message_unread: 0,
        remind_unread: 0,
    }

    message = {}
    remind = {}

    componentDidShow() {
		this.onHeaderRefresh();
	}

    componentWillReceiveProps(nextProps) {
        const {unread, message, remind} = nextProps;

        if (unread !== this.props.unread) {
            this.setState({
                message_unread: unread.message,
                remind_unread: unread.remind,
            })
        }

        if (message !== this.props.message && message.items && message.items.length > 0) {
            this.message = message.items[0];
        }

        if (remind !== this.props.remind && remind.items && remind.items.length > 0) {
            this.remind = remind.items[0];
        }
    }

    onHeaderRefresh = () => {
        const {actions} = this.props;
        actions.user.unread();
        actions.user.message(0);
        actions.user.remind(0);
    }

	render () {
        const {message_unread, remind_unread} = this.state;

		return (
			<View className={'message container row col'}>
				<View className={'p_40'}>
                    <View className={'row p_10'} onClick={() => {
                        Taro.navigateTo({
                            url: '/v2/pages/user/message/info?type=1'
                        })
                    }}>
                        <View className={'pr'}>
                            <IconFont name={'xitongtongzhi'} size={90} color={'#7ED321'}/>
                            {remind_unread > 0 ?
                            <View className={'count bg_red row col ai_ct jc_ct'}>
                                <Text className={'label_9 label_white'}>{remind_unread}</Text>
                            </View>
                            : null}
                        </View>
                        <View className={'row col jc_sb col_1 ml_10'}>
                            <View className={'row ai_ct jc_sb'}>
                                <Text className={'label_16'}>系统通知</Text>
                                <Text className={'label_12 label_light'}>{this.remind.pubTimeFt}</Text>
                            </View>
                            <Text className={'label_gray row title'}>{this.remind.title}</Text>
                        </View>
                        
                    </View>
                    <View className={'row p_10 pr'} onClick={() => {
                        Taro.navigateTo({
                            url: '/v2/pages/user/message/info?type=0'
                        })
                    }}>
                        <View className={'pr'}>
                            <IconFont name={'tedingxiaoxi'} size={90} color={'#00A6F6'}/>
                            {message_unread > 0 ?
                            <View className={'count bg_red row col ai_ct jc_ct'}>
                                <Text className={'label_9 label_white'}>{message_unread}</Text>
                            </View>
                            : null}
                        </View>
                        <View className={'row col jc_sb col_1 ml_10'}>
                            <View className={'row ai_ct jc_sb'}>
                                <Text className={'label_16'}>特定消息</Text>
                                <Text className={'label_12 label_light'}>{this.message.pubTimeFt}</Text>
                            </View>
                            <Text className={'label_gray row title'}>{this.message.title}</Text>
                        </View>
                        
                    </View>
                </View>
			</View>
		)
	}
}

const LayoutComponent = Message;

function mapStateToProps(state) {
	return {
		unread: state.user.unread,
        message: state.user.message,
        remind: state.user.remind,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})