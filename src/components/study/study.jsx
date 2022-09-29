import React, { Component } from 'react'
import { View, Image, Progress, Text } from '@tarojs/components'

import './study.less'

export default class StudyCell extends Component {

	render () {
        const {className = '', course={}, progress = 0} = this.props;

        let _progress = progress;

        if (_progress == 0 && course.study) {
            _progress = parseFloat(course.study.progress / 100);
        } else {
            _progress = 1;
        }

        _progress = parseInt(_progress * 100);

		return (
			<View className={'studycell row ai_fs ' + className} onClick={() => this.props.onClick && this.props.onClick()}>
                <View className={'col_1 pr ovh circle_10'}>
                    <Image src={course.courseImg} className={'course_thumb col_1 bg_light'} mode={'aspectFill'}/>
                    {course.study.totalChapter > 1 ?
                    <View className={'chapter row ai_ct jc_ct'}>
                        <Text className={'label_12 label_white'}>系列课{course.study.currentChapter}/{course.study.totalChapter}</Text>
                    </View>
                    : null}
                </View>
                <View className={'course_info row col col_1 pl_10 jc_sb'}>
                    <View>
                        <Text>{course.courseName}</Text>
                        <Text className={'row label_12 label_gray summary'}>{course.summary}</Text>
                    </View>
                    <View>
                        <View className={'row ai_ct jc_sb mb_5'}>
                            <Text className={'label_12 label_light'}>{course.study.updateTimeFt}</Text>
                            <Text className={'label_12 label_light'}>已学{_progress}%</Text>
                        </View>
                        <Progress percent={_progress} strokeWidth={4} activeColor={'#00A6F6'} borderRadius={5}/>
                    </View>
                </View>
            </View>
		)
	}
}
