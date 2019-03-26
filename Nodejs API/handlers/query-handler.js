/*
* Real time private chatting app using Angular 2, Nodejs, mongodb and Socket.io
* @author Shashank Tiwari
*/

'use strict';
class QueryHandler{

	constructor(){
		this.Mongodb = require("./../config/db");
	}

	userNameCheck(data){
		return new Promise( async (resolve, reject) => {
			try {
				const [DB, ObjectID] = await this.Mongodb.onConnect();
				DB.collection('users').find(data).count( (error, result) => {
					DB.close();
					if( error ){
						reject(error);
					}
					resolve(result);
				});
			} catch (error) {
				reject(error)
			}
		});
	}

	getUserByUsername(username){
		return new Promise( async (resolve, reject) => {
			try {
				const [DB, ObjectID] = await this.Mongodb.onConnect();
				DB.collection('users').find({
					username :  username
				}).toArray( (error, result) => {
					DB.close();
					if( error ){
						reject(error);
					}
					resolve(result[0]);
				});
			} catch (error) {
				reject(error)
			}	
		});
	}

	makeUserOnline(userId){
		return new Promise( async (resolve, reject) => {
			try {
				const [DB, ObjectID] = await this.Mongodb.onConnect();
				DB.collection('users').findAndModify({
					_id : ObjectID(userId)
				},[],{ "$set": {'online': 'Y'} },{new: true, upsert: true}, (err, result) => {
					DB.close();
					if( err ){
						reject(err);
					}
					resolve(result.value);
				});
			} catch (error) {
				reject(error)
			}	
		});
	}

	registerUser(data){
		return new Promise( async (resolve, reject) => {
			try {
				const [DB, ObjectID] = await this.Mongodb.onConnect();
				DB.collection('users').insertOne(data, (err, result) =>{
					DB.close();
					if( err ){
						reject(err);
					}
					resolve(result);
				});
			} catch (error) {
				reject(error)
			}	
		});
	}

	userSessionCheck(data){
		return new Promise( async (resolve, reject) => {
			try {
				const [DB, ObjectID] = await this.Mongodb.onConnect();
				DB.collection('users').findOne( { _id : ObjectID(data.userId) , online : 'Y'}, (err, result) => {
					DB.close();
					if( err ){
						reject(err);
					}
					resolve(result);
				});	
			} catch (error) {
				reject(error)
			}
		});
	}

	getUserInfo({userId,socketId = false}){
		let queryProjection = null;
		if(socketId){
			queryProjection = {
				"socketId" : true
			}
		} else {
			queryProjection = {
				"username" : true,
				"online" : true,
				'_id': false,
				'id': '$_id'
			}
		}
		return new Promise( async (resolve, reject) => {
			try {
				const [DB, ObjectID] = await this.Mongodb.onConnect();
				DB.collection('users').aggregate([{
					$match:  {
						_id : ObjectID(userId)
					}
				},{
					$project : queryProjection
				}
				]).toArray( (err, result) => {
					DB.close();
					if( err ){
						reject(err);
					}
					socketId ? resolve(result[0]['socketId']) : resolve(result);
				});
			} catch (error) {
				reject(error)
			}
		});
	}

	addSocketId({userId, socketId}){
		const data = {
			id : userId,
			value : {
				$set :{
					socketId : socketId,
					online : 'Y'
				}
			}
		};
		return new Promise( async (resolve, reject) => {
			try {
				const [DB, ObjectID] = await this.Mongodb.onConnect();
				DB.collection('users').update( { _id : ObjectID(data.id)}, data.value ,(err, result) => {
					DB.close();
					if( err ){
						reject(err);
					}
					resolve(result);
				});
			} catch (error) {
				reject(error)
			}
		});
	}

	getChatList(userId){
		return new Promise( async (resolve, reject) => {
			try {
				const [DB, ObjectID] = await this.Mongodb.onConnect();
				DB.collection('users').aggregate([{
					$match: {
						'socketId': { $ne : userId}
					}
				},{
					$project:{
						"username" : true,
						"online" : true,
						'_id': false,
						'id': '$_id'
					}
				}
				]).toArray( (err, result) => {
					DB.close();
					if( err ){
						reject(err);
					}
					resolve(result);
				});
			} catch (error) {
				reject(error)
			}
		});
	}

	insertMessages(messagePacket){
		return new Promise( async (resolve, reject) => {
			try {
				const [DB, ObjectID] = await this.Mongodb.onConnect();
				DB.collection('messages').insertOne(messagePacket, (err, result) =>{
					DB.close();
					if( err ){
						reject(err);
					}
					resolve(result);
				});
			} catch (error) {
				reject(error)
			}
		});
	}

	getMessages({userId, toUserId}){
		const data = {
				'$or' : [
					{ '$and': [
						{
							'toUserId': userId
						},{
							'fromUserId': toUserId
						}
					]
				},{
					'$and': [ 
						{
							'toUserId': toUserId
						}, {
							'fromUserId': userId
						}
					]
				},
			]
		};	    
		return new Promise( async (resolve, reject) => {
			try {
				const [DB, ObjectID] = await this.Mongodb.onConnect();
				DB.collection('messages').find(data).sort({'timestamp':1}).toArray( (err, result) => {
					DB.close();
					if( err ){
						reject(err);
					}
					resolve(result);
				});
			} catch (error) {
				reject(error)
			}
		});
	}

	logout(userID,isSocketId){
		const data = {
			$set :{
				online : 'N'
			}
		};
		return new Promise( async (resolve, reject) => {
			try {
				const [DB, ObjectID] = await this.Mongodb.onConnect();		
				let condition = {};
				if (isSocketId) {
					condition.socketId = userID;
				}else{
					condition._id = ObjectID(userID);
				}
				DB.collection('users').update( condition, data ,(err, result) => {
					DB.close();
					if( err ){
						reject(err);
					}
					resolve(result);
				});
			} catch (error) {
				reject(error)
			}
		});
	}
}

module.exports = new QueryHandler();
