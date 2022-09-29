import React, { Component } from 'react'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { View, ScrollView, Text } from '@tarojs/components'
import classNames from 'classnames'
import IconFont from '../../../components/iconfont'
import connectComponent from '../../../util/connect'

import VodCell from '../../../components/course/vod'
import VVodCell from '../../../components/course/vvod'
import './course.less'

class Channel extends Component {

	state = {
		type: 0,
		single: true,
		refresh: false,
	}

	items = []
	ctype = getCurrentInstance().router.params.ctype || 0;
	channelId = getCurrentInstance().router.params.channelId || 0;

	componentWillMount() {
        Taro.setNavigationBarTitle({
            title: this.ctype == 0 ? '精品资源' : '音频资源'
        })
    }

	componentDidShow() {
		this.onHeaderRefresh();
	}

	componentWillReceiveProps(nextProps) {
        const {channel} = nextProps;
        if (channel !== this.props.channel) {
            this.items = channel;

            this.setState({
                refresh: false,
            })
        }
    }

	onHeaderRefresh = () => {
		const {actions} = this.props;
		this.items = [];
		actions.site.channel(this.channelId, 0);

		this.setState({
			refresh: true,
		})
	}

	render () {
		const {type, single, refresh} = this.state;

		return (
			<View className='channel container row col '>
				<View className={'row ai_ct jc_sb pl_20 pr_20 bottom_light'}>
					<View className={'row ai_ct jc_ad col_1'}>
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
					<View>
						<View className={'row ai_ct'} onClick={() => {
						this.setState({
							single: !single,
						}, () => {
							this.onHeaderRefresh();
						})
					}}>
							<IconFont name={single ? 'danpai' : 'shuangpaibanshi'} size={24} color={'#999999'}/>
							<Text className={'label_light ml_5'}>{single ? '单排版式' : '双排版式'}</Text>
						</View>
						<View className={'dot mt_5'}/>
					</View>
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
						>
						<View className={classNames('p_40', {'row wrap': !single})}>
							{this.items.map((course, index) => {
								if (!single) return <VVodCell className={'vitem mt_10'} course={course} onClick={() => {
									Taro.navigateTo({
										url: '/v2/pages/course/' + (this.ctype == 0 ? 'vod' : 'audio') + '?courseId=' + course.courseId,
									})
								}}/>
								return (
									<VodCell className={'mb_30'} course={course} onClick={() => {
										Taro.navigateTo({
											url: '/v2/pages/course/' + (this.ctype == 0 ? 'vod' : 'audio') + '?courseId=' + course.courseId,
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

const LayoutComponent = Channel;

function mapStateToProps(state) {
	return {
		channel: state.site.channel,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})