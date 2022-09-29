import React, { Component } from 'react'
import Taro, {getCurrentInstance} from '@tarojs/taro'
import { View, ScrollView,  Image, Button, Text } from '@tarojs/components'
import connectComponent from '../../../util/connect'
import './ask.less'

class Invite extends Component {

	state = {
		refresh: false,
		loaded: false,
		index: 0,
	}

	askId = getCurrentInstance().router.params.askId || 0
	users = []

	componentDidShow() {
		this.onHeaderRefresh();
	}

	componentWillReceiveProps(nextProps) {
        const {recomm} = nextProps;
        if (recomm !== this.props.recomm) {
            this.users = recomm;

            this.setState({
                refresh: false,
            })
        }
    }

	onHeaderRefresh = () => {
        const {actions} = this.props;
		actions.ask.recomm(this.askId);

		this.setState({
			refresh: true
		})
    }

	onInvite = (index) => {
		const {actions} = this.props;

        let user = this.users[index];

        actions.ask.invite({
            target_uid: user.userId,
            ask_id: this.askId,
            resolved: (data) => {
                
            },
            rejected: (msg) => {
                
            },
        });

        user.isInvite = true;
        this.users[index] = user;

        this.setState({
            index: index,
        });
	}

	render () {
		const {refresh} = this.state;
		return (
			<View className={'ask container row col'}>
                <View className={'row col p_10 ai_ct'}>
                    <Text className={'label_light'}>你可以邀请下面用户快速获得回答</Text>
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
					>
						<View className={'p_40'}>
                           {this.users.map((user, index) => {
                               return (
                                   <View className={'uitem row ai_ct jc_sb pt_10 pb_10 bottom_light'}>
                                       <View className={'row ai_ct'}>
                                           <Image src={user.avatar} className={'avatar bg_light mr_10'}/>
                                           <Text>{user.nickname}</Text>
                                       </View>
                                       <Button className={'bg_blight label_blue mr_0'} size={'mini'} disabled={user.isInvite} onClick={()=> this.onInvite(index)}>邀请</Button>
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

const LayoutComponent = Invite;

function mapStateToProps(state) {
	return {
		recomm: state.ask.recomm,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})