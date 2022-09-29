import React, { Component } from 'react'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { View, ScrollView, Text } from '@tarojs/components'
import classNames from 'classnames'
import IconFont from '../../../components/iconfont'
import connectComponent from '../../../util/connect'

import VodCell from '../../../components/course/vod'
import VVodCell from '../../../components/course/vvod'
import ArticleCell from '../../../components/course/article'
import './course.less'

class Related extends Component {

	state = {
		
	}

	related = []
    courseId = getCurrentInstance().router.params.courseId || 0

	componentWillMount() {
       
    }

	componentDidShow() {
		this.onHeaderRefresh();
	}

	componentWillReceiveProps(nextProps) {
        const {related} = nextProps;
        if(related !== this.props.related){
            this.related=related
        }
    }

	onHeaderRefresh = () => {
        const {actions} = this.props;
        actions.course.getRelated(10,this.courseId)
	}

	render () {

		return (
			<View className='p_20'>
				{this.related.map(course=>{
                   if (course.ctype == 3) {
					return (
						<ArticleCell ttype={course.ttype} className={'mb_30 border_bottom pb_10'} course={course} onClick={() => {
							Taro.navigateTo({
								url: '/v2/pages/course/article?courseId=' + course.courseId,
							})
						}}/>
					)
				}

				return (
					<VodCell course={course} className={'mb_30'} onClick={() => {
						Taro.navigateTo({
							url: '/v2/pages/course/' + (course.ctype == 0 ? 'vod' : 'audio') + '?courseId=' + course.courseId,
						})
					}}/>
				)
                })}
			</View>
		)
	}
}

const LayoutComponent = Related;

function mapStateToProps(state) {
	return {
		related:state.course.related
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})