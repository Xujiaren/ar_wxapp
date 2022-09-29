import React, { Component } from 'react'
import { View, Swiper, SwiperItem, Image, Text, Button } from '@tarojs/components'
import classNames from 'classnames'
import IconFont from '../iconfont'
import _ from 'lodash';
import Modal from './modal'
import './base.less'

export default class Gift extends Component {

    state = {
        show: false,
        gift_id: 0,
        gift_integral: 0,
        user_integral: this.props.integral || 0,
    }

    gifts = this.props.gift || []

    componentWillReceiveProps(nextProps) {
        const {integral} = nextProps;

        if (integral !== this.props.integral) {
            this.setState({
                user_integral: integral
            })
        }
    }

    show = () => {
        this.setState({
            show: true,
        })
    }

    hide = () => {
        this.setState({
            show: false,
        })
    }

    _onGift = (id, integral) => {
        if (id == this.state.gift_id) {
            this.setState({
                gift_id: 0,
                gift_integral: 0,
            })
        } else {
            this.setState({
                gift_id: id,
                gift_integral: integral,
            })
        }
    }

	render () {
        const {gift} = this.props;
        const {show, gift_id, user_integral, gift_integral} = this.state;        
        const gifts = _.chunk(gift, 8);

        const reward_enable = user_integral >= gift_integral && gift_id > 0;

		return (
			<Modal visible={show}>
                <View className={'modal'} onClick={this.hide}/>
                <View className={'giftContainer bg_white pt_10'}>
                    <Swiper
                        className={'gift'}
                        indicatorColor='#c5c5c5'
                        indicatorActiveColor='rgba(84,84,84,1)'
                        vertical={false}
                        circular
                        indicatorDots
                        autoplay={false}
                    >
                        {gifts.map((gitems, i) => {
                            return (
                                <SwiperItem>
                                    <View className={'gift row wrap'}>
                                        {gitems.map((g, j) => {
                                            const on = g.giftId == gift_id;

                                            return (
                                                <View className={classNames('gift_item row col ai_ct jc_ct', {'gift_item_on': on})} onClick={() => this._onGift(g.giftId, g.integral)}>
                                                    <Image src={g.giftImg} className={'gift_icon'}/>
                                                    <Text className={'row label_12 label_gray mt_5'}>{g.giftName}</Text>
                                                    <Text className={'row label_12 label_light'}>{g.integral}</Text>
                                                </View>
                                            )
                                        })}
                                    </View>
                                </SwiperItem>
                            )
                        })}
                    </Swiper>
                    <View className={'row ai_ct jc_sb pt_10 pb_10 pl_15 pr_15 top_light'}>
                        <View className={'row ai_ct'}>
                            <IconFont name={'jinbi'} color={'#00A6F6'} size={24}/>
                            <Text className={'label_12 row ml_10'}>{user_integral >= gift_integral ? user_integral - gift_integral : '积分不足'}</Text>
                        </View>
                        {user_integral >= gift_integral ? 
                        <Button size={'mini'} className={'bg_blue label_white mr_0'} disabled={!reward_enable} onClick={() => {
                            this.hide();
                            this.props.onSelect && this.props.onSelect(gift_id)
                        }}>打赏</Button>
                        :
                        <Button size={'mini'} className={'bg_blue label_white mr_0'} onClick={() => {
                            this.props.onBuy && this.props.onBuy(gift_id)
                        }}>购买</Button>
                        }
                    </View>
                </View>
			</Modal>
		)
	}
}
