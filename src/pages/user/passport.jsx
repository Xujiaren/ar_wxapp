import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, ScrollView, Image, Input, Button, Text } from '@tarojs/components'
import connectComponent from '../../util/connect'
import Modal from '../../components/base/modal'

import './user.less'

class Passport extends Component {

    state = {
        code: '',
        mobile: '',

        count: false,
        ts: 60,

        vcode: false,
        card: false,
    };

    uniqueId = ''
    descriptionType = 0
    cardCodeList = []
    chiefCode = ''
    cardCodes = ''

    componentWillUnmount() {
        if (this.timer) clearTimeout(this.timer)
    }

    onCorp = (mobile) => {
        const { actions } = this.props;

        actions.passport.iscorp({
            mobile: mobile,
            resolved: (data) => {
                if (data) {
                    global.utype = 1;
                } else {
                    global.utype = 0;
                }

                Taro.setStorageSync('utype', global.utype)
            },
            rejected: (msg) => {

            }
        })
    }

    onCode = () => {
        const { actions } = this.props;
        const { mobile } = this.state;

        this.setState({
            vcode: true,
        }, () => {
            actions.passport.vcode({
                mobile: mobile,
                resolved: (data) => {

                    this.timer = setTimeout(() => this.countdown(), 1000)

                    this.uniqueId = data.uniqueid;
                    this.descriptionType = data.descriptionType;
                    this.cardCodeList = data.cardCodeList;
                    this.chiefCode = data.chiefCode;
                    this.cardCodes = data.cardCodes;

                    global.cardCodes = data.cardCodeList;
                    Taro.setStorageSync('cardcodes', global.cardCodes);

                    this.setState({
                        vcode: false,
                    })
                },
                rejected: (msg) => {
                    Taro.showToast({
                        title: msg,
                        icon: 'none',
                    })
                }
            })
        })
    }

    countdown = () => {
        let ts = this.state.ts;
        if (ts > 1) {
            ts--;
            this.setState({
                ts: ts,
                count: true,
            }, () => {
                this.timer = setTimeout(() => this.countdown(), 1000)
            })
        } else {
            this.setState({
                ts: 60,
                count: false,
            }, () => {
                if (this.timer) clearTimeout(this.timer)
            })

        }
    }

    onLogin = () => {
        const { actions } = this.props;
        const { mobile, code } = this.state;
        
        if (mobile.length != 11) {
            Taro.showToast({
                title: '请先输入手机号',
                icon: 'none',
            })

            return;
        }

        if (code.length < 6 || this.uniqueId == '') {
            Taro.showToast({
                title: '请先获取验证码',
                icon: 'none',
            })

            return;
        }

        if (this.uniqueId == '') {
            Taro.showToast({
                title: '请先获取验证码',
                icon: 'none',
            })

            return;
        }
        Taro.login({
            success: (res) => {
                actions.passport.login({
                    mobile: mobile,
                    code: code,
                    descriptionType: this.descriptionType,
                    uniqueId: this.uniqueId,
                    chiefCode: this.chiefCode,
                    cardCodes: this.cardCodes,
                    wxCode: res.code,
                    reg_from: 0,
                    resolved: (data) => {
                        const udata = data;

                        global.cards = udata.userInfoList;
                        global.uid = udata.userId;
                        Taro.setStorageSync('uid', global.uid);

                        if (udata.token != '') {
                            actions.passport.token({
                                token: udata.token,
                                resolved: (data) => {
                                    this.onSwitch();
                                },
                                rejected: (msg) => {
                                    Taro.showToast({
                                        title: '登录失败',
                                        icon: 'none',
                                    })
                                }
                            })
                        } else {
                            Taro.showToast({
                                title: '请输入正确的验证码',
                                icon: 'none',
                            })
                        }

                    },
                    rejected: (msg) => {
                        Taro.showToast({
                            title: msg,
                            icon: 'none',
                        })
                    }
                })
            }
        })


    }

    onSwitch = () => {
        const { actions } = this.props;
        actions.user.user();
        actions.passport.LoginLog({
            from: 0,
            resolved: (res => { })
        })
        if (global.cards.length <= 1) {
            Taro.navigateBack();
        } else {
            this.setState({
                card: true,
            })
        }
    }

    onCard = (card) => {
        const { actions } = this.props;
        const { mobile } = this.state;

        actions.passport.swicthCard({
            phone: mobile,
            cardCode: card.cardCode,
            resolved: (data) => {
                const udata = data;

                global.uid = udata.userId;
                Taro.setStorageSync('uid', global.uid);

                actions.passport.token({
                    token: udata.appToken,
                    resolved: (data) => {

                        this.setState({
                            card: false,
                        }, () => {
                            actions.user.user()
                            Taro.navigateBack()
                        })
                    },
                    rejected: (msg) => {
                        Taro.showToast({
                            title: '切换失败',
                            icon: 'none',
                        })
                    }
                })
            },
            rejected: (msg) => {
                Taro.showToast({
                    title: '切换失败',
                    icon: 'none',
                })
            }
        })
    }

    onExit = () => {
        const { actions } = this.props;
        actions.passport.logout({
            resolved: (data) => {
                actions.user.user();
            },
            rejected: (msg) => {

            }
        });

        this.setState({
            card: false,
        })
    }

    render() {
        const { code, vcode, mobile, card, count, ts } = this.state

        const enable = !count && !vcode && mobile.length == 11

        return (
            <View className={'passport container row col'}>
                <View className={'col_1 h_100'}>
                    <ScrollView
                        scrollY
                        className={'h_full'}
                    >
                        <View className={'p_100'}>
                            <View className={'row col ai_ct'}>
                                <Image src={'https://arsxy.oss-cn-beijing.aliyuncs.com/app/user/passport.logo.png'} className={'logo'} />
                            </View>

                            <View className={'mt_80'}>
                                <Text>手机</Text>
                                <View className={'bottom_light pt_10 pb_10 mt_10'}>
                                    <Input type={'number'} maxlength={11} placeholder={'请输入手机号'} value={mobile} onInput={(e) => {
                                        this.setState({
                                            mobile: e.detail.value,
                                        })

                                        if (e.detail.value.length == 11) {
                                            this.onCorp(e.detail.value)
                                        }

                                    }} />
                                </View>
                            </View>
                            <View className={'mt_80'}>
                                <Text>验证码</Text>
                                <View className={'bottom_light pt_10 pb_10 mt_10 row ai_ct jc_sb'}>
                                    <Input type={'number'} maxlength={6} placeholder={'请输入验证码'} value={code} onInput={(e) => {
                                        this.setState({
                                            code: e.detail.value,
                                        })
                                    }} />
                                    <Button size={'mini'} className={'countdown row col ai_ct p_5 pl_10 pr_10 border_blue circle_25'} onClick={this.onCode} disabled={!enable}>
                                        <Text className={'label_blue'}>{count ? ts : '获取验证码'}</Text>
                                    </Button>
                                </View>
                            </View>

                            <Button className={'bg_orange label_white circle_25 mt_80'} onClick={this.onLogin}>登录</Button>
                        </View>
                    </ScrollView>
                </View>
                <View>
                    <Image src={'https://arsxy.oss-cn-beijing.aliyuncs.com/app/user/passport.bg.png'} className={'bg'} />
                </View>
                <Modal visible={card}>
                    <View className={'modal'} onClick={this.onExit} />
                    <View className={'card bg_white circle_5'}>
                        <View className={'p_10 bottom_light'}>
                            <Text>选择卡号</Text>
                        </View>
                        <ScrollView
                            scrollY
                            className={'cards_box'}
                        >
                            {global.cards.map((card, index) => {
                                return (
                                    <View className={'p_10 bottom_light'} onClick={() => this.onCard(card)}>
                                        <Text>{card.realName}</Text>
                                    </View>
                                )
                            })}
                        </ScrollView>
                        <View className={'row p_10 bottom_light'} onClick={this.onExit}>
                            <Button size={'mini'} className={'col_1'}>关闭</Button>
                        </View>
                    </View>
                </Modal>
            </View>
        )
    }
}

const LayoutComponent = Passport;

function mapStateToProps(state) {
    return {

    }
}

export default connectComponent({
    mapStateToProps,
    LayoutComponent,
})