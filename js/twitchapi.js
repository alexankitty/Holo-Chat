//make this class an import of some sort.
class APIStorageObject{

	constructor(name, value = "", init = false) {
		this._name = name;
		this._value = value;
		if (init){
			this.value = this._value;
		}
	}

	set value(value) {
		this._value = value;
		localStorage.setItem(this._name, this._value);
	}

	get value() {
		return localStorage.getItem(this._name);
	}

	get name() {
		return this._name;
	}

	set valueAsDate(s) {
		var d = new Date();
		d.setSeconds(d.getSeconds() + s);
		this.value = d;
	}
}


class API {
	static ClientID = '<ClientID>';
	static Scope = '';
	static ClientSecret = '<ClientSecret>';
	static Token = new APIStorageObject("token");
	static Expiry = new APIStorageObject("expiry");
	static TokenType = new APIStorageObject("token_type");
	
	static async queryChannel(channel) {
		const tempHeader = new Headers({
			'Authorization': `Bearer ${API.Token.value}`,
			'Client-Id': API.ClientID //Switch this to the token generated in authorize()
			})
			return API.fetch({
				url: `https://api.twitch.tv/helix/users?login=${channel}`,
				method: "GET",
				headerobj: tempHeader
			})
			.then(result => {return result});
	}

	static async querySubs(channel) {
		const tempHeader = new Headers({
			'Authorization': `Bearer ${API.Token.value}`,
			'Client-Id': API.ClientID //Switch this to the token generated in authorize()
			})
		const params = {
			'broadcaster_id': this.queryChannel(channel)
		}
			return API.fetch({
				url: `https://api.twitch.tv/helix/subscriptions`,
				method: "GET",
				headerobj: tempHeader,
				paramobj: params,
				urlencode: true
			})
			.then(result => {return result});
	}
	
	static authorize() {
		var url = "https://id.twitch.tv/oauth2/token"
		var params = {
					'client_id': API.ClientID,
					'client_secret': API.ClientSecret,
					'grant_type': 'client_credentials',
					'scope': API.Scope
				}
				API.fetch({
					url: url,
					responseHandler: API.storeToken,
					method: "POST",
					paramobj: params,
					urlencode: true,
					authorizing: true
				})
	}

	static storeToken(obj) {
		API.Token.value = obj.access_token;
		API.Expiry.value = obj.expires_in;
		API.TokenType.Value = obj.token_type;
	}

	static async fetch({url, responseHandler, paramobj = {}, headerobj = {}, method = "GET", mode = 'cors', cache = 'default', credentials = 'same-origin', redirect = 'follow', referrerpolicy = 'no-referrer-when-downgrade', urlencode = false, authorizing = false}) {//And so it begins
		if (urlencode) {
			
			headerobj['Content-Type'] = 'application/x-www-form-urlencoded';
			url = this.urlEncoder(url, paramobj);
			
			paramobj = {};
		}
		else {
			headerobj['Content-Type'] = 'application/json';
		}
		let body;
		var fetchParam = new Object(
			{
				method: method,
				headers: headerobj,
				body: body = (method == "GET" && headerobj) ? undefined : paramobj,// check if this is a get request with headers - get doesn't support body
				mode: mode,
				redirect: redirect,
				referrerpolicy: referrerpolicy,
				cache: cache,
				credentials: credentials
			}
		)
		return fetch(url, fetchParam)
		.then(async(r) => {
			return await this.fetchError(r, url, fetchParam, authorizing); //Currently assuming we're only working with json requests, this may need to be built out to handle text as well.
		})
		.then((r) => {return r.json()})
		.then(obj => {
			if(responseHandler){
				responseHandler((method == "POST") ? obj : obj.data[0]);
			}
			return  (method == "POST") ? obj : obj.data[0];//sanitize if GET request (idk why the method adds wrapping.)
		})
		.catch(ex => {console.error(ex)})
	}

	static urlEncoder(url, params) {
		var urlmodify = new URL(url)
		Object.keys(params).forEach(key => urlmodify.searchParams.append(key, params[key]))
		return urlmodify.href;
	}

	static async fetchError(response, url, fetchParam, authorizing){
		if(!response.ok){ 
			switch(response.status){
				case 400: 
					console.error("400: Malformed request");
					throw new Error(response.error);
				case 401: 
					console.error("401: Unauthorized");
					if(!authorizing) {
						this.authorize();
					}
					return await this.fetchRetry(url,fetchParam, 3);
				default:
					throw new Error(response.error);
			}
			
		}
		return response;
	}

	static fetchRetry = async (url, options, n) => {
		let error;
		for (let i = 0; i < n; i++) {
			try {
				var r = await fetch(url, options);
				continue;
			} catch (err) {
				error = err;
			}
			if (r){
				console.log(r);
				return r;
			}
		}
		throw error;
	};
}