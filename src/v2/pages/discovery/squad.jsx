import React, { Component } from 'react'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { View, ScrollView, Button, Image, Text } from '@tarojs/components'
import connectComponent from '../../../util/connect'
import RecommComment from '../../../components/comment/recomm'
import './discovery.less'
import '@tarojs/taro/html.css'
import * as tool from '../../../util/tool'

class Squad extends Component {

    state = {
        loaded: false,
        pay: false,
        pay_index: 0,
        canApply: false,
        registeryNum: 0,
    }

    fromuid = getCurrentInstance().router.params.fromuid || 0
    squadId = getCurrentInstance().router.params.squadId || 0
    squad = {}
    comments = []
    
    componentDidShow() {
        this.fromuid = getCurrentInstance().router.params.fromuid || 0
        if (this.fromuid > 0) {
			global.fromuid = this.fromuid
		}
		this.onHeaderRefresh();
	}

    componentWillReceiveProps(nextProps) {
        const {info, comment} = nextProps;

        if (info !== this.props.info) {
            this.squad = info;
            this.setState({
                loaded: true,
                canApply: info.canApply && info.status == 1,
                registeryNum: info.registeryNum,
            })
        }

        if (comment !== this.props.comment) {
            this.comments = comment.items;
        }
    }

    onShareAppMessage = (res) => {
        
        return {
            title: this.squad.title,
            path: '/v2/pages/discovery/squad?squadId=' + this.squadId + '&fromuid=' + global.uid + '&utype=' + global.utype,
            imageUrl: this.squad.squadImg,
        }

    }

    onHeaderRefresh = () => {
        const {actions} = this.props;
        actions.user.user();
        actions.o2o.info(this.squadId);
        actions.site.comment(this.squadId, 13, 2, 0);
    }

    onAction = (action, args) => {
        const {actions, user} = this.props;

        let registeryNum = this.state.registeryNum;

        if (!user.userId) {
            Taro.navigateTo({
				url: '/pages/user/passport'
			})
        } else {
            if (action == 'Apply') {
                if (this.squad.price > 0) {
                    actions.o2o.pay({
                        squad_id: this.squadId,
                        pay_type: 2,
                        resolved: (data) => {
                            const {pay_info} = data;

                            Taro.requestPayment({
                                nonceStr: pay_info.nonceStr,
                                package: pay_info.package,
                                paySign: pay_info.sign,
                                timeStamp: pay_info.timeStamp + '',
                                signType: "MD5",
                                success: (res) => {

                                    registeryNum++;
                                    actions.o2o.apply({
                                        squad_id: this.squadId,
                                        resolved: (data) => {
                                            this.setState({
                                                canApply: false,
                                                registeryNum: registeryNum,
                                            })
                                            
                                            Taro.showToast({
                                                title: '报名成功。',
                                                icon: 'success'
                                            })
                                        },
                                        rejected: (msg) => {
                                            Taro.showToast({
                                                title: '报名失败。',
                                                icon: 'none'
                                            })
                                        }
                                    })
                                },
                                fail: (res) => {
                                    Taro.showToast({
                                        title: '报名失败。',
                                        icon: 'noew',
                                    })
                                }
                            })
                        },
                        rejected: (msg) => {
                            Taro.showToast({
                                title: '报名失败。',
                                icon: 'none'
                            })
                        }
                    })
                } else {
                    registeryNum++;
                    actions.o2o.apply({
                        squad_id: this.squadId,
                        resolved: (data) => {
                            this.setState({
                                canApply: false,
                                registeryNum: registeryNum,
                            })
                            
                            Taro.showToast({
                                title: '报名成功。',
                                icon: 'success'
                            })
                        },
                        rejected: (msg) => {
                            Taro.showToast({
                                title: '报名失败。',
                                icon: 'none'
                            })
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
        const {loaded, registeryNum, canApply} = this.state;
        if (!loaded) return null;

		return (
			<View className={'squad container row col bg_light'}>
				<View className={'col_1 h_100'}>
					<ScrollView
						scrollY 
						className={'h_full'}
					>
                        <View className={'p_40 bg_white'}>
                            <Image src={this.squad.squadImg} className={'thumb bg_light circle_10'}  mode={'aspectFill'}/>
                            <Text className={'row label_16 mt_10'}>{this.squad.squadName}</Text>
                            <Text className={'row mt_30 bg_white'}>
                                <Text className={'label_light'}>报名时间：</Text>{tool.ts2dt(this.squad.applyBegin)}-{tool.ts2dt(this.squad.applyEnd)}{'\n'}
                                <Text className={'label_light'}>活动时间：</Text>{tool.ts2dt(this.squad.beginTime)}-{tool.ts2dt(this.squad.endTime)}{'\n'}
                                <Text className={'label_light'}>招生人数：</Text>{this.squad.enrollNum}{'\n'}
                                <Text className={'label_light'}>报名人数：</Text>{registeryNum}{'\n'}
                                <Text className={'label_light'}>活动地点：</Text>{this.squad.location}
                            </Text>
                            <View className={'mt_30 taro_html'} dangerouslySetInnerHTML={{__html: this.squad.content}}></View>
                        </View>
                        <View className={'p_40 bg_white mt_10'}>
							<RecommComment comments={this.comments} onPraise={(index) => this.onAction('Praise', {index: index})}/>
						</View>
                        <View className={'row col p_15 ai_ct bg_white border_light'} onClick={() => {
							Taro.navigateTo({
								url: '/v2/pages/base/comment/comment?ctype=13&content_id=' + this.squadId,
							})
						}}>
							<Text className={'label_12 label_gray'}>查看全部评论</Text>
						</View>
                    </ScrollView>
                </View>
                <View className={'p_5 bg_white top_light safe'}>
                    {this.squad.status == 1 ?
                    <Button className={'col_1 bg_blue label_white'} disabled={!canApply} onClick={() => this.onAction('Apply')}>{canApply ? (this.squad.price > 0 ? '立即报名(¥' + parseFloat(this.squad.price).toFixed(2) + ')' : '免费报名') : '已报名'}</Button>
                    :
                    <Button className={'col_1 bg_blue label_white'} disabled={true}>{this.squad.status == 0 ? '即将开启' : '报名已结束'}</Button>
                    }
                </View>
			</View>
		)
	}
}

const LayoutComponent = Squad;

function mapStateToProps(state) {
	return {
		user: state.user.user,
        info: state.o2o.info,
        comment: state.site.comment,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})