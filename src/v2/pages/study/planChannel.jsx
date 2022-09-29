import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, ScrollView, Image, Text } from '@tarojs/components'
import connectComponent from '../../../util/connect'
import './study.less'

const status = ['进行中', '未开始', '已结束']

class PlanChannel extends Component {

    state = {
		refresh: false,
	}

    page = 0
    pages = 1
    total = 0
	plans = []

    componentDidShow() {
		this.onHeaderRefresh();
	}

    componentWillReceiveProps(nextProps) {
        const {plan} = nextProps;

        if (plan !== this.props.plan) {
            this.plans = this.plans.concat(plan.items);
            this.total = plan.total;
            this.pages = plan.pages;
        }

        this.setState({
            refresh: false
        })
    }

    onHeaderRefresh = () => {
        const {actions} = this.props;

        this.page = 0;
        this.pages = 1;
        this.total = 0;
        this.plans = [];

        actions.study.plan(0);

        this.setState({
            refresh: true
        })
    }

    onFooterRefresh = () => {
        const {actions} = this.props;

        if (this.page < this.pages) {
            this.page = this.page + 1;
            actions.study.plan(this.page);
        }
    }

    onPlan = (plan) => {
        const {actions} = this.props;

        if (plan.receive) {
            Taro.navigateTo({
                url: '/v2/pages/study/plan?planId=' + plan.planId,
            })
        } else {
            Taro.showModal({
                title: '学习计划',
                content: '是否同意参与该学习计划?',
                success: function (res) {
                    if (res.confirm) {
                        actions.study.accept({
                            plan_id: plan.planId,
                            resolved: (data) => {
                                Taro.navigateTo({
                                    url: '/v2/pages/study/plan?planId=' + plan.planId,
                                })
                            },
                            rejected: (msg) => {
                                
                            }
                        })
                    }
                }
            })
        }
    }

	render () {
        const {refresh} = this.state

		return (
			<View className={'plan container row col'}>
				<View className={'col_1 h_100'}>
					<ScrollView
						scrollY 
						className={'h_full'}
                        refresherEnabled={true}
						refresherTriggered={refresh}

						onScrollToLower={(e) => {
							this.onFooterRefresh()
						}}

						onRefresherRefresh={(e) => {
							this.onHeaderRefresh()
						}}
					>
						<View className={'p_40'}>
                            {this.plans.map((plan, index) => {
                                return (
                                    <View className={'item mb_30'} onClick={() => {
                                        if (plan.astatus == 0) {
                                            this.onPlan(plan)
                                        }
                                    }}>
                                        <View className={'thumb'}>
                                            <Image src={plan.planImg} className={'plan_thumb bg_light circle_10'}/>
                                            <View className={'status'}>
                                                <Text className={'label_12 label_white'}>{plan.finish ? '已完成' : '待完成'}</Text>
                                            </View>
                                        </View>
                                        <View className={'pt_10 pb_10 bottom_light'}>
                                            <Text>[{status[plan.astatus]}] {plan.planName}</Text>
                                            <Text className={'label_12 label_light row mt_5'}>{plan.startTimeFt}-{plan.endTimeFt}</Text>
                                        </View>
                                    </View>
                                )
                            })}
						</View>
					</ScrollView>
				</View>
			</View>
		)
	}
}

const LayoutComponent = PlanChannel;

function mapStateToProps(state) {
	return {
		plan: state.study.plan,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})