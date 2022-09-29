import React, { Component } from 'react'
import { View, Image, Text } from '@tarojs/components'
import Rank from '../base/rank'
import './course.less'

export default class VodCell extends Component {
	render () {
        const {className = '', course = {}} = this.props;

		return (
			<View className={'vodcell row ai_fs ' + className} onClick={() => this.props.onClick && this.props.onClick()}>
                <Image src={course.courseImg} className={'course_thumb bg_light circle_10'} mode={'aspectFill'}/>
				<View className={'course_info row col pl_10 jc_sb'}>
					<View>
						<Text className={'row title'}>{course.courseName}</Text>
						<Text className={'row label_12 label_gray summary'}>{course.summary}</Text>
					</View>
					<View>
						<Text className={'row label_12 label_light'}>{course.teacherName ? course.teacherName + ' ' : ''}{course.chapter}章节</Text>
						<Rank value={parseInt(course.score)} label={parseFloat(course.score).toFixed(1)}/>
						<Text className={'label_12 label_light'}><Text className={'label_blue'}>{course.courseIntegral > 0 ? course.courseIntegral + '积分' : '免费'}</Text> {course.learn}人已学</Text>
					</View>
				</View>
			</View>
		)
	}
}
