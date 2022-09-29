import React, { Component } from 'react'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { View, ScrollView, Progress, Button, Image, Video, Text } from '@tarojs/components'
import connectComponent from '../../../../util/connect'
import RecommComment from '../../../../components/comment/recomm'
import IconFont from '../../../../components/iconfont'
import Modal from '../../../../components/base/modal'
import * as tool from '../../../../util/tool'
import './activity.less'
import '@tarojs/taro/html.css'


class Activity extends Component {

    state = {
        loaded: false,

        index: 0,

        follow: 0,
        isFollow: false,
        isFinish: false,
        canApply: false,
        isApply: false,

        canVote: false,

        video_preview: false,
        video_url: '',
    }

    fromuid = getCurrentInstance().router.params.fromuid || 0
    activityId = getCurrentInstance().router.params.activityId || 0
    activity = {}
    vote = []
    work = []
    comments = []
    topicId = 0

    componentDidShow() {
        this.fromuid = getCurrentInstance().router.params.fromuid || 0
        if (this.fromuid > 0) {
			global.fromuid = this.fromuid
		}
        
		this.onHeaderRefresh()
	}

    componentWillReceiveProps(nextProps) {
        const {user, info, comment, work} = nextProps;

        if (user != this.props.user) {
            global.uid = user.userId;
        }
        
        if (info !== this.props.info) {
            this.activity = info;

            let canVote = false;

            if (info.topicDTO) {
                this.vote = info.topicDTO.optionList;
                this.topicId = info.topicDTO.topicId;
                canVote = info.topicDTO.canVote;
            }
            
            this.setState({
                loaded: true,
                follow: info.follow,
                isFollow: info.isFollow,
                isFinish: info.isFinish,
                isApply: info.isApply,
                canApply: info.canApply,
                canVote: canVote,
            })
        }

        if (work !== this.props.work) {
            this.work = work.items;
        }

        if (comment !== this.props.comment) {
            this.comments = comment.items;
        }
    }

    onShareAppMessage = (res) => {
        
        return {
            title: this.activity.title,
            path: '/v2/pages/discovery/activity/activity?activityId=' + this.activityId + '&fromuid=' + global.uid + '&utype=' + global.utype,
            imageUrl: this.activity.activityImg,
        }

    }

    onHeaderRefresh = () => {
        const {actions} = this.props
        actions.user.user()
        actions.activity.info(this.activityId)
        actions.activity.work(this.activityId, '', 0)
        actions.site.comment(this.activityId, 2, 2, 0)
    }

    onAction = (action, args) => {
        const {actions, user} = this.props;
        const {follow, isFollow} = this.state;

        if (!user.userId) {
            
            Taro.navigateTo({
				url: '/pages/user/passport'
			})

        } else {
            if (action == 'Join') {
                let page = 'join';

                if (this.activity.atype == 4) {
                    page = 'paper';
                }

                Taro.navigateTo({
                    url: '/v2/pages/discovery/activity/' + page + '?activityId=' + this.activityId,
                })
                
            } else if (action == 'Follow') {

                if (isFollow) {
                    actions.user.unfollowContent({
                        content_id: this.activity.activityId,
                        ctype: 2,
                        resolved: (data) => {
                            this.setState({
                                isFollow: false,
                                follow: follow - 1,
                            })
                        },
                        rejected: (msg) => {
    
                        }
                    })
                } else {
                    actions.user.followContent({
                        content_id: this.activity.activityId,
                        ctype: 2,
                        resolved: (data) => {
                            this.setState({
                                isFollow: true,
                                follow: follow + 1,
                            })
                        },
                        rejected: (msg) => {
    
                        }
                    })
                }

            } else if (action == 'Praise') {
                let comment = this.comments[args.index];

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

                    actions.user.likeComment({
                        comment_id: comment.commentId,
                        resolved: (data) => {

                        },
                        rejected: (msg) => {

                        }
                    })
                }

                this.comments[args.index] = comment;

                this.setState({
                    index: args.index
                })
            } else if (action == 'Vote') {
                const index = args.index;
                let option = this.vote[index];
                let answer = {};
                answer[this.topicId] = [option.optionId];
                
                actions.activity.answer({
                    activity_id: this.activity.activityId,
                    answer:  JSON.stringify(answer),
                    resolved: (data) => {

                        Taro.showToast({
							title: '投票成功',
							icon: 'success'
						})

                        option.num++;
                        option.canVote = false;
                        this.vote[index] = option;
                        
                        this.setState({
                            canVote: false,
                        })

                        
                    },
                    rejected: (msg) => {

                        Taro.showToast({
							title: '系统错误',
							icon: 'none'
						})
                    }
                })
            }
        }

    }

    renderVote = () => {
        const {canVote} = this.state;
        const over = this.activity.astatus == 2;

        if (this.activity.ctype == 16) {
            return (
                <View className={'work row wrap'}>
                    {this.vote.map((op, index) => {
                        return (
                            <View className={'item bg_light p_10 circle_5 mt_20'}>
                                <Image src={op.url + '?x-oss-process=video/snapshot,t_10000,m_fast'} className={'work_thumb bg_light'} onClick={() => {
                                    this.setState({
                                        video_url: op.url,
                                        video_preview: true,
                                    })
                                }}/>
                                <View className={'row ai_ct jc_sb mt_5'}>
                                    <Text>{op.optionLabel}</Text>
                                    <Text className={'label_blue'}>{op.num}票</Text>
                                </View>
                                <Button className={'bg_blue label_white mt_5 label_12'} disabled={!canVote}  onClick={() => this.onAction('Vote', {index: index})}>{over ? '结束' : (op.canVote ? '投票' : '已投')}</Button>
                            </View>
                        )
                    })}
                </View>
            )
        } else if (this.activity.ctype == 17) {
            return (
                <View className={'work row wrap'}>
                    {this.vote.map((op, index) => {
                        return (
                            <View className={'item bg_light p_10 circle_5 mt_20'}>
                                <Image src={op.url} className={'work_thumb bg_light'} onClick={() => {
                                    Taro.previewImage({
                                        urls: [op.url]
                                    })
                                }}/>
                                <View className={'row ai_ct jc_sb mt_5'}>
                                    <Text>{op.optionLabel}</Text>
                                    <Text className={'label_blue'}>{op.num}票</Text>
                                </View>
                                <Button className={'bg_blue label_white mt_5 label_12'} disabled={!canVote} onClick={() => this.onAction('Vote', {index: index})}>{over ? '结束' : (op.canVote ? '投票' : '已投')}</Button>
                            </View>
                        )
                    })}
                </View>
            )
        }

        return (
            <View>
                {this.vote.map((op, index) => {
                    return (
                        <View className={'row mt_30'}>
                            <View className={'col_5 pr_20'}>
                                <View className={'row ai_ct jc_sb'}>
                                    <Text>{op.optionLabel}</Text>
                                    <Text>{op.num}票</Text>
                                </View>
                                <Progress activeColor={'#00A6F6'} percent={this.activity.num > 0 ? parseFloat(op.num / this.activity.num) * 100 : 0} className={'mt_5'}/>
                            </View>
                            <Button size={'mini'} className={'bg_blue label_white'} disabled={!canVote} onClick={() => this.onAction('Vote', {index: index})}>{over ? '结束' : (op.canVote ? '投票' : '已投')}</Button>
                        </View>
                    )
                })}
            </View>
        )
    }

	render () {
        const {loaded, follow, isFollow, isFinish, isApply, canApply, video_preview, video_url} = this.state
        if (!loaded) return null

        const over = this.activity.astatus == 2;
        const is_video = this.activity.ctype == 16;

		return (
			<View className={'activity container row col bg_light'}>
				<View className={'col_1 h_100'}>
					<ScrollView
						scrollY 
						className={'h_full'}
					>
                        <View className={'p_40 bg_white'}>
                            <Image src={this.activity.activityImg} className={'thumb bg_light circle_10'}  mode={'aspectFill'}/>
                            <Text className={'row label_16 mt_10'}>{this.activity.title}</Text>
                            <View className={'row ai_ct jc_sb mt_30'}>
                                <Text className={'label_12 label_gray'}>{this.activity.pubTimeFt}</Text>
                                <Button className={'label_blue mr_0'} size={'mini'} onClick={()=> this.onAction('Follow')}>{isFollow ? '取消关注' : '+ 关注'}</Button>
                            </View>
                            <Text className={'row mt_30'}>
                                <Text className={'label_light'}>活动时间：</Text>{tool.ts2dt(this.activity.beginTime)}-{tool.ts2dt(this.activity.endTime)}{'\n'}
                                <Text className={'label_light'}>参加人数：</Text>{this.activity.num}{'\n'}
                                <Text className={'label_light'}>关注人数：</Text>{follow}
                            </Text>
                            <View className={'mt_30 taro_html'} dangerouslySetInnerHTML={{__html: this.activity.content}}></View>
                            {this.activity.atype == 3 ? this.renderVote() : null}

                            {this.work.length > 0 ?
                            <View className={'mt_30'}>
                                <Text className={'label_16'}>作品展示</Text>
                                <View className={'work row wrap'}>
                                    {this.work.map((work, index) => {
                                        let thumb = '';
                                        if (work.galleryList && work.galleryList.length > 0) {
                                            thumb = work.galleryList[0].fpath;
                                        }

                                        return (
                                            <View className={'item bg_light p_10 circle_5 mt_20'}>
                                                <Image src={thumb + (is_video ? "?x-oss-process=video/snapshot,t_10000,m_fast" : "")} className={'work_thumb bg_light'} onClick={() => {
                                                    if (is_video) {
                                                        this.setState({
                                                            video_url: thumb,
                                                            video_preview: true,
                                                        })
                                                    } else {
                                                        Taro.previewImage({
                                                            urls: tool.gurls(work.galleryList)
                                                        })
                                                    }
                                                }}/>
                                                <View className={'row ai_ct jc_sb mt_5'}>
                                                    <Text>{work.username}</Text>
                                                    <Text className={'label_blue'}>{work.number}票</Text>
                                                </View>
                                                <Button className={'bg_blue label_white mt_5 label_12'} onClick={() => {
                                                    Taro.navigateTo({
                                                        url: '/v2/pages/discovery/activity/work?activityId=' + this.activityId,
                                                    })
                                                }}>{over ? '已结束' : (work.isVote ? '已投票' : '投票')}</Button>
                                            </View>
                                        )
                                    })}
                                </View>
                            </View>
                            : null}
                        </View>
                        <View className={'p_40 bg_white mt_10'}>
							<RecommComment comments={this.comments} onPraise={(index) => this.onAction('Praise', {index: index})}/>
						</View>
                        <View className={'row col p_15 ai_ct bg_white border_light'} onClick={() => {
							Taro.navigateTo({
								url: '/v2/pages/base/comment/comment?ctype=2&content_id=' + this.activityId,
							})
						}}>
							<Text className={'label_12 label_gray'}>查看全部评论</Text>
						</View>
                    </ScrollView>
                </View>
                <View className={'p_5 bg_white top_light safe'}>
                    {this.activity.atype == 4 && this.activity.astatus == 0 && !isFinish ?
                    <Button className={'col_1 bg_blue label_white'} onClick={()=> this.onAction('Join')}>开始问卷</Button>
                    : null}
                    {this.activity.atype == 2 && this.activity.astatus == 0 && canApply && !isApply ?
                    <Button className={'col_1 bg_blue label_white'} onClick={()=> this.onAction('Join')}>马上参加</Button>
                    : null}
                </View>
                <Modal visible={video_preview}>
                    <View className={'video_preview bg_black row col ai_ct jc_ct'}>
                        <Video
                            className={'video'}
                            src={video_url}
                            autoplay
                        />
                        <View className={'video_close'} onClick={() => {
                            this.setState({
                                video_preview: false,
                            })
                        }}>
                            <IconFont name={'guanbi'} color={'white'} size={48}/>
                        </View>
                    </View>
                </Modal>
			</View>
		)
	}
}

const LayoutComponent = Activity;

function mapStateToProps(state) {
	return {
		user: state.user.user,
        info: state.activity.info,
        work: state.activity.work,
        comment: state.site.comment,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})