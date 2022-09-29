import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, ScrollView, Text } from '@tarojs/components'
import classNames from 'classnames'
import connectComponent from '../../../util/connect'

import TeacherCell from '../../../components/teacher/teacher'
import ActivityCell from '../../../components/discovery/activity'

import './user.less'

class Follow extends Component {

    state = {
        type: 0,
		refresh: false,
    }

	category = ['讲师', '活动']
	page = 0
	pages = 1
	total = 0
    items = []

	componentDidShow() {
		this.onHeaderRefresh();
	}

	componentWillReceiveProps(nextProps) {
        const {follow} = nextProps;

        if (follow !== this.props.follow) {
            this.pages = follow.pages;
            this.total = follow.total;
            this.items = this.items.concat(follow.items);
        }
    }

	onHeaderRefresh = () => {
        const {actions} = this.props;
        const {type} = this.state;

        this.page = 1;
        this.pages = 1;
        this.total = 0;
        this.items = [];

        actions.user.follow(type + 1, this.page);

		this.setState({
			refresh: true,
		})
    }

	onFooterRefresh = () => {
		const {actions} = this.props;
        const {type} = this.state;

        if (this.page < this.pages) {
            this.page = this.page + 1;
            actions.user.follow(type + 1, this.page);

        }
	}

	render () {
        const {refresh, type} = this.state

		return (
			<View className={'follow container row col'}>
                <View className={'row pt_10 nowrap'}>
                {this.category.map((category, cindex) => {
                    return (
                        <View className={classNames('col_1 row col ai_ct', 'pl_15 pr_15', 'label_light', {'label_gray' : type == cindex})} onClick={() => {
							this.setState({
								type: cindex
							}, () => {
								this.onHeaderRefresh()
							})
						}}>
                            <Text>{category}</Text>
                            <View className={classNames('dot circle_10 mt_5', {'bg_blue': type == cindex})}/>
                        </View>
                    )
                })}
                </View>
				<View className={'col_1 h_100'}>
					<ScrollView
						scrollY 
						className={'h_full'}

						refresherEnabled={true}
						refresherTriggered={refresh}

						onRefresherRefresh={(e) => {
							this.onHeaderRefresh()
						}}

						onScrollToLower={(e) => {
							this.onFooterRefresh()
						}}
					>
						<View className={'p_40'}>
							{this.items.map((data, index) => {
								if (type == 0) {
									return (
										<TeacherCell follow={true} teacher={data} onClick={() => {
											Taro.navigateTo({
												url: '/v2/pages/teacher/teacher?teacherId=' + data.teacherId,
											})
										}}/>
									)
								}

								return (
									<ActivityCell className={'mb_30'} activity={data} onClick={() => {
										Taro.navigateTo({
											url: '/v2/pages/discovery/activity/activity?activityId=' + data.activityId,
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

const LayoutComponent = Follow;

function mapStateToProps(state) {
	return {
		follow: state.user.follow,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})