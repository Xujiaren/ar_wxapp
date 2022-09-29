import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, ScrollView, Picker, Image, Textarea, Button, Input, Text } from '@tarojs/components'
import classNames from 'classnames'
import connectComponent from '../../../util/connect'
import IconFont from '../../../components/iconfont';

import asset from '../../../config/asset'
import './user.less'

class FeedBack extends Component {

    state = {
        refresh: false,
        type: 0,

        category_index: 0,
        content: '',
        mobile: '',

        gallery: [],
        video: [],
    }

	page = 0
    pages = 1
    total = 0
    items = []

    cmap = {}
    tab = ['填写问题', '我的反馈']
    category = []

    componentDidShow() {
		const {actions} = this.props;
        actions.config.categoryFeedback();
        actions.user.user();
	}

    componentWillReceiveProps(nextProps) {
        const {user, category_feedback, feedback} = nextProps;

        if (user !== this.props.user) {
            this.setState({
                mobile: user.mobile,
            })
        }

        if (category_feedback !== this.props.category_feedback) {
            this.category = category_feedback;
            this.category.map((category, index) => {
                this.cmap[category.categoryId] = category.categoryName;
            })
        }

        if (feedback !== this.props.feedback) {
            this.pages = feedback.pages;
            this.total = feedback.total;
            this.items = this.items.concat(feedback.items);
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

        actions.user.feedback(0);

        this.setState({
            refresh: true,
        })
    }

    onFooterRefresh = () => {
		const {actions} = this.props;

        if (this.page < (this.pages - 1)) {
            this.page++;
			actions.user.feedback(this.page);
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
        const {category_index, content, mobile, gallery, video} = this.state;

        if (content.length == 0) {
            Taro.showToast({
                title: '提交失败，请输入问题描述。',
                icon: 'none'
            })
            return;
        }

        if (mobile.length != 11) {
            Taro.showToast({
                title: '提交失败，请输入联系方式。',
                icon: 'none'
            })
            return;
        }

        actions.user.publishFeedback({
            category_id: this.category[category_index].categoryId,
            mobile: mobile,
            content: content,
            gallery: gallery.join(","),
            video: video.join(","),
            resolved: (data) => {
                Taro.showToast({
                    title: '提交成功',
                    icon: 'success',
                    success: () => {
                        this.setState({
                            type: 1,
                            content: '',
                            gallery: [],
                            video: [],
                        }, () => this.onHeaderRefresh())
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
    }

	render () {
        const {type, category_index, content, mobile, gallery, refresh} = this.state

		return (
			<View className={'feedback container row col bg_light'}>
                <View className={'row pt_10 nowrap bg_white'}>
                {this.tab.map((tab, cindex) => {
                    return (
                        <View className={classNames('col_1 row col ai_ct', 'pl_15 pr_15', 'label_light', {'label_gray' : type == cindex})} onClick={() => {
                            this.setState({
                                type: cindex
                            }, () => {
                                if (cindex == 1) {
                                    this.onHeaderRefresh()
                                }
                            })
                        }}>
                            <Text>{tab}</Text>
                            <View className={classNames('dot circle_10 mt_5', {'bg_blue': type == cindex})}/>
                        </View>
                    )
                })}
                </View>
                {type == 0 ?
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
                        <View className={'bg_white p_30 mt_30'}>
                            <Text>描述</Text>
                            <Textarea className={'bg_light content circle_5 p_20 mt_10'} placeholder={'补充问题背景，条件等详细信息'} value={content} onInput={(e) => {
                                this.setState({
                                    content: e.detail.value
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
                        <View className={'p_30 row ai_ct jc_sb bg_white mt_30'}>
                            <Text>联系方式</Text>
                            <Input placeholder={'请填写联系方式'} className={'label_end'} value={mobile} onInput={(e) => {
                                this.setState({
                                    mobile: e.detail.value
                                })
                            }}/>
                        </View>
                        <View className={'p_30 mt_30'}>
                            <Button className={'col_1 bg_blue label_white'} onClick={this.onPublish}>提交</Button>
                        </View>
                    </ScrollView>
                </View>
				:<View className={'col_1 h_100'}>
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
                        {this.items.map((feedback, index) => {
                            return (
                                <View className={'p_40 bg_white mt_30'}>
                                    <Text><Text className={'label_light'}>问题类型：</Text>{this.cmap[feedback.categoryId]}</Text>
                                    <Text className={'row mt_5'}><Text className={'label_light'}>问题描述：</Text>{feedback.content}</Text>
                                    {feedback.galleryList.length > 0 ?
                                    <View className={'gallerys row wrap mt_5'}>
                                        {feedback.galleryList.map((img, index) => {
                                            return (
                                                <Image src={img.fpath} className={'gallery bg_light'}/>
                                            )
                                        })}
                                    </View>
                                    : null}
                                    <Text className={'label_12 label_light row mt_5'}>{feedback.pubTimeFt}</Text>
                                    {feedback.replyTime > 0 ?
                                    <View className={'bg_light p_10 mt_10'}>
                                        <Text className={'label_gray'}>管理员回复：{feedback.reply} <Text className={'label_light'}>({feedback.replyTimeFt})</Text></Text>
                                    </View>
                                    : null}
						        </View>
                            )
                        })}
						
					</ScrollView>
				</View>}
			</View>
		)
	}
}

const LayoutComponent = FeedBack;

function mapStateToProps(state) {
	return {
		category_feedback: state.config.category_feedback,
        user: state.user.user,
        feedback: state.user.feedback,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})