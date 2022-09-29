import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, ScrollView, Text } from '@tarojs/components'
import classNames from 'classnames'
import connectComponent from '../../../util/connect'
import VodCell from '../../../components/course/vod'
import './course.less'

class LiveChannel extends Component {

	state = {
		type: 0,
		refresh: false,
	}

	total = 0
	page = 0
	pages = 1
	items = []

	componentDidShow() {
		this.onHeaderRefresh();
	}

	componentWillReceiveProps(nextProps) {
        const {playback} = nextProps;

        if (playback !== this.props.playback) {
            this.items = this.items.concat(playback.items);
            this.total = playback.total;
            this.pages = playback.pages;
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
        this.total = 0;
        this.items = [];

        actions.course.playback(type, 0);

		this.setState({
			refresh: true,
		})
	}

	onFooterRefresh = () => {
		const {actions} = this.props;
		const {type} = this.state;

        if (this.page < this.pages) {
            this.page = this.page + 1;
            actions.course.playback(type, this.page);
        }
	}

	render () {
		const {type, refresh} = this.state;

		return (
			<View className='channel container row col'>
				<View className={'row ai_ct jc_ad bottom_light'}>
					<View className={'row col ai_ct'} onClick={() => {
						this.setState({
							type: 0,
						}, () => {
							this.onHeaderRefresh();
						})
					}}>
						<Text>最新</Text>
						<View className={classNames('dot mt_5', {'bg_blue': type == 0})}/>
					</View>
					<View className={'row col ai_ct'} onClick={() => {
						this.setState({
							type: 1,
						}, () => {
							this.onHeaderRefresh();
						})
					}}>
						<Text>最热</Text>
						<View className={classNames('dot mt_5', {'bg_blue': type == 1})}/>
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
							{this.items.map((course, index) => {
								return (
									<VodCell className={'mb_30'} course={course} onClick={() => {
										Taro.navigateTo({
											url: '/v2/pages/course/vod?courseId=' + course.courseId,
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

const LayoutComponent = LiveChannel;

function mapStateToProps(state) {
	return {
		playback: state.course.playback,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})