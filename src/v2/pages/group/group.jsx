import React, { Component } from 'react'
import Taro, {getCurrentInstance} from '@tarojs/taro'
import { View, ScrollView, Button, Input, Image, Text } from '@tarojs/components'
import _ from 'lodash';

import IconFont from '../../../components/iconfont'
import Modal from '../../../components/base/modal'
import connectComponent from '../../../util/connect'
import * as tool from '../../../util/tool'
import './group.less'

class Group extends Component {

    state = {
        refresh: false,
        loaded: false,
        isPunch: false,
        canApply: true,
        canPunch: false,

        comment_id: 0,
        reply: false,
        reply_content: '',

        index: 0,

        apply_content: '',
    }

    activityId = getCurrentInstance().router.params.activityId || 0
    group = {}
    page = 1
    pages = 1
    total = 0
	items = []

    componentDidShow() {
		const {actions} = this.props;
		actions.user.user();

		this.onHeaderRefresh();
	}

    componentWillReceiveProps(nextProps) {
        const {user, info, comment} = nextProps;

        if (user != this.props.user) {
            global.uid = user.userId;
        }

        if (info !== this.props.info && info.activityId) {
            this.group = info;

            this.setState({
                loaded: true,
                isPunch: info.isPunch,
                canApply: info.canApply,
                canPunch: info.canPunch,
            })
        }

        if (comment !== this.props.comment) {
            this.items = this.items.concat(comment.items);
            this.total = comment.total;
            this.pages = comment.pages;
        }

        this.setState({
            refresh: false
        })
    }

    onShareAppMessage = (res) => {
        
        return {
            title: this.group.title,
            path: '/v2/pages/group/group?activityId=' + this.activityId + '&fromuid=' + global.uid + '&utype=' + global.utype,
            imageUrl: this.group.activityImg,
        }

    }


    onHeaderRefresh = () => {
        const {actions} = this.props;
        actions.group.info(this.activityId);

        this.page = 1;
        this.pages = 1;
        this.total = 0;
        this.items = [];

        actions.group.comment(this.activityId, 0);

        this.setState({
            refresh: true
        })
    }

    onFooterRefresh = () => {
        const {actions} = this.props;

        if (this.page < this.pages) {
            this.page = this.page + 1;
            actions.group.comment(this.activityId, this.page);
        }
    }

    onAction = (action, args) => {
        const {actions, user} = this.props;


        if (action == 'Praise') {
            let comment = this.items[args.index];

            let likeUserNameList = comment.likeUserNameList;

            _.pull(likeUserNameList, user.nickname);

            if (comment.like) {
                comment.like = false;
                comment.praise--;
                
                actions.user.unlikeComment({
                    comment_id: comment.commentId,
                    resolved: (data) => {

                    },
                    rejected: (msg) => {

                    }
                })

            } else {
                comment.like = true;
                comment.praise++;
                likeUserNameList.push(user.nickname);

                actions.user.likeComment({
                    comment_id: comment.commentId,
                    resolved: (data) => {
                        
                    },
                    rejected: (msg) => {

                    }
                })
            }

            comment.likeUserNameList = likeUserNameList;

            this.items[args.index] = comment;

            this.setState({
                index: args.index
            })
        }
    }

    onApply = () => {
        const {actions} = this.props;
        const {apply_content} = this.state;

        actions.group.apply({
            activity_id: this.activityId,
            content: apply_content,
            resolved: (data) => {

                Taro.showToast({
                    title: '提交成功',
                    icon: 'success',
                    duration: 1500,
                    success: () => {
                        this.setState({
                            canApply: false,
                            apply_content: '',
                        }, () => {
                            Taro.navigateBack()
                        })
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

    onReply = () => {
        const {actions} = this.props;
        const {canPunch, comment_id, reply_content} = this.state;
        
        if (canPunch) {
            const that = this
            actions.group.reply({
                comment_id: comment_id,
                content: reply_content,
                resolved: (data) => {
                    
                    Taro.showToast({
                        title: '提交成功',
                        icon: 'success',
                        duration: 1500,
                        success: () => {
                            this.setState({
                                reply: false,
                                reply_content: '',
                            }, () => {
                                that.onHeaderRefresh()
                            })
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
    }

	render () {
        const {user} = this.props;
        const {loaded, refresh, isPunch, canApply, canPunch, apply_content, reply, reply_content} = this.state;
        if (!loaded) return null;

        const enable = canPunch && !isPunch;
        const reply_enable = reply_content.length > 0;

		return (
			<View className={'group container row col'}>
				<View className={'col_1 h_100'}>
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
						<View className={'p_40'}>
                            <Image src={this.group.activityImg} className={'group_thumb bg_light circle_10'}/>
                            <View className={'p_10'}>
                                <Text className={'label_gray'}>简介：{this.group.content}</Text>
                            </View>
                            <View className={'row ai_ct jc_sb mt_30'}>
                                {user.userId == this.group.userId ?
                                <Button size={'mini'} className={'bg_blue label_white ml_0'} onClick={() => {
                                    Taro.navigateTo({
                                        url: '/v2/pages/group/member?activityId=' + this.activityId,
                                    })
                                }}>参与用户</Button>
                                :
                                <Text/>
                                }
                                <Text className={'label_gray'}>{this.group.commentNum}人打卡</Text>
                            </View>
                           {canPunch ? this.items.map((comment, index) => {
                               return (
                                    <View className={'citem mt_30 row ai_fs pb_10 bottom_light'}>
                                        <Image src={comment.avatar} className={'avatar bg_light'}/>
                                        <View className={'ml_10 col_1 pt_10'}>
                                            <View className={'row ai_ct jc_sb'}>
                                                <Text>{comment.username}</Text>
                                                <View className={'row ai_ct'}>
                                                    <View onClick={() => {
                                                        if (canPunch) {
                                                            this.onAction('Praise', {index: index})
                                                        }
                                                    }}>
                                                        <IconFont name={comment.like ? 'dianzan1' : 'dianzan'} size={24}/>
                                                    </View>
                                                    <View className={'ml_10'} onClick={() => {
                                                        if (canPunch) {
                                                            this.setState({
                                                                comment_id: comment.commentId,
                                                                reply: true,
                                                            })
                                                        }
                                                    }}>
                                                        <IconFont name={'reply'} size={24}/>
                                                    </View>
                                                </View>
                                            </View>
                                            <View className={'border_light circle_5 p_10 mt_10'}>
                                                <Text>{tool.ts2dt(comment.pubTime)}打卡成功！</Text>
                                                <Text className={'row label_gray mt_5'}>{comment.content}</Text>
                                                {comment.others != '' ? <Text className={'row mt_5'}>活动数据：{comment.others}</Text> : null}
                                                {comment.galleryList.length > 0 ?
                                                <View className={'gallerys row wrap mt_5'}>
                                                    {comment.galleryList.map((gallery, index) => {
                                                        return (
                                                            <Image src={gallery.fpath} className={'gallery bg_light'} onClick={() => {
                                                                Taro.previewImage({
                                                                    urls: tool.gurls(comment.galleryList),
                                                                })
                                                            }}/>
                                                        )
                                                    })}
                                                </View>
                                                : null}
                                            </View>
                                            {comment.likeUserNameList.length > 0 || comment.childList.length > 0 ?
                                            <View className={'bg_light circle_5 p_10 mt_10'}>
                                                <View className={'row ai_ct'}>
                                                    <IconFont name={'dianzan'} size={24}/>
                                                    <Text className={'row ml_5'}>{comment.likeUserNameList.join(',')}</Text>
                                                </View>
                                                {comment.childList.map((ccomment, index) => {
                                                    return <Text className={'row mt_5'}>{ccomment.username}: {ccomment.content}</Text>
                                                })}
                                            </View>
                                            : null}
                                        </View>
                                    </View>
                               )
                           }) : null}
						</View>
					</ScrollView>
				</View>
                <View className={'p_10 bg_white top_light safe'}>
                    <Button className={'col_1 bg_blue label_white'} disabled={!enable} onClick={() =>  {
                        Taro.navigateTo({
                            url: '/v2/pages/group/groupOn?activityId=' + this.activityId,
                        })
                    }}>{canPunch ? '打卡' : '等待审核'}</Button>
                </View>

                <Modal visible={canApply}>
                    <View className={'modal'} onClick={() => {
                        this.setState({
                            canApply: false,
                        }, () => {
                            Taro.navigateBack()
                        })
                    }}/>

                    <View className={'apply bg_white circle_5'}>
                        <View className={'p_10 border_bottom'}>
                            <Text className={'label_16'}>如果您想要加入活动，需要将向活动发起人发起参与申请</Text>
                            <Input className={'p_5 circle_5 bg_light mt_10'} placeholder={'申请内容 ，非必填。'} value={apply_content} onInput={(e) => {
                                this.setState({
                                    apply_content: e.detail.value
                                })
                            }}/>
                        </View>
                        <View className={'row ai_ct p_10'}>
                            <Button className={'col_1'} size={'mini'} onClick={() => {
                                this.setState({
                                    canApply: false,
                                }, () => {
                                    Taro.navigateBack()
                                })
                            }}>取消</Button>
                            <Button className={'col_1 bg_blue label_white ml_10'} size={'mini'} onClick={this.onApply}>申请</Button>
                        </View>
                    </View>
                </Modal>

                <Modal visible={reply}>
                    <View className={'modal'} onClick={() => {
                        this.setState({
                            reply: false,
                        })
                    }}/>

                    <View className={'apply bg_white circle_5'}>
                        <View className={'p_10 border_bottom'}>
                            <Text className={'label_16'}>评论</Text>
                            <Input className={'p_5 circle_5 bg_light mt_10'} placeholder={'申请内容 ，非必填。'} value={reply_content} onInput={(e) => {
                                this.setState({
                                    reply_content: e.detail.value
                                })
                            }}/>
                        </View>
                        <View className={'row ai_ct p_10'}>
                            <Button className={'col_1'} size={'mini'} onClick={() => {
                                this.setState({
                                    reply: false,
                                })
                            }}>取消</Button>
                            <Button className={'col_1 bg_blue label_white ml_10'} size={'mini'} onClick={this.onReply} disabled={!reply_enable}>评论</Button>
                        </View>
                    </View>
                </Modal>
			</View>
		)
	}
}

const LayoutComponent = Group;

function mapStateToProps(state) {
	return {
		user: state.user.user,
        info: state.group.info,
        comment: state.group.comment,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})