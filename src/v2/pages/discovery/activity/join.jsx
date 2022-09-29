import React, { Component } from 'react'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { View, ScrollView, Input, Image, Button, Text } from '@tarojs/components'
import connectComponent from '../../../../util/connect'
import IconFont from '../../../../components/iconfont';
import asset from '../../../../config/asset'
import './activity.less'


class Join extends Component {

    state = {
        loaded: false,

        is_video: false,
        user_name: '',
        mobile: '',
        work_name: '',
        work_intro: '',
        gallery: [],
    }

    activity = {}
    activityId = getCurrentInstance().router.params.activityId || 0

    componentDidShow() {
		const {actions} = this.props;
        actions.activity.info(this.activityId)
	}

    componentWillReceiveProps(nextProps) {
        const {info, work, user_vote} = nextProps;
        
        if (info !== this.props.info) {
            this.activity = info;
            
            this.setState({
                is_video: this.activity.ctype == 16,
                loaded: true,
            })
        }
    }

    onUpload = () => {
        const {actions} = this.props;
        const {is_video} = this.state;

        let gallery = this.state.gallery;

        if (is_video) {

            Taro.chooseVideo({
                sourceType: ['album','camera'],
                success: (res) => {
                    const tf = res.tempFilePath;
                    console.info(tf);

                    actions.config.oss({
                        resolved: (oss) => {
                            const suf = 'mp4';
                            const filename = new Date().getTime() + '.' + suf;
                            const key = oss.dir + filename;

                            Taro.uploadFile({
                                url: oss.host,
                                filePath: tf,
                                name: 'file',
                                formData: {
                                    key: key,
                                    policy: oss.policy,
                                    OSSAccessKeyId: oss.accessid,
                                    Signature: oss.signature
                                },
                                success: (res) => {
                                    if (res.statusCode === 204) {
                                        this.setState({
                                            gallery: [oss.host + '/' + key]
                                        })
                                    }
                                },
                                fail: err => {
                                    Taro.showToast({
                                        title: '上传失败',
                                        icon: 'none',
                                    })
                                }
                            })
                        },
                        rejected: (msg) => {
                            Taro.showToast({
                                title: '上传失败',
                                icon: 'none',
                            })
                        }
                    })
                }
            })
        } else {
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
    }

    onRemove = (index) => {
        const {gallery} = this.state;
        gallery.splice(index, 1);

        this.setState({
            gallery: gallery,
        })
    }

    onJoin = () => {
        const {actions} = this.props;
        const {user_name, mobile, work_name, work_intro, gallery} = this.state;

        if (user_name.length == 0) {
            Taro.showToast({
                title: '请填写姓名',
                icon: 'none'
            })
            return;
        }

        if (mobile.length != 11) {
            Taro.showToast({
                title: '请填写11位手机号',
                icon: 'none'
            })
            return;
        }

        if (work_name.length == 0) {
            Taro.showToast({
                title: '请填写作品名称',
                icon: 'none'
            })
            return;
        }

        if (work_intro.length == 0) {
            Taro.showToast({
                title: '请填写作品描述',
                icon: 'none'
            })
            return;
        }

        if (gallery.length == 0) {
            Taro.showToast({
                title: '请上传作品',
                icon: 'none'
            })
            return;
        }

        actions.activity.join({
            activity_id: this.activityId,
            user_name: user_name,
            mobile: mobile,
            work_name: work_name,
            work_intro: work_intro,
            work_url: gallery.join(','),
            resolved: (data) => {

                Taro.showToast({
                    title: '提交成功!请等待审核！',
                    duration: 2000,
                    icon: 'success',
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
    }

	render () {
        const {is_video, user_name, mobile, work_name, work_intro, gallery, loaded} = this.state;
        if (!loaded) return null

		return (
			<View className={'activity container row col bg_light'}>
				<View className={'col_1 h_100'}>
					<ScrollView
						scrollY 
						className={'h_full'}
					>
                        <View className={'p_30 row ai_ct jc_sb bg_white border_bottom'}>
                            <Text>姓名</Text>
                            <Input placeholder={'请填写姓名'} className={'label_end'} value={user_name} onInput={(e) => {
                                this.setState({
                                    user_name: e.detail.value
                                })
                            }}/>
                        </View>
                        <View className={'p_30 row ai_ct jc_sb bg_white border_bottom'}>
                            <Text>联系方式</Text>
                            <Input placeholder={'请填写手机号'} className={'label_end'} value={mobile} onInput={(e) => {
                                this.setState({
                                    mobile: e.detail.value
                                })
                            }}/>
                        </View>
                        <View className={'p_30 row ai_ct jc_sb bg_white border_bottom'}>
                            <Text>作品名称</Text>
                            <Input placeholder={'请填写'} className={'label_end'} value={work_name} onInput={(e) => {
                                this.setState({
                                    work_name: e.detail.value
                                })
                            }}/>
                        </View>
                        <View className={'p_30 row ai_ct jc_sb bg_white border_bottom'}>
                            <Text>作品描述</Text>
                            <Input placeholder={'请填写'} className={'label_end'} value={work_intro} onInput={(e) => {
                                this.setState({
                                    work_intro: e.detail.value
                                })
                            }}/>
                        </View>
                        <View className={'p_30 row ai_ct jc_sb bg_white'}>
                            <Text>上传作品</Text>
                        </View>
                        <View className={'p_30 row wrap bg_white'}>
                            {gallery.map((g, index) => {
                                return (
                                    <View className={'mr_10 mb_10 upload_ctrl'}>
                                        <Image src={g + (is_video ? "?x-oss-process=video/snapshot,t_10000,m_fast" : '')} className={'upload'}/>
                                        <View className={'remove'} onClick={() => this.onRemove(index)}>
                                            <IconFont name={'guanbi1'} color={'red'}/>
                                        </View>
                                    </View>
                                )
                            })}

                            <Image src={is_video ? asset.base.uploadv : asset.base.upload} className={'upload'} onClick={this.onUpload}/>
                        </View>
                    </ScrollView>
                </View>
                <View className={'p_10 bg_white safe'}>
                    <Button className={'col_1 bg_blue label_white'} onClick={this.onJoin}>确定</Button>
                </View>
			</View>
		)
	}
}

const LayoutComponent = Join;

function mapStateToProps(state) {
	return {
		info: state.activity.info,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})