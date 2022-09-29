import React, { Component } from 'react'
import Taro, {getCurrentInstance} from '@tarojs/taro'
import { View, ScrollView,Textarea, Input, Image, Button, Text } from '@tarojs/components'
import connectComponent from '../../../util/connect'
import IconFont from '../../../components/iconfont'
import asset from '../../../config/asset'
import './group.less'

class PublishOn extends Component {

    state = {
        content: '',
        others: '',
        gallery: [],

        isMust: false,
    }

    activityId = getCurrentInstance().router.params.activityId || 0

    componentDidShow() {
		const {actions} = this.props;
		actions.config.config();
        actions.group.info(this.activityId);
	}

    componentWillReceiveProps(nextProps) {
        const {info} = nextProps;

        if (info !== this.props.info && info.activityId) {
            this.group = info;

            this.setState({
                isMust: info.isMust == 1,
            })
        }
    }

    onUpload = () => {
        const {actions} = this.props;
        const {gallery} = this.state;

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
                                    gallery.unshift(data);

                                    this.setState({
                                        gallery: gallery,
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

    onRemove = (index) => {
        const {gallery} = this.state;
        gallery.splice(index, 1);

        this.setState({
            gallery: gallery,
        })
    }

    onSign = () => {
        const {actions, config} = this.props;
        const {isMust, content, others, gallery} = this.state;

        if (isMust && others.length == 0) {
            Taro.showToast({
                title: '请填写活动数据。',
                icon: 'none'
            })
            return;
        }

        let canPub = true;

        if (config.ban_words.length > 0) {
            const words = config.ban_words.split(',');

            for (let i = 0; i < words.length; i++) {
                if (content.indexOf(words[i]) >= 0) {
                    canPub = false;
                    break;
                }
            }
        }

        if (canPub) {
            actions.group.sign({
                activity_id: this.activityId,
                content: content,
                others: others,
                gallery: gallery.join(","),
                resolved: (data) => {
                    Taro.showToast({
                        title: '发布成功',
                        icon: 'success',
                        duration: 1500,
                        success: () => {
                            Taro.navigateBack()
                        }
                    })
                },
                rejected: (msg) => {
                    Taro.showToast({
                        title: msg,
                        icon: 'none'
                    })
                },
            })
        } else {
            Taro.showToast({
                title: '请注意您的言论！',
                icon: 'none'
            })
        }
    }

	render () {
        const {content, others, gallery, isMust} = this.state;

		return (
			<View className={'group container row col bg_light'}>
				<View className={'col_1 h_100'}>
					<ScrollView
						scrollY 
						className={'h_full'}
					>
                        <View className={'p_30'}>
                            <Textarea placeholder={'想说点什么，非必填'} className={'bg_light content circle_5 p_20'} value={content} onInput={(e) => {
                                this.setState({
                                    content: e.detail.value,
                                })
                            }}/>
                        </View>

                        {isMust ?
                        <View className={'p_30 row ai_ct jc_sb'}>
                            <Text>活动数据</Text>
                            <Input placeholder={'请填写活动数据'} className={'label_end'} value={others} onInput={(e) => {
                                this.setState({
                                    others: e.detail.value,
                                })
                            }}/>
                        </View>
                        : null}
                        <View className={'p_30 row ai_ct jc_sb bg_white'}>
                            <Text>活动图片(非必须)</Text>
                        </View>
                        <View className={'p_30 row wrap bg_white'}>
                            {gallery.map((g, index) => {
                                return (
                                    <View className={'mr_10 mb_10 upload_ctrl'}>
                                        <Image src={g} className={'upload'} onClick={() => {
                                            Taro.previewImage({
                                                urls: gallery,
                                                current: g
                                            })
                                        }}/>
                                        <View className={'remove'} onClick={() => this.onRemove(index)}>
                                            <IconFont name={'guanbi1'} color={'red'}/>
                                        </View>
                                    </View>
                                )
                            })}

                            <Image src={asset.base.upload} className={'upload'} onClick={this.onUpload}/>
                        </View>
                    </ScrollView>
                </View>
                <View className={'p_10 bg_white safe'}>
                    <Button className={'col_1 bg_blue label_white'} onClick={this.onSign}>打卡</Button>
                </View>
			</View>
		)
	}
}

const LayoutComponent = PublishOn;

function mapStateToProps(state) {
	return {
        config: state.config.config,
        info: state.group.info,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})