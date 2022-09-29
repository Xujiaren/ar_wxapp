import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, ScrollView, Picker, Input, Textarea, Image, Button, Text } from '@tarojs/components'
import IconFont from '../../../components/iconfont'
import connectComponent from '../../../util/connect'
import asset from '../../../config/asset'
import './group.less'

const members = ['邀请用户', '全部用户'];

class Publish extends Component {

    date = new Date()
    state = {
        title: '',
        content: '',
        endTime: this.date.getFullYear() + '-' + (this.date.getMonth() + 1) + '-' + this.date.getDate(),
        isPublic: 1,
        activityImg: '',
        isMust: 2,
    }

    onUpload = () => {
        const {actions} = this.props;

        Taro.chooseImage({
			count: 1,
			sizeType: ["original", "compressed"],
			sourceType: ['album', 'camera'],
			success: (res) => {
				if (res.errMsg === 'chooseImage:ok') {
					const tf = res.tempFilePaths[0];
					Taro.getFileSystemManager().readFile({
                        filePath: tf,
                        encoding: 'base64',
                        success: (e) => {
                            actions.site.upload({
                                file:'data:image/jpeg;base64,' + e.data,
                                resolved: (data) => {
                                    
                                    this.setState({
                                        activityImg: data,
                                    })
                                },
                                rejected: (msg) => {
                                    Taro.showToast({
                                        title: '上传失败',
                                        icon: 'none',
                                    })
                                },
                            });
                        }
                    })
				}
			}
		})
    }

    onPublish = () => {
        const {actions} = this.props;
        const {title, content, endTime, isPublic, activityImg, isMust} = this.state;

        if (title.length == 0) {
            Taro.showToast({
                title: '请输入活动主题。',
                icon: 'none'
            })
            return;
        }

        if (content.length == 0) {
            Taro.showToast({
                title: '请输入活动描述。',
                icon: 'none'
            })
            return;
        }

        if (activityImg.length == 0) {
            Taro.showToast({
                title: '请上传活动封面。',
                icon: 'none'
            })
            return;
        }

        if (endTime.length == 0) {
            Taro.showToast({
                title: '请设置活动截止视觉。',
                icon: 'none'
            })
            return;
        }

        actions.group.publish({
            title: title,
            content: content,
            endTime: endTime,
            isPublic: isPublic,
            activityImg: activityImg,
            isMust: isMust,
            resolved: (data) => {
                Taro.showToast({
                    title: '活动发布成功',
                    icon: 'success',
                    duration: 1500,
                    success: () => {
                        Taro.navigateBack()
                    }
                })
            },
            rejected: (msg) => {
                Taro.showToast({
                    title: '活动发布失败',
                    icon: 'none'
                })
            },
        })
    }

	render () {
        const {title, content, endTime, isPublic, isMust, activityImg} = this.state;

		return (
			<View className={'group container row col bg_light'}>
				<View className={'col_1 h_100'}>
					<ScrollView
						scrollY 
						className={'h_full'}
					>
                        <View className={'p_30 row ai_ct jc_sb bg_white border_bottom'}>
                            <Text>活动主题</Text>
                            <Input placeholder={'请填写活动主题'} className={'label_end'} value={title} onInput={(e) => {
                                this.setState({
                                    title: e.detail.value,
                                })
                            }}/>
                        </View>
                        <View className={'p_30 row ai_ct jc_sb bg_white border_bottom'}>
                            <Text>活动截止</Text>
                            <Picker mode='date' value={endTime} onChange={(e) => {
                                this.setState({
                                    endTime: e.detail.value
                                })
                            }}>
                                <View className={'row ai_ct'}>
                                    <Text>{endTime}</Text>
                                    <IconFont name={'right'} color={'#999999'}/>
                                </View>
                            </Picker>
                        </View>
                        <View className={'p_30 row ai_ct jc_sb bg_white border_bottom'}>
                            <Text>活动对象</Text>
                            <Picker mode='selector' range={members} value={isPublic} onChange={(e) => {
                                this.setState({
                                    isPublic: parseInt(e.detail.value)
                                })
                            }}>
                                <View className={'row ai_ct'}>
                                    <Text>{members[isPublic]}</Text>
                                    <IconFont name={'right'} color={'#999999'}/>
                                </View>
                            </Picker>
                        </View>
                        <View className={'p_30 row ai_ct jc_sb bg_white border_bottom'}>
                            <Text>活动数据</Text>
                            <Picker mode='selector' range={['是', '否']} value={isMust == 1 ? 0 : 1} onChange={(e) => {
                                this.setState({
                                    isMust: parseInt(e.detail.value) == 0 ? 1 : 2,
                                })
                            }}>
                                <View className={'row ai_ct'}>
                                    <Text>{isMust == 1 ? '是' : '否'}</Text>
                                    <IconFont name={'right'} color={'#999999'}/>
                                </View>
                            </Picker>
                        </View>
                        <View className={'bg_white p_30'}>
                            <Text>描述</Text>
                            <Textarea className={'bg_light content circle_5 p_20 mt_10'} placeholder={'补充问题背景，条件等详细信息'} value={content} onInput={(e) => {
                                this.setState({
                                    content: e.detail.value
                                })
                            }}/>
                        </View>
                        <View className={'p_30 row ai_ct jc_sb bg_white'}>
                            <Text>活动封面</Text>
                        </View>
                        <View className={'p_30 row wrap bg_white'}>
                            <Image src={activityImg != '' ? activityImg : asset.base.upload} className={'upload'} onClick={this.onUpload}/>
                        </View>
                    </ScrollView>
                </View>
                <View className={'p_10 bg_white safe'}>
                    <Button className={'col_1 bg_blue label_white'} onClick={this.onPublish}>发布</Button>
                </View>
			</View>
		)
	}
}

const LayoutComponent = Publish;

function mapStateToProps(state) {
	return {

	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})