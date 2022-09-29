import React, { Component } from 'react'
import { View, Image, Button, Text } from '@tarojs/components'

import './teacher.less'

export default class TeacherCell extends Component {
	render () {
        const {className = '', follow = false, teacher = {}} = this.props;

		return (
			<View className={'teacher row ai_fs ' + className} >
                <Image src={teacher.teacherImg} className={'avatar bg_light circle_10'} onClick={() => this.props.onClick && this.props.onClick()} mode={'aspectFill'}/>
                <View className={'ml_10 col_1 row col jc_sb'}>
                    <View>
                        <View className={'row ai_ct jc_sb'}>
                            <Text>{teacher.teacherName}</Text>
                            <Button className={'label_blue mr_0'} size={'mini'} onClick={(e) => {
                                this.props.onFollow && this.props.onFollow()
                            }}>{(teacher.isFollow || follow) ? '已关注' : '+ 关注'}</Button>
                        </View>
                        <Text className={'label_12 label_gray row mt_5'}>{teacher.honor}</Text>
                    </View>
                    <Text className={'label_12 label_gray row mt_5'}>共 {teacher.course} 讲</Text>
                </View>
			</View>
		)
	}
}
