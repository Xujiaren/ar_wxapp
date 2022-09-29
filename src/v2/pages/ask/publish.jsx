import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, ScrollView,Textarea, Picker, Image, Button, Text } from '@tarojs/components'
import connectComponent from '../../../util/connect'
import IconFont from '../../../components/iconfont'
import asset from '../../../config/asset'
import './ask.less'


class Publish extends Component {

    state = {
        category_index: 0,
        title: '',
        content: '',
        gallery: [],
    }

    cmap = {}
    category = []

    componentDidShow() {
		const {actions} = this.props;
		actions.config.categoryAsk();
	}

    componentWillReceiveProps(nextProps) {
        const {category} = nextProps;

        if (category !== this.props.category) {
            this.category = category;
            this.category.map((category, index) => {
                this.cmap[category.categoryId] = category.categoryName;
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

    onPublish = () => {
        const {actions} = this.props;
        const {category_index, title, content, gallery} = this.state;


        if (title.length < 5) {
            Taro.showToast({
                title: '请输入长度5个字以上的问题标题。',
                icon: 'none'
            })
            return;
        }

        actions.ask.publish({
            category_id: this.category[category_index].categoryId,
            title: title,
            content: content,
            pics: gallery.join(','),
            videos: '',
            resolved: (data) => {
                Taro.showToast({
                    title: '提交成功!将由工作人员筛选审核后公开显示。',
                    icon: 'success',
                    duration: 1500,
                    success: () => {
                        this.setState({
                            title: '',
                            content: '',
                            gallery: [],
                        }, () => Taro.navigateBack());
                    }
                })
            },
            rejected: (msg) => {
                Taro.showToast({
                    title: '提交失败，请检查您的输入。',
                    icon: 'none'
                })
            },
        })
    }

	render () {
        const {category_index, title, content, gallery} = this.state

		return (
			<View className={'ask container row col bg_light'}>
				<View className={'col_1 h_100'}>
					<ScrollView
						scrollY 
						className={'h_full'}
					>
                        <View className={'row ai_ct jc_sb bg_white p_30 mt_30'}>
                            <Text>问题类型</Text>
                            <Picker mode='selector' range={Object.values(this.cmap)} value={category_index} onChange={(e) => {
                                this.setState({
                                    category_index: e.detail.value,
                                })
                            }}>
                                <View className={'row ai_ct'}>
                                    <Text className={'gray row mr_5'}>{this.category[category_index] ? this.category[category_index].categoryName : '选择分类'}</Text>
                                    <IconFont name={'right'} color={'#999999'}/>
                                </View>
                            </Picker>
                        </View>

                        <View className={'p_30 row ai_ct jc_sb bg_white mt_30'}>
                            <Text className={'label_16'}>标题</Text>
                        </View>
                        <View className={'p_30'}>
                            <Textarea placeholder={'一句话描述你的问题'} className={'bg_light content circle_5 p_20'} value={title} onInput={(e) => {
                                this.setState({
                                    title: e.detail.value,
                                })
                            }}/>
                        </View>
                        <View className={'p_30 row ai_ct jc_sb bg_white mt_30'}>
                            <Text className={'label_16'}>描述</Text>
                        </View>
                        <View className={'p_30'}>
                            <Textarea placeholder={'补充问题背景，条件等详细信息'} className={'bg_light content circle_5 p_20'} value={content} onInput={(e) => {
                                this.setState({
                                    content: e.detail.value,
                                })
                            }}/>
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
                    <Button className={'col_1 bg_blue label_white'} onClick={this.onPublish}>发布问题</Button>
                </View>
			</View>
		)
	}
}

const LayoutComponent = Publish;

function mapStateToProps(state) {
	return {
        category: state.config.category_ask,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})
