const queryHandler = require('./../handlers/query-handler');
const CONSTANTS = require('./../config/constants');
const passwordHash = require('./../utils/password-hash');

'use strict';
class RouteHandler{

	async userNameCheckHandler(request, response){
		const username = request.body.username;
		if (username === "") {
			response.status(CONSTANTS.SERVER_ERROR_HTTP_CODE).json({
				error : true,
				message : CONSTANTS.USERNAME_NOT_FOUND
			});
		} else {
			try {
				const count = await queryHandler.userNameCheck( {
					username : username.toLowerCase()
				});
				if (count > 0) {
					response.status(200).json({
						error : true,
						message : CONSTANTS.USERNAME_AVAILABLE_FAILED
					});
				} else {
					response.status(200).json({
						error : false,
						message : CONSTANTS.USERNAME_AVAILABLE_OK
					});
				}
			} catch ( error ){
				response.status(CONSTANTS.SERVER_ERROR_HTTP_CODE).json({
					error : true,
					message : CONSTANTS.SERVER_ERROR_MESSAGE
				});
			}
		}
	}

	async loginRouteHandler(request, response){
		const data = {
			username : (request.body.username).toLowerCase(),
			password : request.body.password
		};
		if(data.username === '' || data.username === null) {
			response.status(CONSTANTS.SERVER_ERROR_HTTP_CODE).json({
				error : true,
				message : CONSTANTS.USERNAME_NOT_FOUND
			});
		}else if(data.password === '' || data.password === null) {
			response.status(CONSTANTS.SERVER_ERROR_HTTP_CODE).json({
				error : true,
				message : CONSTANTS.PASSWORD_NOT_FOUND
			});
		} else {
			try {
				const result = await queryHandler.getUserByUsername(data.username);
				if(result ===  null || result === undefined) {
					response.status(CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE).json({
						error : true,
						message : CONSTANTS.USER_LOGIN_FAILED
					});
				} else {
					if( passwordHash.compareHash(data.password, result.password)) {
						await queryHandler.makeUserOnline(result._id);
						response.status(CONSTANTS.SERVER_OK_HTTP_CODE).json({
							error : false,
							userId : result._id,
							message : CONSTANTS.USER_LOGIN_OK
						});
					} else {
						response.status(CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE).json({
							error : true,
							message : CONSTANTS.USER_LOGIN_FAILED
						});
					}					
				}
			} catch (error) {
				response.status(CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE).json({
					error : true,
					message : CONSTANTS.USER_LOGIN_FAILED
				});
			}
		}
	}

	async registerRouteHandler(request, response){
		const data = {
			username : (request.body.username).toLowerCase(),
			password : request.body.password
		};
		if(data.username === '') {
			response.status(CONSTANTS.SERVER_ERROR_HTTP_CODE).json({
				error : true,
				message : CONSTANTS.USERNAME_NOT_FOUND
			});
		}else if(data.password === '') {
			response.status(CONSTANTS.SERVER_ERROR_HTTP_CODE).json({
				error : true,
				message : CONSTANTS.PASSWORD_NOT_FOUND
			});
		} else {
			try {
				data.online = 'Y' ;
				data.socketId = '' ;
				data.password = passwordHash.createHash(data.password);
				const result = await queryHandler.registerUser(data);
				if (result === null || result === undefined) {
					response.status(CONSTANTS.SERVER_OK_HTTP_CODE).json({
						error : false,
						message : CONSTANTS.USER_REGISTRATION_FAILED
					});	           			
				} else {
					response.status(CONSTANTS.SERVER_OK_HTTP_CODE).json({
						error : false,
						userId : result.insertedId,
						message : CONSTANTS.USER_REGISTRATION_OK
					});
				}		           	
			} catch ( error ) {
				response.status(CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE).json({
					error : true,
					message : CONSTANTS.SERVER_ERROR_MESSAGE
				});
			}
		}
	}

	async userSessionCheckRouteHandler(request, response){
		let userId = request.body.userId;
		if (userId === '') {
			response.status(CONSTANTS.SERVER_ERROR_HTTP_CODE).json({
				error : true,
				message : CONSTANTS.USERID_NOT_FOUND
			});
		} else {
			try {
				const result = await queryHandler.userSessionCheck({ userId : userId });
				response.status(CONSTANTS.SERVER_OK_HTTP_CODE).json({
					error : false,
					username : result.username,
					message : CONSTANTS.USER_LOGIN_OK
				});
			} catch(error) {
				response.status(CONSTANTS.SERVER_NOT_ALLOWED_HTTP_CODE).json({
					error : true,
					message : CONSTANTS.USER_NOT_LOGGED_IN
				});
			}
		}
	}

	async getMessagesRouteHandler(request, response){
		const userId = request.body.userId;
		const toUserId = request.body.toUserId;
		if (userId == '') {
			response.status(CONSTANTS.SERVER_ERROR_HTTP_CODE).json({
				error : true,
				message : CONSTANTS.USERID_NOT_FOUND
			});
		}else{
			try {
				const messagesResponse = await queryHandler.getMessages({
					userId:userId,
					toUserId: toUserId
				});
				response.status(CONSTANTS.SERVER_OK_HTTP_CODE).json({
					error : false,
					messages : messagesResponse
				});
			} catch ( error ){
				response.status(CONSTANTS.SERVER_NOT_ALLOWED_HTTP_CODE).json({
					error : true,
					messages : CONSTANTS.USER_NOT_LOGGED_IN
				});
			}
		}
	}

	routeNotFoundHandler(request, response){
		response.status(CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE).json({
			error : true,
			message : CONSTANTS.ROUTE_NOT_FOUND
		});
	}
}

module.exports = new RouteHandler();
