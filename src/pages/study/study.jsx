import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, ScrollView, Text, Canvas } from '@tarojs/components'
import wxCharts from '../../v2/components/wxcharts'
import connectComponent from '../../util/connect'
import IconFont from '../../components/iconfont'

import StudyCell from '../../components/study/study'
import './study.less'

class Study extends Component {

	state = {
        refresh: false,

		windowWidth: Taro.getSystemInfoSync().windowWidth,
		rank: 0,
		learn: 0,
		today: 0,
		total: 0,
    }

	items = []
	days = []
	durations = []

	option = {
		xAxis: {
			type: 'category',
			data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
		},
		yAxis: {
			type: 'value'
		},
		series: [{
			data: [150, 230, 224, 218, 135, 147, 260],
			type: 'line'
		}]
	}

	componentDidShow() {
		this.onHeaderRefresh();
	}

	componentWillReceiveProps(nextProps) {
        const {study, stat} = nextProps;
		const {windowWidth} = this.state;

        if (study !== this.props.study && study.items) {
            this.items = study.items;
        }

        if (stat !== this.props.stat) {

			if (stat.total) {
				stat.learnList.map((stat, index) => {
					const ditem = stat.day.split('-');
					this.days.push(ditem[1] + '.' + ditem[2]);
					this.durations.push(parseInt(stat.duration / 60));
				})
	
				const lineChart = new wxCharts({
					canvasId: 'lineCanvas', 
					type: 'line',
					categories: this.days,
					animation: true,
					series: [{
						name: '观看时间(h)',
						data: this.durations,
						showInLegend:false,
						format: function (val, name) {
							return val.toFixed(2) + 'h';
						},
						itemStyle:{
							normal:{
								label:{
									show:true
								},
								color:'#F4623F',
								lineStyle:{
									color:'#F4623F'
								}
							}
						}
					}],
					tooltip: {
						formatter: '10'
					},
					xAxis: {
						disableGrid: true,
						axisLine:{
							lineStyle :{
								color: '#F4623F'
							}
						},
					},
					yAxis: {
						// title: '观看时间 (小时)',
						format: function (val) {
							return val.toFixed(1);
						},
						min: 0,
						max:0.5,
						axisLine:{
							lineStyle :{
								color: '#CECECE'
							}
						}
					},
					width: windowWidth,
					height: 200,
					dataLabel: false,
					dataPointShape: true,
					extra: {
						lineStyle: 'curve'
					}
				})
	
				this.setState({
					rank: stat.rank,
					learn: stat.learn,
					total: stat.total,
					today: stat.today,
				})
			} else {
				this.setState({
					rank: 0,
					learn: 0,
					total: 0,
					today: 0,
				})
			}
            
        }

		this.setState({
            refresh: false,
        })
    }

	onHeaderRefresh = () => {
		const {actions} = this.props;

        this.items = [];
        this.days = [];
        this.durations = [];

        actions.user.user();
        actions.user.study(0, 0);
        actions.user.stat();

        this.setState({
            refresh: true,
        })
	}

	onAction = (action) => {
		const {user} = this.props;

		if (!user.userId) {
			Taro.navigateTo({
				url: '/pages/user/passport'
			})
		} else {
			if (action == 'study') {
				Taro.navigateTo({
					url: '/v2/pages/user/study'
				})
			}
		}
	}

	render () {
		const {refresh, rank, total, today, learn} = this.state

		return (
			<View className='study container row col'>
				
				<ScrollView
					scrollY
					className={'h_full'}

					refresherEnabled={true}
                    refresherTriggered={refresh}

                    onRefresherRefresh={(e) => {
                        this.onHeaderRefresh()
                    }}
				>
					<View className={'top bg_blue'}/>
					<View className={'p_40'}>
						<View className={'row ai_fs jc_ad mt_30'}>
							<View className={'row col ai_ct'}>
								<Text className={'label_white'}>学习记录</Text>
								<View className={'dot bg_white circle_10 mt_5'}/>
							</View>
							<View onClick={() => {
								Taro.navigateTo({
									url: '/v2/pages/study/mapChannel'
								})
							}}>
								<Text className={'label_blight'}>学习地图</Text>
							</View>
							<View onClick={() => {
								Taro.navigateTo({
									url: '/v2/pages/study/planChannel'
								})
							}}>
								<Text className={'label_blight'}>学习计划</Text>
							</View>
						</View>

						<View className={'bg_white circle_10 shadow_bottom p_30 mt_30'}>
							<View className={'row ai_fs'}>
								<View className={'col_1 row col ai_ct right_light'}>
									<Text>今日学习</Text>
									<Text className={'row mt_10 label_25'}>{parseFloat(today/3600).toFixed(2)}<Text className={'label_light label_12'}>小时</Text></Text>
								</View>
								<View className={'col_1 row col ai_ct right_light'}>
									<Text>累计学习</Text>
									<Text className={'row mt_10 label_25'}>{parseFloat(total/3600).toFixed(2)}<Text className={'label_light label_12'}>小时</Text></Text>
								</View>
								<View className={'col_1 row col ai_ct'}>
									<Text>连续学习</Text>
									<Text className={'row mt_10 label_25'}>{learn}<Text className={'label_light label_12'}>天</Text></Text>
								</View>
							</View>
							<View className={'row ai_ct jc_sb mt_30'}>
								<Text className={'label_12 label_light'}>行动力超过了<Text className={'label_gray'}>{rank}%</Text>的用户</Text>
								<View onClick={() => {
									Taro.navigateTo({
										url: '/v2/pages/study/rank'
									})
								}}>
									<Text className={'label_12 label_blue'}>学习排行榜</Text>
								</View>
							</View>
						</View>

						<Canvas style={{ height:'400rpx', width:'640rpx' }}  canvasId='lineCanvas'/>

						<View className={'row ai_ct jc_sb mt_30 pb_10'}>
							<Text className={'label_bold'}>在学资源</Text>
							<View className={'row ai_ct'} onClick={() => this.onAction('study')}>
								<Text className={'label_12 label_light'}>查看全部</Text>
								<IconFont name={'right'} size={24} color={'#999999'}/>
							</View>
						</View>
						{this.items.map((course, index) => {

							let page = 'vod';

							if (course.ctype == 1) {
								page = 'audio';
							} else if (course.ctype == 3) {
								page = 'article';
							}

							return (
								<StudyCell className={'mb_30'} course={course} onClick={() => {
									Taro.navigateTo({
										url: '/v2/pages/course/' + page + '?courseId=' + course.courseId,
									})
								}}/>
							)
						})}
					</View>
				</ScrollView>
			</View>
		)
	}
}

const LayoutComponent = Study;

function mapStateToProps(state) {
	return {
		user: state.user.user,
        study: state.user.study,
        stat: state.user.stat,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})