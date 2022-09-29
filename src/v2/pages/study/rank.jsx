import React, { Component } from 'react'
import { View, ScrollView, Image, Text } from '@tarojs/components'
import classNames from 'classnames'
import connectComponent from '../../../util/connect'
import * as tool from '../../../util/tool'
import './study.less'

class Rank extends Component {

    state = {
        type: 1,
        refresh: false,
    }

	items = ['', '', '', '', '', '', '']

    componentDidShow() {
		this.onHeaderRefresh();
	}

    componentWillReceiveProps(nextProps) {
        const {rank} = nextProps;

        if (rank !== this.props.rank) {
            this.items = rank;
        }

        this.setState({
            refresh: false,
        })
    }

    onHeaderRefresh = () => {
		const {actions} = this.props;
        const {type} = this.state;

        actions.user.user();
        actions.user.stat();

        let dayType = 3;
        if (type == 1) {
            dayType = 2;
        } else if (type == 2) {
            dayType = 0;
        }

        actions.study.rank(dayType);

        this.setState({
            refresh: true,
        })
	}

	render () {

        const {type, refresh} = this.state;
        const {user, stat} = this.props;

        let rank = {};

        this.items.map((item, index) => {
            if (item.userId == user.userId) {
                rank = item;
            }
        })
        
        let rank_header = this.items.slice(0, 3);
        const rnum = 3 - rank_header.length;
        
        for (var i = 0; i < rnum; i++) {
            rank_header.push({
                nickname: '虚位以待',
                avatar: 'https://arsxy.oss-cn-beijing.aliyuncs.com/app/header.png',
                duration: 0,
            })
        }

        const rank_body = this.items.slice(3, 100);

		return (
			<View className='study container row col'>
                <View className={'top bg_blue'}/>
				<ScrollView
					scrollY
					className={'h_full'}

                    refresherEnabled={true}
                    refresherTriggered={refresh}

                    onRefresherRefresh={(e) => {
                        this.onHeaderRefresh()
                    }}
				>
                    <View className={'p_40 rank'}>
                        
                        <View className={'row ai_ct jc_ad'}>
                            <View className={'row col ai_ct'} onClick={() => {
                                this.setState({
                                    type: 0
                                }, () => {
                                    this.onHeaderRefresh()
                                })
                            }}>
                                <Text className={classNames('label_12', {'label_white': type == 0, 'label_blight': type != 0})}>日排行榜</Text>
                                <View className={classNames('dot mt_5', {'bg_white': type == 0})}/>
                            </View>
                            <View className={'row col ai_ct'} onClick={() => {
                                this.setState({
                                    type: 1
                                }, () => {
                                    this.onHeaderRefresh()
                                })
                            }}>
                                <Text className={classNames('label_12', {'label_white': type == 1, 'label_blight': type != 1})}>月排行榜</Text>
                                <View className={classNames('dot mt_5', {'bg_white': type == 1})}/>
                            </View>
                            <View className={'row col ai_ct'} onClick={() => {
                                this.setState({
                                    type: 2
                                }, () => {
                                    this.onHeaderRefresh()
                                })
                            }}>
                                <Text className={classNames('label_12', {'label_white': type == 2, 'label_blight': type != 2})}>总排行榜</Text>
                                <View className={classNames('dot mt_5', {'bg_white': type == 2})}/>
                            </View>
                        </View>
                        <View className={'bg_white circle_10 row shadow_bottom p_30 mt_30'}>
                            <View className={'col_1 row col ai_ct'}>
                                <View className={'item'}>
                                    <Image src={rank_header[1].avatar} className={'avatar_s bg_light'}/>
                                    <Image src={'https://arsxy.oss-cn-beijing.aliyuncs.com/app/study/rank.2.png'} className={'icon_s'}/>
                                </View>
                                <Text className={'row label_gray mt_30'}>{rank_header[1].nickname}</Text>
                                <Text>{tool.ts2hour(rank_header[1].duration)}</Text>
                            </View>
                            <View className={'col_1 row col ai_ct'}>
                                <View className={'item'}>
                                    <Image src={rank_header[0].avatar} className={'avatar bg_light'}/>
                                    <Image src={'https://arsxy.oss-cn-beijing.aliyuncs.com/app/study/rank.1.png'} className={'icon'}/>
                                </View>
                                <Text className={'row label_gray mt_30'}>{rank_header[0].nickname}</Text>
                                <Text>{tool.ts2hour(rank_header[0].duration)}</Text>
                            </View>
                            <View className={'col_1 row col ai_ct'}>
                                <View className={'item'}>
                                    <Image src={rank_header[2].avatar} className={'avatar_s bg_light'}/>
                                    <Image src={'https://arsxy.oss-cn-beijing.aliyuncs.com/app/study/rank.3.png'} className={'icon_s'}/>
                                </View>
                                <Text className={'row label_gray mt_30'}>{rank_header[2].nickname}</Text>
                                <Text>{tool.ts2hour(rank_header[2].duration)}</Text>
                            </View>
                        </View>
                        <View className={'bg_white circle_10 shadow_bottom mt_30'}>
                            {rank.index ?
                            <View className={'p_10 bg_blight'}>
                                <View className={'row ai_ct jc_sb'}>
                                    <View className={'col_1'}>
                                        <Text className={'label_blue'}>{rank.index}</Text>
                                        <Text className={'row label_12 label_blue'}>排名</Text>
                                    </View>
                                    <View className={'col_5 row ai_ct'}>
                                        <Image src={rank.avatar} className={'avatar_u bg_light ml_10'}/>
                                        <Text className={'label_gray row ml_10'}>{rank.nickname}</Text>
                                    </View>
                                    <Text>{parseFloat(rank.duration / 3600).toFixed(1)}小时</Text>
                                </View>
                            </View>
                            :null}
                            {rank_body.map((user, index) => {
                                return (
                                    <View className={'p_10'}>
                                        <View className={'row ai_ct jc_sb bottom_light pb_10'}>
                                            <View className={'col_1'}>
                                                <Text className={'label_12 label_gray'}>{user.index}</Text>
                                            </View>
                                            <View className={'col_5 row ai_ct'}>
                                                <Image src={user.avatar} className={'avatar_u bg_light ml_10'}/>
                                                <Text className={'label_gray row ml_10'}>{user.nickname}</Text>
                                            </View>
                                            <Text>{tool.ts2hour(user.duration)}</Text>
                                        </View>
                                    </View>
                                )
                            })}
                        </View>
                    </View>
				</ScrollView>
			</View>
		)
	}
}

const LayoutComponent = Rank;

function mapStateToProps(state) {
	return {
		user: state.user.user,
        stat: state.user.stat,
        rank: state.study.rank,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})