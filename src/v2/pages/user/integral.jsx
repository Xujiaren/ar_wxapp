import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, ScrollView, Picker, Button, Text, Input } from '@tarojs/components'
import classNames from 'classnames'
import connectComponent from '../../../util/connect'
import Modal from '../../../components/base/modal'

import './user.less'

class Integral extends Component {

    state = {
        utype: global.utype,
        refresh: false,

        type: 0,

        scale: 1,

        card_index: 0,
        exchange: false,
        exchange_num: 0,
    }

    page = 0
    pages = 1
    total = 0
    items = []

    componentDidShow() {
		this.onHeaderRefresh();
	}

    componentWillReceiveProps(nextProps) {
        const {config, credit, integral, reward, user} = nextProps;

        if (config !== this.props.config) {

            if (global.utype == 0) {
                this.setState({
                    scale: config.anran_beans_provide,
                })
            }
        }

        if (credit !== this.props.credit) {
            this.pages = credit.pages;
            this.total = credit.total;
            this.items = this.items.concat(credit.items);
        }

        if (integral !== this.props.integral) {
            this.pages = integral.pages;
            this.total = integral.total;
            this.items = this.items.concat(integral.items);
        }

        if (reward !== this.props.reward) {
            this.pages = reward.pages;
            this.total = reward.total;
            this.items = this.items.concat(reward.items);
        }

        if (user !== this.props.user) {
            this.setState({
                card: user.sn,
            })
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

        actions.config.config();
        actions.user.user();

        if (type == 0) {
            actions.user.integral(type, this.page);
        } else if (type == 1) {
            actions.user.rewardIntegral(1, this.page);
        } else {
            actions.user.credit(this.page);
        }

		this.setState({
			refresh: true,
		})
    }

    onFooterRefresh = () => {
        const {actions} = this.props;
        const {type} = this.state;

        if (this.page < this.pages) {
            this.page = this.page + 1;

            if (type == 0) {
                actions.user.integral(type, this.page);
            } else if (type == 1) {
                actions.user.rewardIntegral(1, this.page);
            } else {
                actions.user.credit(this.page);
            }
        }
    }

    onExchange = () => {
        const {actions} = this.props;
        const {exchange_num, card_index} = this.state;

        actions.user.exchange({
            card: global.cardCodes.length > 0 ? global.cardCodes[card_index] : '',
            changeBalance: parseInt(exchange_num),
            resolved: (data) => {
                this.setState({
                    exchange: false,
                    exchange_num: '0',
                }, () => {

                    Taro.showToast({
                        title: '兑换成功',
                        icon: 'success',
                        success: () => {
                            this.onHeaderRefresh();
                        }
                    })
                })
            },
            rejected: (msg) => {
                Taro.showToast({
                    title: msg,
                    icon: 'none'
                })
            }
        })
    }

	render () {
        const {user} = this.props;
        const {utype, refresh, type, scale, card_index, exchange, exchange_num} = this.state

        const enable = parseInt(exchange_num) > 0 && user.integral >= scale * parseInt(exchange_num);

        let category = ['积分明细', '打赏明细']

        if (utype == 1) {
            category.push('学分明细')
        }

		return (
			<View className={'integral container row col'}>
                <View className={'p_40'}>
                    <View className={'balance p_40 row col jc_end'}>
                        <View className={'row ai_end jc_sb'}>
                            <View>
                                <Text className={'label_white label_16'}>积分余额</Text>
                                <Text className={'label_white label_25 row mt_10'}>{user.integral | 0}</Text>
                            </View>
                            {utype == 1 ?
                            <View>
                                <Text className={'label_white label_16'}>学分</Text>
                                <Text className={'label_white label_25 row mt_10'}>{user.credit | 0}</Text>
                            </View>
                            : null}
                            <View className={'row'}>
                                <Button className={'label_white bg_blue circle_25'} size={'mini'} onClick={() => {
                                    this.setState({
                                        exchange: true,
                                    })
                                }}>兑换</Button>
                                {1 ? null :
                                <Button className={'bg_white label_blue circle_25 ml_10'} size={'mini'} onClick={() => {
                                    Taro.navigateTo({
                                        url: '/v2/pages/user/recharge'
                                    })
                                }}>充值</Button>
                                }
                            </View>
                        </View>
                    </View>
                    <View className={'row pt_10 nowrap mt_30'}>
                    {category.map((category, cindex) => {
                        return (
                            <View className={classNames('col_1 row col ai_ct', 'pl_15 pr_15', 'label_light', {'label_gray' : type == cindex})} onClick={() => {
                                this.setState({
                                    type: cindex
                                }, () => {
                                    this.onHeaderRefresh()
                                })
                            }}>
                                <Text>{category}</Text>
                                <View className={classNames('dot circle_10 mt_5', {'bg_blue': type == cindex})}/>
                            </View>
                        )
                    })}
                    </View>
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
                            {this.items.map((log, index) => {

                                if (type == 1) {
                                    return (
                                        <View className={'p_10 row ai_ct jc_sb'}>
                                            <View>
                                                <Text>打赏了资源《{log.courseName}》一个{log.giftName}</Text>
                                                <Text className={'row label_12 label_light mt_5'}>{log.pubTimeFt}</Text>
                                            </View>
                                            <Text className={'label_blue'}>-{log.integral}</Text>
                                        </View>
                                    )
                                }
                                
                                return (
                                    <View className={'p_10 row ai_ct jc_sb'}>
                                        <View>
                                            <Text>{log.etype == 101 ? '兑换' + (global.utype == 0 ? '安豆' : '积分') : (log.etype == 18 ? '学习' : '') + (log.contentName ? log.contentName.replace('课程', '资源') : '')}</Text>
                                            <Text className={'row label_12 label_light mt_5'}>{log.pubTimeFt}</Text>
                                        </View>
                                        <Text className={'label_blue'}>{(log.itype == 0  ? '+' : '-') + (type == 0 ? log.integral : log.credit)}</Text>
                                    </View>
                                )
                            })}
						</View>
					</ScrollView>
				</View>
                <Modal visible={exchange}>
                    <View className={'modal'} onClick={() => this.setState({exchange: false})}/>
                    <View className={'exchange bg_white p_20 circle_5'}>
                        <View className={'pb_10 row col ai_ct bottom_light'}>
                            <Text className={'label_16'}>兑换</Text>
                        </View>
                        <View className={'mt_10'}>
                            <Text className={'label_16'}><Text className={'label_gray'}>可用积分:</Text> {user.integral}</Text>
                            {global.cardCodes.length > 1 ? 
                            <View className={'row ai_ct jc_sb mt_10'}>
                                <Text>卡号</Text>
                                <Picker mode='selector' value={card_index} range={global.cardCodes} onChange={(e) => {
                                    this.setState({
                                        card_index: parseInt(e.detail.value),
                                    })
                                }}>
                                    <View className={'row ai_ct'}>
                                        <Text>{global.cardCodes[card_index]}</Text>
                                    </View>
                                </Picker>
                            </View>
                            : null}
                            <View className={'row ai_ct mt_10'}>
                                <Text>兑换</Text>
                                <View className={'ml_10'}>
                                    <Input type={'number'} className={'p_5 bg_light'} value={exchange_num} onInput={(e) => {
                                        this.setState({
                                            exchange_num: parseInt(e.detail.value)
                                        })
                                    }}/>
                                </View>
                            </View>
                            <View className={'mt_5'}>
                                <Text>消耗 <Text className={'label_blue'}>{exchange_num != '' ? parseInt(exchange_num) * scale : 0}</Text> 积分</Text>
                                <Text className={'ml_10'}>{global.utype == 0 ? '安豆' : '积分'}</Text>
                            </View>
                        </View>
                        <Button className={'bg_blue label_white mt_30'} disabled={!enable} onClick={this.onExchange}>提交</Button>
                    </View>
                </Modal>
			</View>
		)
	}
}

const LayoutComponent = Integral;

function mapStateToProps(state) {
	return {
		config: state.config.config,
        user: state.user.user,
        credit: state.user.credit,
        integral: state.user.integral,
        reward: state.user.reward,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})