import React, { Component } from 'react'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { View, ScrollView, Input, Button, Video, Image, Text } from '@tarojs/components'
import IconFont from '../../../../components/iconfont'
import Modal from '../../../../components/base/modal'
import connectComponent from '../../../../util/connect'
import * as tool from '../../../../util/tool'
import './activity.less'

class Work extends Component {

    state = {
        keyword: '',
        user_vote: 0,
        loaded: false,
        refresh: false,
        is_video: false,

        canVote: false,

        video_preview: false,
        video_url: '',

        index: 0,
    }

    activity = {}
    activityId = getCurrentInstance().router.params.activityId || 0
    total = 0
    page = 0
    pages = 1
    items = []

    componentDidShow() {
        const {actions} = this.props;
        actions.user.user()
        actions.activity.info(this.activityId)

		this.onHeaderRefresh()
	}

    componentWillReceiveProps(nextProps) {
        const {info, work, user_vote} = nextProps;
        
        let canVote = false;
        if (info !== this.props.info) {
            this.activity = info;

            if (info.topicDTO) {
                canVote = info.topicDTO.canVote;
            }
            
            this.setState({
                loaded: true,
                canVote: canVote,
                is_video: this.activity.ctype == 16,
            })
        }

        if (work !== this.props.work) {
            this.items = this.items.concat(work.items);
            this.total = work.total;
            this.pages = work.pages;
        }

        if (user_vote !== this.props.user_vote) {
            this.setState({
                user_vote: user_vote,
            })
        }

        this.setState({
            refresh: false,
        })
    }

    onHeaderRefresh = () => {
        const {actions} = this.props;
        const {keyword} = this.state;
        
        this.total = 0;
        this.page = 0;
        this.pages = 1;
        this.items = [];

        actions.activity.userVote(this.activityId);
        actions.activity.work(this.activityId, keyword, 0);

        this.setState({
            refresh: true,
        })
    }

    onFooterRefresh = () => {
        const {actions} = this.props;
        const {keyword} = this.state;

        if (this.page < this.pages) {
            this.page = this.page + 1;
            actions.activity.work(this.activityId, keyword, this.page);
        }
    }

    onAction = (action, args) => {
        const {actions, user} = this.props;

        if (!user.userId) {
            
            Taro.navigateTo({
				url: '/pages/user/passport'
			})

        } else {
            if (action == 'Vote') {
                
                let work = this.items[args.index];
                work.isVote = true;

                actions.activity.vote({
                    join_id: work.joinId,
                    resolved: (data) => {
                        Taro.showToast({
                            title: '投票成功',
                            icon: 'success'
                        })
                    },
                    rejected: (msg) => {
                        Taro.showToast({
                            title: msg,
                            icon: 'none'
                        })
                    }
                })

                this.items[args.index] = work;
                this.setState({
                    index: args.index,
                })
            }
        }
    }

	render () {
        const {loaded, canVote, refresh, user_vote, keyword, is_video, video_preview, video_url} = this.state;
        if (!loaded) return null;
        
		return (
			<View className={'activity container row col'}>
                <View className={'p_40 row ai_ct jc_sb'}>
                    <View className={'col_1 bg_light circle_25 p_5 row ai_ct mr_10'}>
                        <IconFont name={'search'} size={28}/>
                        <Input placeholder={'请输入内容'} className={'ml_5'} value={keyword} onInput={(e) => {
                            this.setState({
                                keyword: e.detail.value
                            })
                        }} onConfirm={(e) => {
                            this.onHeaderRefresh()
                        }}/>
                    </View>
                    <Text><Text className={'label_gray'}>我的票数：</Text>{user_vote}</Text>
                </View>
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
                        <View className={'p_40 work row wrap'}>
                            {this.items.map((work, index) => {

                                let thumb = '';
                                if (work.galleryList && work.galleryList.length > 0) {
                                    thumb = work.galleryList[0].fpath;
                                }

                                const over = this.activity.astatus == 2;
                                const disable = over || work.isVote || !canVote;

                                return (
                                    <View className={'item bg_light p_10 circle_5 mb_10'}>
                                        <View className={'row ai_ct jc_sb'}>
                                            <View className={'row ai_ct user'}>
                                                <Image src={work.avatar} className={'avatar bg_light mr_5'}/>
                                                <Text>{work.username}</Text>
                                            </View>
                                            <Text className={'label_blue'}>编号{index + 1}</Text>
                                        </View>
                                        <View className={'mt_10'}>
                                            <Text>{work.workName}{'\n'}<Text className={'label_12 label_light'}>{work.workIntro}</Text></Text>
                                        </View>
                                        <Image src={thumb + (is_video ? '?x-oss-process=video/snapshot,t_10000,m_fast' : '')} className={'work_thumb bg_light mt_10'} onClick={() => {
                                            if (is_video) {
                                                this.setState({
                                                    video_url: thumb,
                                                    video_preview: true,
                                                })
                                            } else {
                                                Taro.previewImage({
                                                    urls: tool.gurls(work.galleryList),
                                                })
                                            }
                                        }}/>
                                        <Button className={'bg_blue label_white mt_10 label_12'} onClick={()=> this.onAction('Vote', {index: index})} disabled={disable} >{over ? '已结束' : (work.isVote ? '已投票' : '投票')}({work.number}票)</Button>
                                    </View>
                                )
                            })}
                        </View>
                    </ScrollView>
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

const LayoutComponent = Work;

function mapStateToProps(state) {
	return {
		user: state.user.user,
        info: state.activity.info,
        work: state.activity.work,
        user_vote: state.activity.user_vote,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})