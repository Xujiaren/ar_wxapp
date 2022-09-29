import React, { Component } from 'react'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { View, ScrollView, Button, Text } from '@tarojs/components'
import IconFont from '../../../components/iconfont'
import connectComponent from '../../../util/connect'
import VodCell from '../../../components/course/vod'
import './course.less'

class Order extends Component {

	state = {
		refresh: false,
		loaded: false,
	}

	course = {}
	courseId = getCurrentInstance().router.params.courseId || 0

	componentDidShow() {
		this.onHeaderRefresh();
	}

	componentWillReceiveProps(nextProps) {
		const {course} = nextProps;

		if (course !== this.props.course) {
			this.course = course;

			this.setState({
				loaded: true,
			})
		}
	}

	onHeaderRefresh = () => {
        const {actions} = this.props;
        actions.course.info(this.courseId);
        actions.user.user();

		this.setState({
			refresh: true
		})
    }

	onBuy = () => {
		const {user, actions} = this.props;

		if (user.integral >= this.course.integral) {
            actions.order.buy({
                from_uid: 0,
                pay_type: 3,
                course_id: this.courseId,
                chapter_id: 0,

                resolved: (data) => {
					Taro.showToast({
						title: '购买成功。',
						icon: 'success',
						success: () => {
							Taro.navigateBack()
						}
					})
                },
                rejected: (msg) => {
					Taro.showToast({
						title: '购买失败，请重试。',
						icon: 'none',
					})
                }
            })
        } else {
            Taro.navigateTo({
				url: '/v2/pages/user/recharge'
			})
        }
	}

	render () {
		const {user} = this.props;
		const {refresh, loaded} = this.state;
		if (!loaded) return null;

		const enable = user.integral >= this.course.integral;
		return (
			<View className='order container row col bg_light'>
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
						<View className={'p_40 bg_white'}>
							<VodCell course={this.course}/>
						</View>

						<View className={'p_40 bg_white row ai_ct jc_sb mt_30'}>
							<Text>可用积分 {user.integral}</Text>
							<IconFont name={'gouxuan'} size={32} color={'#999999'}/>
						</View>
						<View className={'p_40 row ai_fs'}>
							<View className={'col_1 pt_10'}>
								<IconFont name={'hit'} size={32} color={'#999999'}/>
							</View>
							<View className={'col_10'}>
								<Text className={'label_12 label_light'}>您将购买的商品为虚拟内容服务，不支持退订、转让以及退换，请慎重确认。</Text>
							</View>
						</View>
					</ScrollView>
				</View>
				<View className={'row ai_ct p_10 bg_white top_light safe'}>
					<View className={'col_1'}>
						<Text>应付：<Text className={'label_blue label_16'}>{this.course.integral}</Text></Text>
					</View>
					<Button size={'mini'} className={'bg_blue col_1 label_white'} onClick={this.onBuy}>{enable ? '立即支付' : '立即充值'}</Button>
				</View>
			</View>
		)
	}
}

const LayoutComponent = Order;

function mapStateToProps(state) {
	return {
        user: state.user.user,
        course: state.course.course,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})
