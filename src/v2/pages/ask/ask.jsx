import React, { Component } from 'react'
import Taro, {getCurrentInstance} from '@tarojs/taro'
import { View, ScrollView, Button, Image, Text } from '@tarojs/components'
import IconFont from '../../../components/iconfont'
import connectComponent from '../../../util/connect'
import RecommComment from '../../../components/comment/recomm'
import * as tool from '../../../util/tool'
import './ask.less'

class Ask extends Component {

	state = {

		refresh: false,
		loaded: false,
		index: 0,

		isCollect: false,
		collectNum: 0,

	}

	ask = {}
	fromuid = getCurrentInstance().router.params.fromuid || 0
	askId = getCurrentInstance().router.params.askId || 0
	total = 0
    page = 0
    pages = 1
	items = []
	comments = []

	componentDidShow() {
		const {actions} = this.props;
		actions.ask.info(this.askId);
        actions.site.comment(this.askId, 10, 2, 0);

		this.fromuid = getCurrentInstance().router.params.fromuid || 0
		if (this.fromuid > 0) {
			global.fromuid = this.fromuid
		}

		this.onHeaderRefresh();
	}

	componentWillReceiveProps(nextProps) {
        const {ask, reply} = nextProps;
        
        if (ask !== this.props.ask) {
            this.ask = ask;
            this.setState({
                loaded: true,
                isCollect: ask.isCollect,
                collectNum: ask.collect,
            })
        }

        if (reply !== this.props.reply) {
            this.items = this.items.concat(reply.items);
            this.total = reply.total;
            this.pages = reply.pages;
        }

		this.setState({
			refresh: false
		})

    }

	onShareAppMessage = (res) => {
        
        return {
            title: this.ask.title,
            path: '/v2/pages/ask/ask?askId=' + this.askId + '&fromuid=' + global.uid + '&utype=' + global.utype,
            imageUrl: this.ask.avatar,
        }

    }

	onHeaderRefresh = () => {
        const {actions} = this.props;

		this.total = 0;
        this.page = 0;
        this.pages = 1;

        this.items = [];

        actions.ask.reply(this.askId, 0);

		this.setState({
			refresh: true
		})
    }

	onFooterRefresh = () => {
		const {actions} = this.props;

        if (this.page < this.pages) {
            this.page = this.page + 1;
            actions.ask.reply(this.askId, this.page);
        }
	}

	onAction = (action, args) => {
		const {navigation, actions, user} = this.props;
        const {isCollect, collectNum} = this.state;

        if (!user.userId) {
            navigation.navigate('Passport');
        } else {
            if (action == 'PublishComment') {
                Taro.navigateTo({
					url: '/v2/pages/base/comment/publish?ctype=10&content_id=' + this.askId,
				})
            } else if (action == 'Collect') {
                
                if (isCollect) {
                    actions.user.uncollect({
                        ctype: 10,
                        content_id: this.ask.askId,
                        resolved: (data) => {
                            this.setState({
                                isCollect: false,
                                collectNum: collectNum - 1,
                            })
                        },
                        rejected: (msg) => {
    
                        }
                    })

                } else {
                    actions.user.collect({
                        ctype: 10,
                        content_id: this.ask.askId,
                        resolved: (data) => {
                            this.setState({
                                isCollect: true,
                                collectNum: collectNum + 1,
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
            }
        }
	}

	render () {
		const {refresh, loaded, isCollect, collectNum} = this.state
		if (!loaded) return null

		return (
			<View className='ask container row col'>
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
							<Text>{this.ask.title}</Text>
							<View className={'row ai_ct mt_30'}>
								<Image src={this.ask.avatar} className={'avatar bg_light mr_5'}  mode={'aspectFill'}/>
								<Text>{this.ask.nickname}</Text>
							</View>

							<View className={'mt_30'}>
								<Text>{this.ask.content}</Text>
								{this.ask.gallery.length > 0 ?
								<Image src={this.ask.gallery[0].fpath} className={'thumb bg_light mt_10 circle_5'}/>
								: null}
							</View>
							<Text className={'label_light row mt_10'}>{this.ask.hit} 热度 {this.ask.replyNum} 问答 {this.ask.comment} 评论</Text>
						</View>
						<View className={'border_light row ai_ct jc_ad pt_10 pb_10'}>
							<View className={'row ai_ct'} onClick={() => {
								Taro.navigateTo({
									url: '/v2/pages/ask/invite?askId=' + this.askId,
								})
							}}>
								<IconFont name={'invite'} size={24} color={'#00A6F6'}/>
								<Text className={'label_blue row ml_5'}>邀请回答</Text>
							</View>
							<View className={'row ai_ct'} onClick={() => {
								Taro.navigateTo({
									url: '/v2/pages/ask/reply?title=' + this.ask.title + '&askId=' + this.askId,
								})
							}}>
								<IconFont name={'account'} size={24} color={'#00A6F6'}/>
								<Text className={'label_blue row ml_5'}>写回答</Text>
							</View>
						</View>
						<View className={'p_40'}>
							{this.items.map((reply, index) => {
								return (
									<View className={'pt_10 pb_10 bottom_light'}>
										<View className={'row ai_ct jc_sb mb_10'}>
											<View className={'row ai_ct'}>
												<Image src={reply.avatar} className={'avatar bg_light mr_5'}/>
												<Text>{reply.nickname}</Text>
											</View>
											<Text className={'label_light'}>{tool.ts2dt(reply.pubTime)}</Text>
										</View>
										<Text>{reply.content}</Text>
									</View>
								)
							})}
						</View>
						<View className={'p_40 mt_10'}>
							<RecommComment comments={this.comments} onPraise={(index) => this.onAction('Praise', {index: index})}/>
						</View>
						<View className={'row col p_15 ai_ct border_light'} onClick={() => {
							Taro.navigateTo({
								url: '/v2/pages/base/comment/comment?ctype=10&content_id=' + this.askId,
							})
						}}>
							<Text className={'label_12 label_gray'}>查看全部评论</Text>
						</View>
					</ScrollView>
				</View>
				<View className={'row ai_ct p_5 bg_white top_light safe'}>
                    <Button size={'mini'} className={'col_5 label_gray'} onClick={() => this.onAction('PublishComment')}>写留言，发表看法</Button>
                    <View className={'col_1 row col ai_ct'} onClick={() => this.onAction('Collect')}>
                        <View className={'pr'}>
                            <IconFont name={isCollect ? 'aixin1' : 'aixin'} color={isCollect ? 'red' : '#999999'} size={40}/>
                            <View className={'count bg_blue row col ai_ct jc_ct'}>
                                <Text className={'label_9 label_white'}>{collectNum > 99 ? '99+' : collectNum}</Text>
                            </View>
                        </View>
					</View>
                </View>
			</View>
		)
	}
}

const LayoutComponent = Ask;

function mapStateToProps(state) {
	return {
		user: state.user.user,
        ask: state.ask.ask,
        reply: state.ask.reply,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})