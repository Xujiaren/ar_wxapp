import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, ScrollView, Text } from '@tarojs/components'
import connectComponent from '../../../util/connect'
import VodCell from '../../../components/course/vod'
import './user.less'

class Course extends Component {

	state = {
		refresh: false,
    }

    page = 0
	pages = 1
	total = 0
    items = []

	componentDidShow() {
		this.onHeaderRefresh();
	}

	componentWillReceiveProps(nextProps) {
        const {course} = nextProps;

        if (course !== this.props.course) {
            this.pages = course.pages;
            this.total = course.total;
            this.items = this.items.concat(course.items);
        }

		this.setState({
			refresh: false,
		})
    }

	onHeaderRefresh = () => {
        const {actions} = this.props;

        this.page = 0;
        this.pages = 1;
        this.total = 0;
        this.items = [];

        actions.user.course(0);

		this.setState({
			refresh: true,
		})
    }

	onFooterRefresh = () => {
		const {actions} = this.props;

        if (this.page < (this.pages - 1)) {
            this.page++;
			actions.user.course(this.page);
		}
	}

	render () {
		const {refresh} = this.state;
		
		return (
			<View className={'course container row col'}>
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
                            {this.items.map((course, index) => {

								let page = 'vod';
								if (course.ctype == 1) {
									page = 'audio';
								} else if (course.ctype == 2) {
									page = 'live';
								}

								return (
									<VodCell className={'mb_30'} course={course} onClick={() => {
										Taro.navigateTo({
											url: '/v2/pages/course/' + page + '?courseId=' + course.courseId
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

const LayoutComponent = Course;

function mapStateToProps(state) {
	return {
		course: state.user.course,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})