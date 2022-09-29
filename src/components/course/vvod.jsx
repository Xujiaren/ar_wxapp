import React, { Component } from 'react'
import { View, Image, Text } from '@tarojs/components'

import './course.less'

export default class VVodCell extends Component {
	render () {
        const {className = '', course = {}} = this.props;

		return (
			<View className={'vvodcell ' + className} onClick={() => this.props.onClick && this.props.onClick()}>
                <Image src={course.courseImg} className={'course_thumb bg_light circle_10'} mode={'aspectFill'}/>
                <Text className={'mt_5 row title'}>{course.courseName.length>18?course.courseName.slice(0,18)+'...':course.courseName}</Text>
                <Text className={'row label_12 label_gray summary'}>{course.summary}</Text>
                <Text className={'row label_12 label_light teacher'}>{course.teacherName}</Text>
                <Text className={'label_12 label_light'}><Text className={'label_blue'}>{course.courseIntegral > 0 ? course.courseIntegral + '积分' : '免费'}</Text> {course.learn}人已学</Text>
			</View>
		)
	}
}
