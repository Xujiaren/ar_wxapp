import React, { Component } from 'react'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { View, ScrollView, Text } from '@tarojs/components'
import ArticleCell from '../../../components/course/article'
import connectComponent from '../../../util/connect'
import './course.less'

class ArticleChannel extends Component {
	

	state = {
		refresh: false,
	}

	items = []
	channelId = getCurrentInstance().router.params.channelId || 0

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
		const {refresh} = this.state;

		return (
			<View className='channel container row col'>
				<ScrollView
					scrollY 
					className={'h_full'}

					refresherEnabled={true}
					refresherTriggered={refresh}

					onRefresherRefresh={(e) => {
						this.onHeaderRefresh()
					}}
				>
					<View className={'p_40'}>
					{this.items.map((course, index) => {
						return (
							<ArticleCell ttype={course.ttype} className={'mb_30 border_bottom pb_10'} course={course} onClick={() => {
								Taro.navigateTo({
									url: '/v2/pages/course/article?courseId=' + course.courseId,
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


const LayoutComponent = ArticleChannel;

function mapStateToProps(state) {
	return {
		channel: state.site.channel,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})
