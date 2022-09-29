import React, { Component } from 'react'
import { View, Image, Text } from '@tarojs/components'

import './course.less'

export default class ArticleCell extends Component {
	render () {
        const {className = '', ttype = 0, course={}} = this.props;

		return (
			<View className={'articlecell ' + className} onClick={() => this.props.onClick && this.props.onClick()}>
                {ttype == 2 ? 
                <Image src={course.galleryList ? course.galleryList[0].fpath : ''} className={'thumb bg_light circle_10 mt_10'} mode={'aspectFill'}/>
                : null}
                <Text className={'label_16 row mt_10'}>{course.courseName}</Text>
                {ttype == 0 || ttype == 1 || ttype == 2 ? 
                <Text className={'row label_light mt_10 summary'}>{course.summary}</Text>
                :null}
                {ttype == 1 ?
                <View className={'row ai_ct jc_sb mt_10'}>
                    {course.galleryList && course.galleryList.map((img, index) => {
                    return <Image src={img.fpath} className={'sthumb bg_light circle_10'} mode={'aspectFill'}/>
                    })}
                </View>
                : null}
                {ttype == 0 || ttype == 1 || ttype == 2 ?
                <Text className={'label_12 label_light mt_10 row'}>{course.collectNum}赞 · {course.comment}评论</Text>
                :null}
                {ttype == 3 ?
                <View className={'row ai_fs jc_sb mt_10'}>
                    <View className={'article_title'}>
                        <Text className={'row label_gray summary'}>{course.summary}</Text>
                        <Text className={'label_12 label_light mt_10 row'}>{course.collectNum}赞 · {course.comment}评论</Text>
                    </View>
                    <Image src={course.galleryList ? course.galleryList[0].fpath : ''} className={'sthumb bg_light circle_10'} mode={'aspectFill'}/>
                </View>
                : null}
			</View>
		)
	}
}
