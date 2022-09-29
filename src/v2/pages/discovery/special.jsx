import React, { Component } from 'react'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { View, ScrollView, Button, Image, Video, Text } from '@tarojs/components'
import connectComponent from '../../../util/connect'
import IconFont from '../../../components/iconfont'
import RecommComment from '../../../components/comment/recomm'
import './discovery.less'

class Special extends Component {

    state = {
        loaded: false,

        index: 0,
        comment_index: 0,

        cover: '',
        playUrl: '',
        duration: 0,

        isCollect: false,
    }

    fromuid = getCurrentInstance().router.params.fromuid || 0
    articleId = getCurrentInstance().router.params.articleId || 0
	items = []
    comments = []

    componentDidShow() {
        this.fromuid = getCurrentInstance().router.params.fromuid || 0
        if (this.fromuid > 0) {
			global.fromuid = this.fromuid
		}
		this.onHeaderRefresh();
	}

    componentWillReceiveProps(nextProps) {
        const {user, special, comment} = nextProps;

        if (user != this.props.user) {
            global.uid = user.userId;
        }

        if (special !== this.props.special) {
            this.special = special;
            this.items = special.gallery;

            if (special.canShare == 0) {
                Taro.hideShareMenu()
            }

            this.setState({
                loaded: true,
                index: 0,
                isCollect: special.isCollect,
                cover: special.articleImg,
            }, () => {
                if (this.items.length > 0) {
                    this.onPlay(0);
                }
            })
        }

        if (comment !== this.props.comment) {
            this.comments = comment.items;
        }
    }

    onShareAppMessage = (res) => {
        
        return {
            title: this.special.title,
            path: '/v2/pages/discovery/special?articleId=' + this.articleId + '&fromuid=' + global.uid + '&utype=' + global.utype,
            imageUrl: this.special.articleImg + '?x-oss-process=image/resize,w_500,h_380,m_pad'
        }

    }

    onHeaderRefresh = () => {
        const {actions} = this.props;
        actions.user.user();
        actions.news.info(this.articleId);
        actions.site.comment(this.articleId, 15, 2, 0);
    }

    onAction = (action, args) => {
        const {actions, user} = this.props;
        const {isCollect} = this.state;

        if (!user.userId) {
            Taro.navigateTo({
				url: '/pages/user/passport'
			})
        } else {
            if (action == 'PublishComment') {
                Taro.navigateTo({
					url: '/v2/pages/base/comment/publish?ctype=15&content_id=' + this.articleId,
				})
            } else if (action == 'Collect') {
                
                if (isCollect) {
                    actions.user.uncollect({
                        ctype: 15,
                        content_id: this.special.articleId,
                        resolved: (data) => {
                            this.setState({
                                isCollect: false
                            })
                        },
                        rejected: (msg) => {
    
                        }
                    })

                } else {
                    actions.user.collect({
                        ctype: 15,
                        content_id: this.special.articleId,
                        resolved: (data) => {
                            this.setState({
                                isCollect: true
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
                    comment_index: args.index
                })
            }
        }
    }

    onPlay = (index) => {
        const {actions} = this.props;
        const video = this.items[index];

        actions.course.verify({
            media_id: video.link,
            resolved: (data) => {
                this.setState({
                    index: index,
                    cover: video.fpath,
                    mediaId: video.link,
                    duration: data.duration,
                    playUrl: data.m38u,
                })
            },
            rejected: (res) => {
                
            },
        })
    }

    onNext = () => {
        const {index} = this.state;

        if (index < (this.items.length - 1)) {
            let nindex = index + 1;

            this.setState({
                index: nindex,
            }, () => {
                this.onPlay(nindex);
            })
        }
    }

	render () {
        const {loaded, cover, playUrl, duration, isCollect} = this.state;
        if (!loaded) return null;

		return (
			<View className={'special container row col bg_light'}>
				<View>
                    {playUrl != '' ?
						<Video 
							src={playUrl} 
							duration={duration} 
							poster={cover} 
							autoplay={true} 
							className={'video'}

							onEnded={() => {
								this.onNext()
							}}
						/>
						:
						<Image src={this.special.articleImg} className={'video'}  mode={'aspectFill'}/>
                    }
                    <View className={'bg_white p_40 bg_white'}>
                        <View className={'row ai_ct jc_sb'}>
                            <Text className={'label_16'}>{this.special.title}</Text>
                        </View>
                        <Text className={'label_gray'}>{this.special.summary}</Text>
                        <View className={'row ai_ct jc_sb mt_30'}>
                            <View className={'col_1 row ai_ct'}>
                                <IconFont name={'hit'} size={28} color={'#999999'}/>
                                <Text className={'label_gray ml_5 label_12'}>{this.special.hit}</Text>
                            </View>
                            <View className={'col_1 row ai_ct'}  onClick={() => this.onAction('Collect')}>
                                <IconFont name={isCollect ? 'aixin1' : 'aixin'} size={28} color={isCollect ? 'red' : '#999999'}/>
                            </View>
                            <View className={'col_1 row ai_ct'} onClick={() => this.onAction('PublishComment')}>
                                <IconFont name={'comment'} size={28} color={'#999999'}/>
                                <Text className={'label_gray ml_5 label_12'}>{this.special.comment}</Text>
                            </View>
                            <Button className={'row ai_ct mr_0'} openType={'share'}>
                                <IconFont name={'share'} size={28} color={'#999999'}/>
                                <Text className={'label_gray ml_5 label_12'}>分享</Text>
                            </Button>
                        </View>
                    </View>
                </View>

                <View className={'col_1 h_100 mt_10'}>
					<ScrollView
						scrollY 
						className={'h_full'}
					>
                        <View className={'p_40 bg_white'}>
                            <Text className={'label_16'}>选集</Text>
                            <ScrollView
                                scrollX
                            >
                                <View className={'row pt_10 nowrap'}>
                                    {this.items.map((item, index) => {
                                        return (
                                            <View className={'mr_10'} onClick={() => this.onPlay(index)}>
                                                <Image src={item.fpath} className={'thumb bg_light circle_10'}/>
                                            </View>
                                        )
                                    })}
                                </View>
                            </ScrollView>
                        </View>

                        <View className={'p_40 bg_white mt_10'}>
							<RecommComment comments={this.comments} onPraise={(index) => this.onAction('Praise', {index: index})}/>
						</View>
                        <View className={'row col p_15 ai_ct bg_white border_light'} onClick={() => {
							Taro.navigateTo({
								url: '/v2/pages/base/comment/comment?ctype=15&content_id=' + this.articleId,
							})
						}}>
							<Text className={'label_12 label_gray'}>查看全部评论</Text>
						</View>
                    </ScrollView>
                </View>
                <View className={'row ai_ct p_5 bg_white top_light safe'}>
                    <Button size={'mini'} className={'col_1 label_gray'}>写留言，发表看法</Button>
                </View>
			</View>
		)
	}
}

const LayoutComponent = Special;

function mapStateToProps(state) {
	return {
		user: state.user.user,
        special: state.news.news,
        comment: state.site.comment,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})