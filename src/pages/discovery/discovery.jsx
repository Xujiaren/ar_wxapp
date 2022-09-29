import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, ScrollView, Text } from '@tarojs/components'
import classNames from 'classnames'

import connectComponent from '../../util/connect'
import ActivityCell from '../../components/discovery/activity'
import SpecialCell from '../../components/discovery/special'
import SquadCell from '../../components/discovery/squad'
import './discovery.less'

class Discovery extends Component {

	state = {
		type: 1,
		refresh: false,
	}

	total = 0
	page = 0
	pages = 1
	items = []

	componentDidShow() {
		let type = 1
		const dtype = Taro.getStorageSync('dtype')

		if (dtype !== '') {
			type = dtype
		}

		this.setState({
			type: type,
		}, () => {
			this.onHeaderRefresh();
		})
	}

	componentWillReceiveProps(nextProps) {
        const {activity, special, squad} = nextProps;

        if (activity !== this.props.activity) {
            this.items = this.items.concat(activity.items);
            this.total = activity.total;
            this.pages = activity.pages;
        }

		if (special !== this.props.special) {
            this.items = this.items.concat(special.items);
            this.total = special.total;
            this.pages = special.pages;
        }

		if (squad !== this.props.squad) {
            this.items = this.items.concat(squad.items);
            this.total = squad.total;
            this.pages = squad.pages;
        }

        this.setState({
			refresh: false,
		})
    }

	onHeaderRefresh = () => {
		const {actions} = this.props;
		const {type} = this.state;

		this.page = 0;
        this.pages = 1;
        this.items = [];

		if (type == 0) {
			actions.activity.index('', 0);
		} else if (type == 1) {
			actions.news.special(0);
		} else if (type == 2) {
			actions.o2o.index(3, 0);
		} 

		this.setState({
			refresh: true,
		})
	}

	onFooterRefresh = () => {
		const {actions} = this.props;
		const {type} = this.state;

		if (this.page < this.pages) {
            this.page = this.page + 1;
            if (type == 0) {
				actions.activity.index('', this.page);
			} else if (type == 1) {
				actions.news.special(this.page);
			} else if (type == 2) {
				actions.o2o.index(3, this.page);
			} 
        }
	}

	render () {
		const {type, refresh} = this.state;

		return (
			<View className={'discovery container row col'}>
				<View className={'row'}>
					<View className={classNames('row col col_1 ai_ct p_10', {'on' : type == 0})} onClick={() => {
						this.setState({
							type: 0,
						}, () => {
							Taro.setStorageSync('dtype', 0);
							this.onHeaderRefresh();
						})
					}}>
						<Text className={classNames('label_light', {'label_gray' : type == 0})}>活动</Text>
					</View>
					<View className={classNames('row col col_1 ai_ct p_10', {'on' : type == 1})} onClick={() => {
						this.setState({
							type: 1,
						}, () => {
							Taro.setStorageSync('dtype', 1);
							this.onHeaderRefresh();
						})
					}}>
						<Text className={classNames('label_light', {'label_gray' : type == 1})}>专题</Text>
					</View>
					<View className={classNames('row col col_1 ai_ct p_10', {'on' : type == 2})} onClick={() => {
						this.setState({
							type: 2,
						}, () => {
							Taro.setStorageSync('dtype', 2);
							this.onHeaderRefresh();
						})
					}}>
						<Text className={classNames('label_light', {'label_gray' : type == 2})}>线下培训</Text>
					</View>
				</View>
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
							{this.items.map((item, index) => {
								if (type == 1) return <SpecialCell className={'mb_30'} special={item} onClick={() => {
									Taro.navigateTo({
										url: '/v2/pages/discovery/special?articleId=' + item.articleId,
									})
								}}/>
								if (type == 2) return <SquadCell className={'mb_30'}  squad={item} onClick={() => {
									Taro.navigateTo({
										url: '/v2/pages/discovery/squad?squadId=' + item.squadId,
									})
								}}/>
								return <ActivityCell className={'mb_30'} activity={item} onClick={() => {
									Taro.navigateTo({
										url: '/v2/pages/discovery/activity/activity?activityId=' + item.activityId,
									})
								}}/>
							})}
						</View>
					</ScrollView>
				</View>
			</View>
		)
	}
}

const LayoutComponent = Discovery;

function mapStateToProps(state) {
	return {
		activity: state.activity.index,
		special: state.news.special,
		squad: state.o2o.index,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})