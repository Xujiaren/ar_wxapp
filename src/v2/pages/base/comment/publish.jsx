import React, { Component } from 'react'
import Taro, {getCurrentInstance} from '@tarojs/taro'
import { View, Button, Textarea, Image, Text } from '@tarojs/components'

import IconFont from '../../../../components/iconfont';
import connectComponent from '../../../../util/connect'
import Modal from '../../../../components/base/modal'
import asset from '../../../../config/asset'
import './comment.less'

class Publish extends Component {

	state = {
		rule: global.tip == 1,
		content: '',
		gallery: [],
	}

	ctype = getCurrentInstance().router.params.ctype || 0
	content_id = getCurrentInstance().router.params.content_id || 0

	onTip = () => {
		const {actions} = this.props; 
        this.setState({
            rule: false,
        })

        actions.config.tip({
            resolved: (data) => {
            },
            rejected: (msg) => {
                
            }
        })
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
        const {content, gallery} = this.state;

        //content.length > 0;

        if (content.length == 0) {
            Taro.showToast({
				title: '提交失败，请输入评论。',
				icon: 'none'
			})
            return;
        }

        actions.user.comment({
            ctype: this.ctype,
            content_id: this.content_id,
            score: 5,
            teacher_score: 5,
            content: content,
            gallery: gallery.join(","),

            resolved: (data) => {
				Taro.showToast({
					title: '提交成功',
					icon: 'success',
					duration: 1500,
					success: () => {
						Taro.navigateBack()
					}
				})
                
            },
            rejected: (msg) => {
                let error = '系统错误，请稍后再试!';
                if (msg == 'WORD_ERROR') {
                    error = '请注意您的言论！';
                } else if (msg == 'ACCOUNT_DENY') {
                    error = '账户已禁用，请联系客服！';
                }
                
                Taro.showToast({
					title: error,
					icon: 'none'
				})
            },
        })
	}

	render () {

		const {rule, content, gallery} = this.state;

		return (
			<View className='comment container row col bg_light'>
				<View className={'p_30 bg_white'}>
					<Textarea placeholder={'欢迎参与评论，内容将审核以后展示。'} className={'bg_light content circle_5 p_20'} value={content} onInput={(e) => {
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
				<View className={'p_30 mt_30'}>
					<Button className={'col_1 bg_blue label_white'} onClick={this.onPublish}>提交</Button>
				</View>

				<Modal visible={rule}>
					<View className={'modal'} onClick={() => {
						this.setState({
							rule: false,
						})
					}}/>

					<View className={'rule bg_white circle_5'}>
						<View className={'p_10 border_bottom'}>
							<Text className={'label_16 ai_ct'}>留言规则</Text>
							<Text className={'row mt_10'}>
								用户留言不得发布以下内容：{'\n'}
								1、捏造、散播和宣传危害国家统一、公共安全、社会秩序等言论； {'\n'}
								2、恶意辱骂、中伤、诽谤他人及企业； {'\n'}
								3、涉及色情、污秽、低俗的的信息及言论；{'\n'} 
								4、广告信息； {'\n'}
								5、《直销管理条例》、《禁止传销条例》、《反不正当竞争法》等法律法规禁止的内容； {'\n'}
								6、政治性话题及言论； {'\n'}
								7、对任何企业、组织现行规章制度的评论和讨论，及传播任何未经官方核实的信息； 如违反以上规定，平台有权实施账户冻结、注销等处理，情节严重的，将保留进一步法律追责的权利。
							</Text>
						</View>
						<View className={'row ai_ct p_10'}>
							<Button size={'mini'} className={'col_1'} onClick={() => {
								this.setState({
									rule: false,
								})
							}}>关闭</Button>
							<Button size={'mini'} className={'col_1 bg_blue label_white ml_10'} onClick={this.onTip}>不再提示</Button>
						</View>
					</View>
				</Modal>
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