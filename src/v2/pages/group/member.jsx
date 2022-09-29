import React, { Component } from 'react'
import Taro, {getCurrentInstance} from '@tarojs/taro'
import classNames from 'classnames'
import { View, ScrollView,  Button, Image, Text } from '@tarojs/components'
import connectComponent from '../../../util/connect'
import './group.less'

class Member extends Component {

    state = {
        type: 0,
        index: 0,
        loaded: false,
        refresh: false,
    }

    activityId = getCurrentInstance().router.params.activityId || 0
	page = 0;
    pages = 1
    total = 0
    items = []

    componentDidShow() {
		const {actions} = this.props;
		actions.user.user();
        actions.group.info(this.activityId);

		this.onHeaderRefresh();
	}

    componentWillReceiveProps(nextProps) {
        const {info, member} = nextProps;

        if (info !== this.props.info && info.activityId) {
            this.group = info;

            this.setState({
                loaded: true,
            })
        }

        if (member !== this.props.member) {
            this.items = this.items.concat(member.items);
            this.total = member.total;
            this.pages = member.pages;
        }

        this.setState({
            refresh: false,
        })
    }

    onHeaderRefresh = () => {
        const {actions} = this.props;
        const {type} = this.state;

        this.page = 0;
        this.pages = 1;
        this.total = 0;
        this.items = [];

        actions.group.member(this.activityId, type == 0 ? 'member' : 'apply', 0);

        this.setState({
            refresh: true,
        })
    }

    onFooterRefresh = () => {
        const {actions} = this.props;
        const {type} = this.state;

        if (this.page < this.pages) {
            this.page = this.page + 1;
            actions.group.member(this.activityId, type == 0 ? 'member' : 'apply', this.page);
        }
    }

    onAction = (index, joinId, action) => {
        const {actions} = this.props;

        actions.group.action({
            activity_id: this.activityId,
            joinId: joinId,
            action: action,
            resolved: (data) => {

                Taro.showToast({
                    title: '操作成功',
                    icon: 'success',
                    success: () => {
                        if (action == 'delete') {
                            this.onHeaderRefresh();
                        } else {
                            let member = this.items[index];
                            member.isPass = 1;
                            this.items[index] = member;
    
                            this.setState({
                                index: index,
                            })
                        }
                    }
                })
            },
            rejected: (msg) => {
                Taro.showToast({
                    title: '操作失败',
                    icon: 'none'
                })
            },
        })
    }

	render () {
        const {user} = this.props;
        const {loaded, refresh, type} = this.state;

        if (!loaded) return null;

		return (
			<View className={'group container row col'}>
                <View className={'row ai_ct jc_ad bottom_light'}>
                    <View className={'row col ai_ct'} onClick={() => {
                        this.setState({
                            type: 0,
                        }, () => {
                            this.onHeaderRefresh()
                        })
                    }}>
                        <Text className={classNames({'label_light': type == 1})}>参与用户</Text>
                        <View className={classNames('dot mt_5', {'bg_blue': type == 0})}/>
                    </View>
                    {user.userId == this.group.userId ?
                    <View className={'row col ai_ct'} onClick={() => {
                        this.setState({
                            type: 1,
                        }, () => {
                            this.onHeaderRefresh()
                        })
                    }}>
                        <Text className={classNames({'label_light': type == 0})}>申请用户</Text>
                        <View className={classNames('dot mt_5', {'bg_blue': type == 1})}/>
                    </View>
                    : null}
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
						<View className={'p_40'}>
                           {this.items.map((member, index) => {
                               const owner = member.userId == user.userId;

                               return (
                                   <View className={'uitem row ai_ct jc_sb pt_10 pb_10 bottom_light'}>
                                       <View className={'row ai_ct'}>
                                           <Image src={member.avatar} className={'avatar bg_light mr_10'}/>
                                           <Text>{member.username}</Text>
                                           {type == 1 ?
                                           <Text className={'label_gray ml_10 row'}>{member.workIntro}</Text>
                                           : null}
                                       </View>
                                       {type == 0 ? (owner ? null :
                                       <Button className={'bg_blight label_blue mr_0'} size={'mini'} onClick={() => this.onAction(index, member.joinId, 'delete')}>踢出</Button>)
                                       :
                                       <Button className={'bg_blight label_blue mr_0'} size={'mini'} onClick={() => this.onAction(index, member.joinId, 'pass')}>{member.isPass == 1 ? '已同意' : '同意'}</Button>
                                    }
                                    </View>
                               )
                           })}
						</View>
					</ScrollView>
				</View>
			</View>
		)
	}
}

const LayoutComponent = Member;

function mapStateToProps(state) {
	return {
		user: state.user.user,
        info: state.group.info,
        member: state.group.member,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})