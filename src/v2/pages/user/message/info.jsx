import React, { Component } from 'react'
import Taro, {getCurrentInstance} from '@tarojs/taro'
import { View, ScrollView, Button, Image, Text } from '@tarojs/components'
import qs from 'query-string'
import classNames from 'classnames'

import connectComponent from '../../../../util/connect'
import IconFont from '../../../../components/iconfont'
import Modal from '../../../../components/base/modal'
import './message.less'

class Info extends Component {

    state = {
        preview: false,
        preview_index: 0,

        refresh: false,
    }

    type = getCurrentInstance().router.params.type || 0
    page = 0
    pages = 1
    total = 0
    items = []

    componentWillMount() {
        Taro.setNavigationBarTitle({
            title: '特定消息'
        })
    }

    componentDidShow() {
		this.onHeaderRefresh();
	}

    componentWillReceiveProps(nextProps) {
        const {remind, message} = nextProps;

        if (remind !== this.props.remind) {
            this.pages = remind.pages;
            this.total = remind.total;
            this.items = this.items.concat(remind.items);
        }

        if (message !== this.props.message) {
            this.pages = message.pages;
            this.total = message.total;
            this.items = this.items.concat(message.items);
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

        if (this.type == 1) {
            actions.user.remind(0);
        } else {
            actions.user.message(0);
        }

        this.setState({
            refresh: true,
        })
    }

    onFooterRefresh = () => {
        const {actions} = this.props;

        if (this.page < this.pages) {
            this.page = this.page + 1;
            if (this.type == 1) {
                actions.user.remind(this.page);
            } else {
                actions.user.message(this.page);
            }
        }
    }

    onReadAll = () => {
        const {actions} = this.props;

        let mids = [];
        this.items.map((item, index) => {
            mids.push(this.type == 1 ? item.remindId : item.messageId);
        });

        if (mids.length > 0) {
            actions.user.messageOperate({
                type: this.type,
                message_ids: mids.join(','),
                operate: 0,
                resolved: (data) => {
                    actions.user.unread();
                    this.onHeaderRefresh();
                },
                rejected: (msg) => {
                    
                }
            })
        }
    }

    onRemoveAll = () => {
        const {actions} = this.props;
        let mids = [];
        this.items.map((item, index) => {
            mids.push(this.type == 1 ? item.remindId : item.messageId);
        });
        
        if (mids.length > 0) {
            Taro.showModal({
                title: '消息管理',
                content: '确定删除消息?',
                success: function (res) {
                    if (res.confirm) {
                        actions.user.messageOperate({
                            type: this.type,
                            message_ids: mids.join(','),
                            operate: 1,
                            resolved: (data) => {
                                actions.user.unread();
                                this.onHeaderRefresh();
                            },
                            rejected: (msg) => {
                                
                            }
                        })
                    }
                }
            })
        }
    }

    onJump = (link) => {
		let data = qs.parseUrl(link);

		if (link.substring(0, 4) === 'http') {
			Taro.navigateTo({
				url: '/v2/pages/base/web?link=' + encodeURIComponent(link)
			})
		} else if (data.url.indexOf('courseDesc') !== -1) {
            const courseId = data.query['course_id'];
            Taro.navigateTo({
				url: '/v2/pages/course/vod?courseId=' + courseId
			})
        } else if (data.url.indexOf('liveDesc') !== -1) {
            const courseId = data.query['course_id'];
            Taro.navigateTo({
				url: '/v2/pages/course/live?courseId=' + courseId
			})
        } else if (data.url.indexOf('consultDesc') !== -1) {
            const courseId = data.query['course_id'];
            Taro.navigateTo({
				url: '/v2/pages/course/article?courseId=' + courseId
			})
        } else if (data.url.indexOf('audioDeSC') !== -1) {
            const courseId = data.query['course_id'];
            Taro.navigateTo({
				url: '/v2/pages/course/audio?courseId=' + courseId
			})
        } else if (data.url.indexOf('groupDeSC') !== -1) {
            const activityId = data.query['group_id'];
            Taro.navigateTo({
				url: '/v2/pages/group/group?activityId=' + activityId
			})
        } else if (data.url.indexOf('articleDeSC') !== -1) {
            const articleId = data.query['article_id'];
            Taro.navigateTo({
				url: '/v2/pages/news/news?articleId=' + articleId
			})
        } else if (data.url.indexOf('activityDeSC') !== -1) {
            const activityId = data.query['activity_id'];
            Taro.navigateTo({
				url: '/v2/pages/discovery/activity/activity?activityId=' + activityId
			})
        }
	}

    onPreview = (index) => {
        const {actions} = this.props;
        const item = this.items[index];

        actions.user.messageOperate({
            type: this.type,
            message_ids: this.type == 1 ? item.remindId : item.messageId,
            operate: 0,
            resolved: (data) => {
                if (this.type == 0 && item.link) {

                    this.onJump(item.link);
        
                } else {
                    this.setState({
                        preview: true,
                        preview_index: index,
                    })
                }
            },
            rejected: (msg) => {
                
            }
        })
    }
    
	render () {
        const {refresh, preview, preview_index} = this.state;

        const msg = this.items[preview_index] ? this.items[preview_index] : {};

		return (
			<View className={'message container row col bg_light'}>
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
                        {this.items.map((message, index) => {
                            return (
                                <View className={classNames('border_light p_15 bg_white circle_10 mb_30 ', {'op_8': message.status == 1} )}>
                                    {this.type == 1?
                                    <View className={'bottom_light pb_10'}>
                                        <Text className={'label_16'}>{message.title}</Text>
                                        <Text className={'label_light row mt_5'}>{message.content}</Text>
                                        <Text className={'label_12 label_light row mt_5'}>{message.pubTimeFt}</Text>
                                    </View>
                                    :
                                    <View className={'bottom_light pb_10'}>
                                        <Text className={'label_16'}>{message.title}</Text>
                                        <View className={'row ai_fs mt_10'}>
                                            {message.messageImg != '' ? 
                                            <Image src={message.messageImg} className={'thumb mr_10'}/> : 
                                            null}
                                            <View>
                                                <Text className={'label_light'}>{message.summary}</Text>
                                                <Text className={'label_12 label_light row mt_5'}>{message.pubTimeFt}</Text>
                                            </View>
                                            
                                        </View>
                                    </View>
                                    }
                                    <View className={'row ai_ct jc_end pt_10'}>
                                        <View className={'row ai_ct'} onClick={()=> this.onPreview(index)}>
                                            <Text className={'label_light row mr_5'}>点击查看更多</Text>
                                            <IconFont name={'right'} color={'#999999'}/>
                                        </View>
                                    </View>
                                </View>
                            )
                        })}
                        </View>
                    </ScrollView>
                </View>
                <View className={'row ai_ct p_10 bg_white top_light'}>
                    {this.type == 1 ?
                    <Button className={'col_1 mr_10'} size={'mini'} onClick={this.onRemoveAll}>全部删除</Button>
                    : null}
                    <Button className={'col_1'} size={'mini'} onClick={this.onReadAll}>全部已读</Button>
                </View>

                <Modal visible={preview}>
                    <View className={'modal'} onClick={() => {
                        this.setState({
                            preview: false,
                        })
                    }}/>
                    <View className={'msg row col bg_white circle_10 p_10'}>
                        <View className={'col_1'}>
                            <Text className={'label_16'}>{msg.title}</Text>
                            <Text className={'label_12 label_gray row mt_5'}>{msg.pubTimeFt}</Text>
                            {msg.messageImg && msg.messageImg != '' ?
                            <Image src={msg.messageImg} className={'pic as_ct mt_10'}/>
                            : null}
                            <Text className={'label_gray row mt_10'}>{msg.content}</Text>
                        </View>
                        <Button size={'mini'} onClick={() => {
                            this.setState({
                                preview: false,
                            })
                        }}>关闭</Button>
                    </View>
                </Modal>
			</View>
		)
	}
}

const LayoutComponent = Info;

function mapStateToProps(state) {
	return {
		remind: state.user.remind,
        message: state.user.message,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})