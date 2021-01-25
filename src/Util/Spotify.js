
const clientId = '9620190c0c814fe58e2fcf9beb2aa4b8';
const redirectURI = 'http://localhost:3000/';
let accessToken; 
const Spotify = {
	getAccessToken (){
		if(accessToken){
			return accessToken;
		}
		var accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
		var expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);
		if(accessTokenMatch && expiresInMatch){
			accessToken = accessTokenMatch[1];
			const expiresIn = Number(expiresInMatch[1]);

			window.setTimeout(() => accessToken = '', expiresIn * 1000);
			window.history.pushState('Access Token', null, '/');
			return accessToken;
		} else {
			const accessURL = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectURI}`
			window.location = accessURL;
		}
	},
	savePlaylist(name,uri) {
		if(!name || !uri.length) {
			return;
		}

		const accessToken = Spotify.getAccessToken();
		const headers = {
				Authorization: `Bearer ${accessToken}`
		};
		let userId;
		return fetch('https://api.spotify.com/v1/me',{headers:headers}).then(response => {
			return response.json();
		}).then(jsonResponse => {
			userId = jsonResponse.id;
			return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`,{
				headers : headers,
				method : 'POST',
				body : JSON.stringify({'name':name})

			}).then(response => {
				return response.json();
			}).then(jsonResponse => {
				const playlistID = jsonResponse.id;
				return fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistID}/tracks`,{
					headers: headers,
					method: 'POST',
					body: JSON.stringify( {'uri': uri} )
				})
			})
		})
	},
	search(term){
		const accessToken = Spotify.getAccessToken();
		return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`,{
			headers: {
				Authorization: `Bearer ${accessToken}`
			}
		}).then(response => {
			return response.json();
		}).then(jsonResponse => {
			if(!jsonResponse.tracks){
				return [];
			}
			return jsonResponse.tracks.items.map(track => { return {
				id: track.id,
				name: track.name,
				artist: track.artists[0].name,
				album: track.album.name,
				uri: track.uri
			}})
		});
	}
};


export default Spotify;