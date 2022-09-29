import React, { Component } from 'react'
import Taro, {getCurrentInstance} from '@tarojs/taro'
import { View, ScrollView, Text } from '@tarojs/components'
import connectComponent from '../../../util/connect'

import VodCell from '../../../components/course/vod'

import './study.less'

class Plan extends Component {

	state = {
		refresh: false
	}

	planId = getCurrentInstance().router.params.planId || 0
	items = []

	componentDidShow() {
		this.onHeaderRefresh();
	}

	componentWillReceiveProps(nextProps) {
        const {plan_info} = nextProps;

        if (plan_info !== this.props.plan_info) {
            this.items = plan_info;
        }

		this.setState({
			refresh: false,
		})
    }

	onHeaderRefresh = () => {
		const {actions} = this.props;
		actions.study.planInfo(this.planId);

		this.setState({
			refresh: true
		})
	}

	render () {
		const {refresh} = this.state;

		return (
			<View className={'plan container row col'}>
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
						<View className={'p_40 course'}>
                            {this.items.map((course, index) => {
								let page = 'vod';

								if (course.ctype == 1) {
									page = 'audio';
								}

								return (
									<VodCell course={course} className={'mb_30'} onClick={() => {
										Taro.navigateTo({
											url: '/v2/pages/course/' + page + '?courseId=' + course.courseId + '&planId=' + this.planId,
										})
									}}/>
								)
							})}
						</View>
					</ScrollView>
				</View>
			</View>
		)
	}
}

const LayoutComponent = Plan;

function mapStateToProps(state) {
	return {
		plan_info: state.study.plan_info,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})