function OpenInvitationController($scope,eventService,userChecker,$timeout){
	$scope.user = userChecker.getLocalUser();
	//set updater
	$scope.updater = {
		update:function update(){
			$timeout(function(){
				 	eventService.getOpenInvitationList($scope.user.weiboId).then(function(response){
 						$scope.openInvitations = response.data;
 					})
 					update()
			},7000)
		}
	}
	//kick up
	$scope.updater.update()

}

function InviteControllor($scope,$timeout,SinaUsers,SinaFriends,Invitation,eventService,userChecker,SinaPoster){
	//check user info
	$scope.user = userChecker.getLocalUser();
	$scope.weiboSuccess = false
	$scope.invitees = []
	$scope.inviteeCopy = []
	$scope.content = 'cc '
	if($scope.user.weiboId == -1){
		extension_id = chrome.i18n.getMessage("@@extension_id")
		//window.location.href="https://api.weibo.com/oauth2/authorize?client_id=3371075251&redirect_uri=chrome-extension://"+extension_id+"/options.html&response_type=token&display=default&forcelogin=true";
	}

	//get friends and init add-friend-input
	SinaFriends.getBilateralFriends({uid:$scope.user.weiboId,access_token:$scope.user.weiboToken},function(data){
		$scope.friends = data.users
		names = []
		mappedcopy = []
     	mapped = {}

      	$.each($scope.friends, function (i, item) {
        	mapped[item.name] = userChecker.mapUser(item)
        	mappedcopy[item.name] = userChecker.mapUser(item)
        	names.push(item.name)
      	})
		$('#add-friend-input').typeahead({
			source: names,
			updater: function(name){
				 $timeout(function(){
 						$scope.invitees.push(mapped[name])
 						$scope.inviteeCopy.push(mappedcopy[name])
 						$scope.content = $scope.content+"@"+name+" "
 				},10)
			}
		})
	});

	//send invitation
	$scope.sendInvitation= function(){
		invitationSent = {
			invitees:$scope.inviteeCopy,
			inviter:{user:{weiboId:$scope.user.weiboId,weiboName:$scope.user.weiboName,weiboIcon:$scope.user.weiboIcon,weiboIconSmall:$scope.user.weiboIconSmall}},
			shop:$scope.shop,
			startDate:'1352426090998',
			description:$scope.description==undefined ? $scope.shop.shopName:$scope.description
		}
		//send sina weibo
		if(Settings.isSyncOn()){
			//content
			var status = invitationSent.description + $scope.content +$scope.shop.url
			var xsrf = $.param({status:status,access_token:$scope.user.weiboToken});
			SinaPoster.postInvitation(xsrf).then(function(data){
				$scope.weiboSuccess = true
			})
		}
		eventService.getEvent(JSON.stringify(invitationSent)).then(function(response){
			alert(response)
		})
	}

	//get shop info
 	var request={};
 	request.sender="popup";
 	chrome.extension.sendRequest(request, function(shop) {
 		$scope.shop = shop
 		if(shop == undefined){
 			$scope.shop = {shopName:'不在點評商戶頁',address:'沒有地址',phoneNo:'沒有電話'}
 		}
 	});



}