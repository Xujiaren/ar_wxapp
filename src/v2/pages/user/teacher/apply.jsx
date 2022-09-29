import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, ScrollView, Image, Button, Text } from '@tarojs/components'
import IconFont from '../../../../components/iconfont'
import connectComponent from '../../../../util/connect'
import asset from '../../../../config/asset'
import './teacher.less'

const mstatus = ['等待审核', '拒绝申请', '申请通过'];

class Apply extends Component {

    state = {
        loaded: false,
        applyed: false,
        
        pic_0: '',
        pic_1: '',
        status: 0,
    }

    componentDidShow() {
		this.onHeaderRefresh();
	}

    componentWillReceiveProps(nextProps) {
        const {apply_info} = nextProps;

        if (apply_info !== this.props.apply_info) {
            let applyed = false;
            let pic_0 = '';
            let pic_1 = '';
            let status = 0;

            if (apply_info.applyId) {
                applyed = true;
                pic_0 = apply_info.galleryList[0].fpath;
                pic_1 = apply_info.galleryList[1].fpath;
                status = apply_info.status;
            }

            this.setState({
                loaded: true,
                applyed: applyed,
                pic_0: pic_0,
                pic_1: pic_1,
                status: status,
            })
        }
    }

    onHeaderRefresh = () => {
        const {actions} = this.props;
        actions.teacher.applyInfo();
    }

    onUpload = (index) => {
        const {actions} = this.props;
        const {pic_0, pic_1, applyed} = this.state;
        if (applyed) return;

        const that = this;

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
                                    
                                    if (index == 0) {
                                        that.setState({
                                            pic_0: data,
                                            pic_1: pic_1,
                                        })
                                    } else {
                                        that.setState({
                                            pic_0: pic_0,
                                            pic_1: data,
                                        })
                                    }

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

    onApply = () => {
        const {actions} = this.props;
        const {pic_0, pic_1} = this.state;


        if (pic_0.length == 0 || pic_1 == 0) {
            Taro.showToast({
                title: '请先上传认证图片。',
                icon: 'none'
            })
            return;
        }

        actions.teacher.apply({
            gallerys: pic_0 + ',' + pic_1,
            resolved: (data) => {
                this.setState({
                    applyed: true,
                })

                Taro.showToast({
                    title: '申请成功',
                    icon: 'success'
                })
            },
            rejected: (msg) => {

            }
        })

    }

	render () {
        const {loaded, applyed, status, pic_0, pic_1} = this.state;
        console.info(this.state);

        if (!loaded) return null;

        const enable = !applyed;

		return (
			<View className={'teacher container row col bg_light'}>
				<View className={'col_1 h_100'}>
					<ScrollView
						scrollY 
						className={'h_full'}
					>
                        <View className={'p_40 bg_white'}>
                            <Text>认证图片上传</Text>
                            <View className={'row ai_ct mt_30'}>
                                <View className={'mr_10'} onClick={() => this.onUpload(0)}>
                                    <Image src={pic_0 != '' ? pic_0 : asset.base.upload} className={'upload'}/>
                                </View>
                                <View onClick={() => this.onUpload(1)}>
                                    <Image src={pic_1 != '' ? pic_1 : asset.base.upload} className={'upload'}/>
                                </View>
                            </View>
                        </View>
                        <View className={'p_40 row ai_ct'} onClick={() => {
                            Taro.navigateTo({
                                url: '/v2/pages/user/teacher/rule'
                            })
                        }}>
                            <IconFont name={'gouxuan'} size={24} color={'#00A6F6'}/>
                            <Text className={'label_12 label_light ml_10'}>已经阅读并同意《经销商认证讲师责任认定协议》条款</Text>
                        </View>
                        <View className={'p_40 mt_30'}>
                            <Button className={'bg_blue label_white'} disabled={!enable} onClick={this.onApply}>{applyed ? mstatus[status] : '提交'}</Button>
                        </View>
                    </ScrollView>
                </View>
			</View>
		)
	}
}

const LayoutComponent = Apply;

function mapStateToProps(state) {
	return {
		apply_info: state.teacher.apply_info,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})
