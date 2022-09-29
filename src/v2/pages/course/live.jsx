import React, { Component } from 'react'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { View, Video, LivePlayer, CoverView, ScrollView, Swiper, SwiperItem, Button, Image, Input, Text } from '@tarojs/components'
import qs from 'query-string';
import classNames from 'classnames'
import IconFont from '../../../components/iconfont'
import connectComponent from '../../../util/connect'

import Rank from '../../../components/base/rank'
import Gift from '../../../components/base/gift'
import Emoji from '../../../components/base/emoji'
import LiveCell from '../../../components/course/live'
import Modal from '../../../components/base/modal'
import config from '../../../config/param'
import './course.less'

class Live extends Component {

	state = {
		loaded: false,
		kh: 0,

		index: 0,

		totalCount: 0,
		liveStatus: 0,
		roomStatus: 0,
		fullScreen: false,

		book: false,
		bookNum: 0,

		canReward: true,
		canBuy: true,

		collectNum: 0,
		collect: false,

		user_integral: 0,

		gift: false,
		emoji: false,
		id: '',
		ts: 'ts',
		content: '',

		ncurrent: 0,
		notifys: [],

		score: false,
		courseScore: 4,
		teacherScore: 4,
		canScore: false,
		isScore: false,

		shop: false,
		card: false,
		sku: '',
		goodsLink: '',
		token: '',
	}

	course = {}
	fromuid = getCurrentInstance().router.params.fromuid || 0
	courseId = getCurrentInstance().router.params.courseId || 0
	ws = null
	pctr = null
	ts = parseInt(new Date().getTime() / 1000)

	gift = []
	giftMap = {}
	goods = {}
	goods_list = []
	goodsMap = {}
	aitems = []
	items = []

	componentDidShow() {
		this.fromuid = getCurrentInstance().router.params.fromuid || 0
		if (this.fromuid > 0) {
			global.fromuid = this.fromuid
		}

		this.onHeaderRefresh();
		const {user}=this.props;
		this.onWs(user);
		console.log('进入聊天室');
		this.setState({
			token:user.arToken,
			user_integral:user.integral
		})
	}
	componentDidHide(){
		this.ws && this.ws.close();
		this.items = [];
		this.aitems = [];
		this.ws = null;
	}
	componentDidMount() {
		this.pctr = Taro.createLivePlayerContext('liverPlayer');
	}

	componentWillUnmount() {
		const { user, actions } = this.props;

		if (user.userId) {
			actions.course.stat({
				course_id: this.course.courseId,
				duration: parseInt(new Date().getTime() / 1000) - this.ts,
				resolved: (data) => {

				},
				rejected: (res) => {

				},
			})
		}

		Taro.closeSocket();
		this.ws && this.ws.close({});
	}

	componentWillReceiveProps(nextProps) {
		const { actions } = this.props;
		const { user, course, goods, gift } = nextProps;

		if (course !== this.props.course) {

			this.course = course;
			this.ts = parseInt(new Date().getTime() / 1000);

			Taro.setNavigationBarTitle({
				title: this.course.courseName,
			})

			this.setState({
				loaded: true,

				totalCount: course.onlineNum,
				liveStatus: course.liveStatus,
				roomStatus: course.roomStatus,

				bookNum: course.bookNum,
				book: course.book,

				canReward: course.canReward == 1,
				canBuy: course.canBuy,
				isScore: course.isScore == 1,

				collectNum: course.collectNum,
				collect: course.collect,

			})

			if (course.canShare == 0) {
				Taro.hideShareMenu()
			}
		}

		if (goods !== this.props.goods) {
			this.goods_list = goods;
			let goodsMap = {};
			goods.map((g, index) => {
				goodsMap[g.goodsId] = g;
			});

			this.goodsMap = goodsMap;
		}

		if (gift !== this.props.gift) {
			this.gift = gift;

			let giftMap = {};
			gift.map((g, index) => {
				giftMap[g.giftId] = g;
			})

			this.giftMap = giftMap;
		}

		if (user !== this.props.user) {
			if (user.userId) {
				global.uid = user.userId;

				if (global.fromuid > 0) {
					actions.user.share({
						from_uid: global.fromuid,
						ctype: 3,
						content_id: this.courseId,
						resolved: (data) => {

						},
						rejected: (msg) => {

						}
					})
				}

				if (!this.state.isScore) {
					setTimeout(() => {
						const scores = Taro.getStorageSync('score') || []
						if (scores.indexOf(this.courseId) < 0) {

							scores.push(this.courseId)
							Taro.setStorageSync('score', scores)

							this.setState({
								score: true,
								canScore: true,
							})
						}

					}, 1000 * 60 * 10);
				}

				this.onWs(user);

				this.setState({
					token: user.arToken,
					user_integral: user.integral,
				})
			}
		}
	}
	onShareAppMessage = (res) => {
		const { actions } = this.props;
        actions.user.shareVod({course_id:this.courseId})
		return {
			title: this.course.courseName,
			path: '/v2/pages/course/live?courseId=' + this.courseId + '&fromuid=' + global.uid + '&utype=' + global.utype,
			imageUrl: this.course.courseImg + '?x-oss-process=image/resize,w_500,h_380,m_pad'
		}

	}

	onHeaderRefresh = () => {
		const { actions } = this.props;
		actions.config.config();
		actions.config.gift(1);
		actions.course.info(this.courseId);
		actions.course.goods(this.courseId);
		actions.user.user();
	}

	onWs = (user) => {
		if (this.ws) return;

		const params = {
			name: user.nickname,
			avatar: user.avatar,
			uid: user.userId,
		}

		const url = (global.utype == 0 ? config.ws : config.ws_corp) + this.courseId + '?' + qs.stringify(params);

		Taro.connectSocket({
			url: url,
		}).then(task => {
			this.ws = task;
			this.onMsg();
		})
	}

	onMsg = () => {
		this.ws.onMessage(({ data }) => {
			const msg = JSON.parse(data)
			if (msg.type == 'event-system') {           //在线情况

				if (this.state.totalCount != msg.totalCount) {
					this.setState({
						totalCount: this.course.onlineNum + msg.totalCount,
					})
				}

			} else if (msg.type == 'event-live') {      //直播情况

				this.setState({
					liveStatus: msg.liveStatus,
					roomStatus: msg.roomStatus,
				})

			} else if (msg.type == 'event-join') {      //有人进来

				let notifys = this.state.notifys;
				if (notifys.length >= 1) {
					notifys.shift()
				}

				notifys.push(msg.user.name + '来了');

				this.setState({
					notifys: notifys,
				})


			} else if (msg.type == 'event-leave') {     //有人离开

			} else if (msg.type == 'event-keyword') {   //触发关键词

				Taro.showToast({
					title: msg.msg.msg,
					icon: 'none',
				})

			} else if (msg.type == 'event-msg') {       //用户发言

				const id = msg.id;
				const ts = msg.timestamp;
				const mtype = msg.msg.mtype;
				const admin = msg.user.admin;

				if (mtype == 'goods') {
					const goodsId = parseInt(msg.msg.msg);

					if (goodsId in this.goodsMap) {
						let goods = this.goodsMap[goodsId];
						goods.id = msg.id;
					}


				} else if (mtype == 'gift') {

					const arr = msg.msg.msg.split('&');
					const giftId = parseInt(arr[1]);

					if (giftId in this.giftMap) {
						let notifys = this.state.notifys;
						if (notifys.length >= 1) {
							notifys.shift()
						}

						notifys.push(msg.user.name + '赠送' + this.giftMap[giftId].giftName);

						this.setState({
							notifys: notifys,
						})
					}

				} else {

					if (admin == 1) {
						this.aitems.push(msg);
					}

					if (this.items.length > 50) {
						this.items.shift();
					}

					if (admin == 0) {
						this.items.push(msg);
					}

				}

				this.setState({
					id: id,
					ts: 'ts' + ts,
				})

			} else if (msg.type == 'event-cancel') {    //撤销发言
				const id = msg.msg.msg;

				let items = [];
				let aitems = [];
				this.items.map((item, index) => {
					if (item.id != id) items.push(item);
				})

				this.aitems.map((item, index) => {
					if (item.id != id) aitems.push(item);
				})

				this.items = items;
				this.aitems = aitems;

				this.setState({
					id: id,
				})

			} else if (msg.type == 'event-mute') {     //禁言
				Taro.showToast({
					title: msg.msg.msg,
					icon: 'none',
				})
			} else if (msg.type == 'event-restore') {   //恢复发言
				Taro.showToast({
					title: msg.msg.msg,
					icon: 'none',
				})
			} else if (msg.type == 'event-kick-user') { //被踢出房间
				Taro.showToast({
					title: msg.msg.msg,
					icon: 'none',
					duration: 1500,
					success: () => {
						Taro.navigateBack()
					}
				})

			} else if (msg.type == 'event-leave') {
				Taro.showToast({
					title: msg.user.name + msg.msg.msg,
					icon: 'none',
				})
			}
		})
	}

	onAction = (action, args) => {
		const { actions, user } = this.props;
		const { emoji, content, collect, collectNum, book, bookNum, courseScore, teacherScore } = this.state;

		if (!user.userId) {
			Taro.navigateTo({
				url: '/pages/user/passport'
			})
		} else {
			if (action == 'Buy') {
				Taro.navigateTo({
					url: '/v2/pages/course/order?courseId=' + this.courseId,
				})
			} else if (action == 'Gift') {
				this.refs.gift.show()
			} else if (action == 'Reward') {
				const gift_id = args.gift_id;

				actions.user.reward({
					gift_id: gift_id,
					course_id: this.courseId,
					resolved: (data) => {
						actions.user.user();
						this.onPub('gift', user.nickname + '&' + gift_id);
					},
					rejected: (res) => {

					},
				})

			} else if (action == 'Pub') {
				this.refs.emoji && this.refs.emoji.hide();
				this.onPub('text', content);

			} else if (action == 'PubPic') {
				this.onPubPic();
			} else if (action == 'Emoji') {

				if (emoji) {
					this.refs.emoji && this.refs.emoji.hide();
				} else {
					this.refs.emoji && this.refs.emoji.show();
				}

				this.setState({
					emoji: !emoji,
				})
			} else if (action == 'PubScore') {

				actions.course.score({
					course_id: this.courseId,
					score: courseScore,
					teacher_score: teacherScore,
					resolved: (data) => {

						Taro.showToast({
							title: '评分成功',
							icon: 'none',
						})

						this.setState({
							score: false,
						})
					},
					rejected: (res) => {
						Taro.showToast({
							title: '系统错误，请稍后再试。',
							icon: 'none',
						})
					},
				})

			} else if (action == 'Collect') {

				if (collect) {
					actions.user.uncollect({
						ctype: 3,
						content_id: this.course.courseId,
						resolved: (data) => {
							this.setState({
								collect: false,
								collectNum: collectNum - 1,
							})
						},
						rejected: (msg) => {

						}
					})

				} else {
					actions.user.collect({
						ctype: 3,
						content_id: this.course.courseId,
						resolved: (data) => {
							this.setState({
								collect: true,
								collectNum: collectNum + 1,
							})
						},
						rejected: (msg) => {

						}
					})
				}
			} else if (action == 'Book') {
				if (book) {
					actions.user.unbook({
						course_id: this.courseId,
						resolved: (data) => {
							this.setState({
								book: false,
								bookNum: bookNum - 1,
							})
						},
						rejected: (msg) => {

						}
					})
				} else {
					Taro.requestSubscribeMessage({
						tmplIds: [config.live_notify],
						success: (res) => {
							if (res[config.live_notify] == 'accept') {
								actions.user.book({
									course_id: this.courseId,
									resolved: (data) => {
										this.setState({
											book: true,
											bookNum: bookNum + 1,
										})
									},
									rejected: (msg) => {

									}
								})
							}
						}
					})
				}
			}
		}
	}

	onPub = (mtype, msg) => {
		const { config } = this.props;
		const words = config.ban_words.split(',');
		if (msg.length == 0) {
			Taro.showToast({
				title: '请输入聊天内容',
				icon: 'none',
			})

			return
		}
		let canPub = true;
		for (let i = 0; i < words.length; i++) {
			if (msg.indexOf(words[i]) >= 0) {
				canPub = false;
				break;
			}
		}
		if (canPub) {
			const param = {
				mtype: mtype,
				msg: msg,
			}

			Taro.sendSocketMessage({
				data: JSON.stringify(param),
			})

			this.setState({
				index: 1,
				content: '',
			})
		} else {
			Taro.showToast({
				title: '请注意您的言论',
				icon: 'none',
			})
		}
	}

	onPubPic = () => {
		const { actions } = this.props;

		Taro.chooseImage({
			count: 1,
			sizeType: ["original", "compressed"],
			sourceType: ['album', 'camera'],
			success: (res) => {
				if (res.errMsg === 'chooseImage:ok') {
					const tf = res.tempFilePaths[0];
					Taro.getFileSystemManager().readFile({
						filePath: tf,
						encoding: 'base64',
						success: (e) => {
							actions.site.upload({
								file: 'data:image/jpeg;base64,' + e.data,
								resolved: (data) => {
									this.onPub('img', data)
								},
								rejected: (msg) => {
									Taro.showToast({
										title: '上传失败',
										icon: 'none',
									})
								},
							});
						}
					})
				}
			}
		})
	}

	onShop = (goods) => {
		if (global.cardCodes.length > 1) {
			this.setState({
				shop: false,
				card: true,
				sku: goods.sku,
				goodsLink: goods.goodsLink,
			})
		} else {
			this.setState({
				shop: false,
				sku: goods.sku,
				goodsLink: goods.goodsLink,
			}, () => {
				this.onJump(goods.sku);
			})
		}
	}

	onJump = (sku) => {
		const { actions } = this.props;
		const { token, goodsLink } = this.state;

		let link = goodsLink;

		if (global.fromuid > 0) {
			actions.course.shareGoods({
				fromuid: global.fromuid,
				sku_code: sku,
				resolved: (data) => {
					let link = data.itemLink ? data.itemLink : goodsLink;
					link = link + '&token=' + token;

					Taro.navigateTo({
						url: '/v2/pages/base/web?link=' + encodeURIComponent(link),
					})

				},
				rejected: (msg) => {

					link = link + '&token=' + token;
					Taro.navigateTo({
						url: '/v2/pages/base/web?link=' + encodeURIComponent(link),
					})
				}
			})
		} else {
			link = link + '&token=' + token;
			Taro.navigateTo({
				url: '/v2/pages/base/web?link=' + encodeURIComponent(link),
			})
		}
	}

	onCard = (card) => {
		const { actions, user } = this.props;
		const { sku } = this.state;

		actions.passport.swicthCard({
			phone: user.mobile,
			cardCode: card,
			resolved: (data) => {
				this.setState({
					token: data.token,
					card: false,
				}, () => {
					this.onJump(sku)
				})
			},
			rejected: (msg) => {
				this.setState({
					card: false,
				}, () => {
					this.onJump(sku)
				})
			}
		})
	}

	renderLive = () => {
		const { book, bookNum, liveStatus, roomStatus, totalCount, fullScreen } = this.state;

		const preMedia = this.course.preVideos.length > 0 ? this.course.preVideos[_.random(0, this.course.preVideos.length - 1)] : null;
		const endMedia = this.course.endVideos.length > 0 ? this.course.endVideos[_.random(0, this.course.endVideos.length - 1)] : null;

		if (liveStatus == 0) {
			return (
				<View className={'video bg_black'}>
					{
						preMedia ?
							(
								preMedia.mtype == 0 ?
									<Video src={preMedia.mediaUrl} className={'video'} loop={true} />
									: <Image src={preMedia.mediaUrl} className={'video'} />
							)
							: <Image src={this.course.courseImg} className={'video'} />
					}
					<View className={'tip p_10 row ai_ct jc_sb'}>
						<Text className={'label_white'}>即将开始</Text>
						<View className={'row ai_ct jc_sb'} onClick={() => this.onAction('Book')}>
							<Text className={'label_12 label_white'}>{bookNum}人已预约</Text>
							<Button size={'mini'} className={'bg_blue label_white mr_0 ml_10'}>{book ? '取消预约' : '预约'}</Button>
						</View>
					</View>
				</View>
			)
		}

		if (liveStatus == 2) {
			return (
				<View className={'video bg_black'}>
					{
						endMedia ?
							(
								endMedia.mtype == 0 ?
									<Video src={endMedia.mediaUrl} className={'video'} loop={true} />
									: <Image src={endMedia.mediaUrl} className={'video'} />
							)
							: <Image src={this.course.courseImg} className={'video'} />
					}
					<View className={'tip p_10 row ai_ct jc_sb'}>
						<Text className={'label_white'}>已结束</Text>
					</View>
				</View>
			)
		}

		return (
			<LivePlayer
				src={this.course.liveUrl}
				className={'video'}
				autoplay={true}
				id={'liverPlayer'}
				minCache={0.1}
				maxCache={0.3}
				autoPauseIfNavigate={false}
				autoPauseIfOpenNavigate={false}
				onFullScreenChange={(e) => {
					this.setState({
						fullScreen: e.detail.fullScreen,
					})
				}}
			>
				<CoverView className={'tip p_10 row ai_ct jc_sb'}>
					<CoverView className={'label_white'}>{totalCount}人在线</CoverView>
					<CoverView className={'label_white'} onClick={() => {
						if (!fullScreen) {
							this.pctr && this.pctr.requestFullScreen({
								direction: 90,
								success: (e) => { },
								fail: (e) => { }
							})
						} else {
							this.pctr && this.pctr.exitFullScreen({
								success: (e) => { },
								fail: (e) => { }
							})
						}
					}}>
						{fullScreen ? '退出全屏' : '全屏'}
					</CoverView>
				</CoverView>
			</LivePlayer>
		)
	}

	render() {
		const { user } = this.props;
		const { loaded, kh, ts, canReward, canBuy, isScore, collectNum, collect, user_integral, index, content, card, shop, notifys, courseScore, teacherScore, score, canScore } = this.state
		if (!loaded) return null

		const items = index == 0 ? this.aitems : this.items;
		return (
			<View className='live container row col bg_light'>
				<View>
					{this.renderLive()}
					<View className={'row ai_ct jc_ad pt_10 bg_white bottom_light'}>
						<View className={'row col ai_ct'} onClick={() => {
							this.setState({
								index: 0,
							})
						}}>
							<Text className={classNames({ 'label_light': index != 0 })}>主讲</Text>
							<View className={classNames('dot mt_5', { 'bg_blue': index == 0 })} />
						</View>
						<View className={'row col ai_ct'} onClick={() => {
							this.setState({
								index: 1,
							})
						}}>
							<Text className={classNames({ 'label_light': index != 1 })}>讨论区</Text>
							<View className={classNames('dot mt_5', { 'bg_blue': index == 1 })} />
						</View>
					</View>
				</View>
				<View className={'col_1 h_100 bg_white msg'}>
					<ScrollView
						scrollY
						className={'h_full'}
						id={'chat'}
						scrollWithAnimation
						scrollIntoView={'ts' + (items.length - 1).toString()}
					>
						<View className={'p_40'} onClick={() => {
							this.refs.emoji && this.refs.emoji.hide();
						}}>
							{items.map((message, index) => {
								const muser = message.user;
								const owner = muser.uid == user.userId;

								return (
									<LiveCell id={'ts' + index.toString()} msg={message.msg} user={muser} owner={owner} />
								)
							})}
						</View>
					</ScrollView>
				</View>
				{canBuy ?
					<View className={'row ai_ct p_5 bg_white top_light'}>
						<Button size={'mini'} className={'bg_blue col_1 label_white'} onClick={() => this.onAction('Buy')}>购买资源</Button>
					</View>
					: (index == 1 ?
						<View className={'toolbar row ai_ct p_5 bg_white top_light'} style={{ bottom: kh }}>
							{canReward ?
								<View className={'col_1'} onClick={() => this.onAction('Gift')}>
									<IconFont name={'lihe'} size={40} />
								</View>
								: null}
							<View className={'col_1 row'} onClick={() => this.onAction('Collect')}>
								<View className={'pr'}>
									<IconFont name={collect ? 'aixin1' : 'aixin'} color={collect ? 'red' : '#999999'} size={40} />
									<View className={'count bg_blue row col ai_ct jc_ct'}>
										<Text className={'label_9 label_white'}>{collectNum > 99 ? '99+' : collectNum}</Text>
									</View>
								</View>
							</View>
							<View className={'col_1'} onClick={() => this.onAction('Emoji')}>
								<IconFont name={'biaoqing'} size={40} />
							</View>
							<View className={'col_1'} onClick={() => this.onAction('PubPic')}>
								<IconFont name={'tupian'} size={40} />
							</View>
							<View className={'p_5'}>
								<Input className={'p_5 bg_light circle_10'} adjustPosition={false} placeholder={'写留言，发表看法'} value={content} onInput={(e) => {
									this.setState({
										content: e.detail.value
									})
								}} onFocus={(e) => {
									this.setState({
										kh: e.detail.height,
									})
								}} onBlur={(e) => {
									this.setState({
										kh: 0,
									})
								}} />
							</View>
							<Button size={'mini'} className={'bg_blue col_1 label_white'} onClick={() => this.onAction('Pub')}>发送</Button>
						</View>
						: null)}

				<Swiper
					className={'notify'}
					indicatorDots={false}
					vertical
					autoplay={true}
					easingFunction={'easeOutCubic'}
					onChange={(e) => {
						setState({
							ncurrent: e.detail.current
						})
					}}

					onAnimationFinish={(e) => {
						let notifys = this.state.notifys
						notifys.shift()

						this.setState({
							notifys: notifys
						})
					}}
				>
					{notifys.map((msg, index) => {
						return (
							<SwiperItem className={'row'}>
								<View className={'item circle_25 p_5 pl_10 pr_10'}>
									<Text className={'label_white label_12'}>{msg}</Text>
								</View>

							</SwiperItem>
						)
					})}
				</Swiper>

				<Emoji ref={'emoji'} onSelect={(key) => {
					this.setState({
						content: content + key,
					})
				}} />

				<Gift gift={this.gift} ref={'gift'} integral={user_integral} onSelect={(gift_id) => {
					this.onAction('Reward', { gift_id: gift_id })
				}} onBuy={() => {
					Taro.navigateTo({
						url: '/v2/pages/user/recharge'
					})
				}} />

				{canScore && !isScore ?
					<View className={'score_guide'} onClick={() => {
						this.setState({
							score: true
						})
					}}>
						<Image src={'https://arsxy.oss-cn-beijing.aliyuncs.com/app/course/score.png'} className={'score_icon'} />
					</View>
					: null}

				<View className={'shop_guide'} onClick={() => {
					this.setState({
						shop: true
					})
				}}>
					<Image src={'https://arsxy.oss-cn-beijing.aliyuncs.com/app/course/shop.png'} className={'shop_icon'} />
				</View>

				<Modal visible={shop}>
					<View className={'modal'} onClick={() => this.setState({
						shop: false,
					})} />
					<View className={'shop bg_white p_10'}>
						<ScrollView scrollY className={'shop_box'}>
							{this.goods_list.map((goods, index) => {
								return (
									<View className={'row border_bottom p_10'} onClick={() => this.onShop(goods)}>
										<Image src={goods.goodsImg} className={'goods_img'} />
										<View className={'col_1 ml_10 row col jc_sb'}>
											<Text>{goods.goodsName}</Text>
											<Text className={'row label_red'}>¥{parseFloat(goods.goodsPrice).toFixed(2)}</Text>
										</View>
									</View>
								)
							})}
						</ScrollView>
					</View>
				</Modal>

				<Modal visible={card}>
					<View className={'modal'} onClick={() => this.setState({
						card: false,
					})} />
					<View className={'card bg_white p_10 circle_5'}>
						<ScrollView
							scrollY
							className={'cards_box'}
						>
							{global.cardCodes.map((card, index) => {
								return (
									<View className={'p_10 border_bottom'} onClick={() => this.onCard(card)}>
										<Text className={'label_blue'}>{card}</Text>
									</View>
								)
							})}
						</ScrollView>
						<View className={'row p_10'}>
							<Button size={'mini'} className={'col_1'} onClick={() => this.setState({
								card: false,
							})}>关闭</Button>
						</View>
					</View>
				</Modal>

				<Modal visible={score}>
					<View className={'modal'} onClick={() => {
						this.setState({
							score: false,
						})
					}} />
					<View className={'score bg_white pt_15'}>
						<View className={'p_15 row col ai_ct border_bottom'}>
							<View className={'row ai_ct p_10'}>
								<Text className={'row mr_10'}>资源评分</Text>
								<Rank value={courseScore} onChoose={(value) => {
									this.setState({
										courseScore: value,
									})
								}} />
							</View>
							<View className={'row ai_ct p_10'}>
								<Text className={'row mr_10'}>老师评分</Text>
								<Rank value={teacherScore} onChoose={(value) => {
									this.setState({
										teacherScore: value,
									})
								}} />
							</View>
						</View>
						<View className={'row ai_ct p_10'}>
							<Button size={'mini'} className={'col_1'} onClick={() => {
								this.setState({
									score: false,
								})
							}}>取消</Button>
							<Button size={'mini'} className={'col_1 ml_10 bg_blue label_white'} onClick={() => this.onAction('PubScore')}>提交</Button>
						</View>
					</View>
				</Modal>
			</View>
		)
	}
}

const LayoutComponent = Live;

function mapStateToProps(state) {
	return {
		config: state.config.config,
		user: state.user.user,
		gift: state.config.gift,
		course: state.course.course,
		goods: state.course.goods,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})